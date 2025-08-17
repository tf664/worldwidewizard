const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Lobby and game state management
const lobbyUsers = {};
const lobbyAdmins = {};
const socketToUser = {};
const games = {};



//Socket.IO connection handling

io.on('connection', (socket) => {
  socket.on('join lobby', ({ lobbyCode, user }) => {
    socket.join(lobbyCode);

    // Join a lobby
    if (!lobbyUsers[lobbyCode]) {
      lobbyUsers[lobbyCode] = [];
      lobbyAdmins[lobbyCode] = user; // Der erste Nutzer wird Admin
    }
    if (!lobbyUsers[lobbyCode].includes(user)) lobbyUsers[lobbyCode].push(user);

    socketToUser[socket.id] = { lobbyCode, user };
    sendLobbyUsers(lobbyCode);
  });

  socket.on('lobby message', ({ lobbyCode, user, text }) => {
    io.to(lobbyCode).emit('lobby message', { user, text });
  });

  socket.on('leave lobby', ({ lobbyCode, user }) => {
    if (lobbyUsers[lobbyCode]) {
      lobbyUsers[lobbyCode] = lobbyUsers[lobbyCode].filter(u => u !== user);
      if (lobbyUsers[lobbyCode].length === 0) {
        delete lobbyUsers[lobbyCode];
        delete lobbyAdmins[lobbyCode];
      } else if (lobbyAdmins[lobbyCode] === user) {
        lobbyAdmins[lobbyCode] = lobbyUsers[lobbyCode][0]; // Neuer Admin
      }
      sendLobbyUsers(lobbyCode);
    }
    delete socketToUser[socket.id];
    socket.leave(lobbyCode);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const info = socketToUser[socket.id];
    if (info && lobbyUsers[info.lobbyCode]) {
      lobbyUsers[info.lobbyCode] = lobbyUsers[info.lobbyCode].filter(u => u !== info.user);
      if (lobbyUsers[info.lobbyCode].length === 0) {
        delete lobbyUsers[info.lobbyCode];
        delete lobbyAdmins[info.lobbyCode];
        delete games[info.lobbyCode];
      } else if (lobbyAdmins[info.lobbyCode] === info.user) {
        lobbyAdmins[info.lobbyCode] = lobbyUsers[info.lobbyCode][0];
      }
      sendLobbyUsers(info.lobbyCode);
    }
    delete socketToUser[socket.id];
  });

  socket.on('remove user', ({ lobbyCode, user }) => {
    if (lobbyUsers[lobbyCode]) {
      lobbyUsers[lobbyCode] = lobbyUsers[lobbyCode].filter(u => u !== user);
      if (lobbyUsers[lobbyCode].length === 0) {
        delete lobbyUsers[lobbyCode];
        delete lobbyAdmins[lobbyCode];
      } else if (lobbyAdmins[lobbyCode] === user) {
        lobbyAdmins[lobbyCode] = lobbyUsers[lobbyCode][0]; // Neuer Admin
      }
      sendLobbyUsers(lobbyCode);

      const socketId = Object.keys(socketToUser).find(id => socketToUser[id].user === user && socketToUser[id].lobbyCode === lobbyCode);
        if (socketId) {
            io.to(socketId).emit('removed from lobby', { message: 'Du wurdest aus der Lobby entfernt.' });
        }
    }
  });




  //Game Funktionen
  socket.on('join game', ({ lobbyCode }) => {
    if (games[lobbyCode]) {
      socket.join(lobbyCode);
      socket.emit('game update', games[lobbyCode]);
    }
  });

  // Start the game
  socket.on('start game', ({ lobbyCode }) => {
  if (!games[lobbyCode]) {
    const players = lobbyUsers[lobbyCode];
    if (!players || players.length < 3) { // Ensure there are enough players
      socket.emit('error', { message: 'Not enough players to start the game.' });
      return;
    }

    games[lobbyCode] = initializeGame(players);
    console.log(`Game started for lobby ${lobbyCode}`);
  }

  // Ensure the admin stays in the lobby
  const adminSocketId = Object.keys(socketToUser).find(
    id => socketToUser[id].user === lobbyAdmins[lobbyCode] && socketToUser[id].lobbyCode === lobbyCode
  );
  if (adminSocketId) {
    io.to(adminSocketId).emit('game started', games[lobbyCode]);
  }

  // Broadcast the game state to all players in the lobby
  io.to(lobbyCode).emit('game started', games[lobbyCode]);
});


// Player action
  socket.on('player action', ({ lobbyCode, action }) => {
    if (games[lobbyCode]) {
      const gameState = games[lobbyCode];
      let updated = false;
      if (action.type === 'makePrediction') {
        updated = processPrediction(gameState, action.playerId, action.prediction);
      } else if (action.type === 'playCard') {
        updated = playCard(gameState, action.playerId, action.cardIndex);
      } else if (action.type === 'nextRound') {
        startNewRound(gameState);
        updated = true;
      }
      if (updated) io.to(lobbyCode).emit('game update', gameState);
      else socket.emit('error', { message: 'Invalid move.' });
    }
  });

  








  // Lobby verlassen oder Spiel beenden
  socket.on('leave lobby', ({ lobbyCode, user }) => {
    if (games[lobbyCode] && lobbyUsers[lobbyCode] && lobbyUsers[lobbyCode].length === 0) {
      delete games[lobbyCode]; // Delete the game if no players are left
    }
  });




});



  








  


// Hilfsfunktion: Nutzerliste und Admin senden
function sendLobbyUsers(lobbyCode) {
  if (lobbyUsers[lobbyCode]) {
    console.log(`Lobby ${lobbyCode} Users:`, lobbyUsers[lobbyCode]);
    console.log(`Lobby ${lobbyCode} Admin:`, lobbyAdmins[lobbyCode]);
    io.to(lobbyCode).emit('lobby users', {
      users: lobbyUsers[lobbyCode],
      admin: lobbyAdmins[lobbyCode]
    });
  }
}

app.get('/lobby/:lobbyCode', (req, res) => {
  const { lobbyCode } = req.params;
  if (lobbyUsers[lobbyCode]) {
    res.json({ users: lobbyUsers[lobbyCode], admin: lobbyAdmins[lobbyCode] });
  } else {
    res.status(404).json({ error: 'Lobby not found' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('Socket.IO server running on port', PORT);
});