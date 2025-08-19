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

// Simple state management
const lobbyUsers = {};
const lobbyAdmins = {};
const socketToUser = {};
const games = {};

io.on('connection', (socket) => {
  
  // Join lobby
  socket.on('join lobby', ({ lobbyCode, user }) => {
    socket.join(lobbyCode);

    if (!lobbyUsers[lobbyCode]) {
      lobbyUsers[lobbyCode] = [];
      lobbyAdmins[lobbyCode] = user;
    }
    if (!lobbyUsers[lobbyCode].includes(user)) {
      lobbyUsers[lobbyCode].push(user);
    }

    socketToUser[socket.id] = { lobbyCode, user };
    sendLobbyUsers(lobbyCode);
  });

  // Lobby message
  socket.on('lobby message', ({ lobbyCode, user, text }) => {
    io.to(lobbyCode).emit('lobby message', { user, text });
  });

  // Leave lobby - SIMPLIFIED
  socket.on('leave lobby', ({ lobbyCode, user }) => {
    if (lobbyUsers[lobbyCode]) {
      lobbyUsers[lobbyCode] = lobbyUsers[lobbyCode].filter(u => u !== user);
      
      if (lobbyUsers[lobbyCode].length === 0) {
        delete lobbyUsers[lobbyCode];
        delete lobbyAdmins[lobbyCode];
        // Only delete game if it exists and is finished
        if (games[lobbyCode] && games[lobbyCode].phase === 'finished') {
          delete games[lobbyCode];
        }
      } else if (lobbyAdmins[lobbyCode] === user) {
        lobbyAdmins[lobbyCode] = lobbyUsers[lobbyCode][0];
      }
      sendLobbyUsers(lobbyCode);
    }
    delete socketToUser[socket.id];
    socket.leave(lobbyCode);
  });

  // Disconnect - SIMPLIFIED
  socket.on('disconnect', () => {
    const info = socketToUser[socket.id];
    if (info) {
      // Don't modify lobby users on disconnect during game
      if (lobbyUsers[info.lobbyCode] && (!games[info.lobbyCode] || games[info.lobbyCode].phase === 'finished')) {
        lobbyUsers[info.lobbyCode] = lobbyUsers[info.lobbyCode].filter(u => u !== info.user);
        
        if (lobbyUsers[info.lobbyCode].length === 0) {
          delete lobbyUsers[info.lobbyCode];
          delete lobbyAdmins[info.lobbyCode];
          if (games[info.lobbyCode]) {
            delete games[info.lobbyCode];
          }
        }
        sendLobbyUsers(info.lobbyCode);
      }
    }
    delete socketToUser[socket.id];
  });

  // Remove user
  socket.on('remove user', ({ lobbyCode, user }) => {
    if (lobbyUsers[lobbyCode]) {
      lobbyUsers[lobbyCode] = lobbyUsers[lobbyCode].filter(u => u !== user);
      
      if (lobbyUsers[lobbyCode].length === 0) {
        delete lobbyUsers[lobbyCode];
        delete lobbyAdmins[lobbyCode];
        delete games[lobbyCode];
      } else if (lobbyAdmins[lobbyCode] === user) {
        lobbyAdmins[lobbyCode] = lobbyUsers[lobbyCode][0];
      }
      sendLobbyUsers(lobbyCode);

      const socketId = Object.keys(socketToUser).find(id => 
        socketToUser[id].user === user && socketToUser[id].lobbyCode === lobbyCode
      );
      if (socketId) {
        io.to(socketId).emit('removed from lobby', { message: 'You were removed from the lobby.' });
      }
    }
  });

  // START GAME - SIMPLIFIED
  socket.on('start game', ({ lobbyCode }) => {
    console.log(`Starting game for lobby: ${lobbyCode}`);
    
    // Just create the game - don't check lobby users
    if (!games[lobbyCode]) {
      // Get players from either lobby or existing game
      const players = lobbyUsers[lobbyCode] || ['Player1', 'Player2', 'Player3']; // Fallback
      
      if (players.length < 3) {
        socket.emit('error', { message: 'Not enough players to start the game.' });
        return;
      }

      games[lobbyCode] = initializeGame(players);
      console.log(`Game created for lobby ${lobbyCode}`);
    }

    // Send to all sockets in the room
    io.to(lobbyCode).emit('game started', games[lobbyCode]);
    io.to(lobbyCode).emit('game update', games[lobbyCode]);
    
    console.log(`Game started successfully for lobby ${lobbyCode}`);
  });

  // JOIN GAME - SIMPLIFIED
  socket.on('join game', ({ lobbyCode }) => {
    console.log(`Player attempting to join game in lobby: ${lobbyCode}`);
    
    // Just join if game exists, create if it doesn't but lobby has users
    if (games[lobbyCode]) {
      socket.join(lobbyCode);
      console.log(`Player joined existing game: ${lobbyCode}`);
      socket.emit('game update', games[lobbyCode]);
    } else {
      console.log(`No game found for lobby: ${lobbyCode}`);
      socket.emit('error', { message: 'Game not found. Please start a new game from the lobby.' });
    }
  });

  // MAKE PREDICTION - SIMPLIFIED
  socket.on('make prediction', ({ lobbyCode, prediction }) => {
    console.log(`Make prediction: ${prediction} for lobby: ${lobbyCode}`);
    
    if (!games[lobbyCode]) {
      socket.emit('error', { message: 'Game not found.' });
      return;
    }

    const userInfo = socketToUser[socket.id];
    if (!userInfo) {
      socket.emit('error', { message: 'User not found.' });
      return;
    }

    if (processPrediction(games[lobbyCode], userInfo.user, prediction)) {
      io.to(lobbyCode).emit('game update', games[lobbyCode]);
    } else {
      socket.emit('error', { message: 'Invalid prediction.' });
    }
  });

  // PLAY CARD - SIMPLIFIED
  socket.on('play card', ({ lobbyCode, cardIndex }) => {
    if (!games[lobbyCode]) {
      socket.emit('error', { message: 'Game not found.' });
      return;
    }

    const userInfo = socketToUser[socket.id];
    if (!userInfo) {
      socket.emit('error', { message: 'User not found.' });
      return;
    }

    if (playCard(games[lobbyCode], userInfo.user, cardIndex)) {
      io.to(lobbyCode).emit('game update', games[lobbyCode]);
    } else {
      socket.emit('error', { message: 'Invalid card play.' });
    }
  });

  // NEXT ROUND - SIMPLIFIED
  socket.on('next round', ({ lobbyCode }) => {
    if (games[lobbyCode] && games[lobbyCode].phase === 'scoring') {
      startNewRound(games[lobbyCode]);
      io.to(lobbyCode).emit('game update', games[lobbyCode]);
    } else {
      socket.emit('error', { message: 'Cannot start next round.' });
    }
  });
});

// Helper functions
function sendLobbyUsers(lobbyCode) {
  if (lobbyUsers[lobbyCode]) {
    io.to(lobbyCode).emit('lobby users', {
      users: lobbyUsers[lobbyCode],
      admin: lobbyAdmins[lobbyCode]
    });
  }
}

// Game logic functions - SIMPLIFIED
function initializeGame(players) {
  const game = {
    id: Date.now(),
    players: players.map((name, index) => ({
      id: name,
      name: name,
      hand: [],
      tricks: 0,
      tricksWon: 0,
      score: 0,
      prediction: null,
      isActive: index === 0
    })),
    currentRound: 1,
    maxRounds: 20,
    currentTrick: [],
    currentPlayerIndex: 0,
    trumpCard: null,
    trumpSuit: null,
    deck: [],
    phase: 'prediction',
    roundScores: [],
    dealer: 0
  };
  
  dealCards(game);
  return game;
}

function dealCards(game) {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  
  game.deck = [];
  
  // Regular cards
  suits.forEach(suit => {
    values.forEach(value => {
      game.deck.push({ 
        suit, 
        value, 
        type: 'regular',
        rank: value
      });
    });
  });
  
  // Special cards
  for (let i = 0; i < 4; i++) {
    game.deck.push({ 
      type: 'wizard', 
      suit: null, 
      value: 15,
      rank: 'Zoro'
    });
    game.deck.push({ 
      type: 'jester', 
      suit: null, 
      value: 0,
      rank: 'Fool'
    });
  }
  
  // Shuffle deck
  for (let i = game.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
  }
  
  // Deal cards to players
  game.players.forEach(player => {
    player.hand = game.deck.splice(0, game.currentRound);
    player.prediction = null;
    player.tricks = 0;
    player.tricksWon = 0;
  });
  
  // Set trump card
  if (game.deck.length > 0) {
    game.trumpCard = game.deck.pop();
    game.trumpSuit = game.trumpCard.type === 'regular' ? game.trumpCard.suit : null;
  } else {
    game.trumpCard = null;
    game.trumpSuit = null;
  }
}

function processPrediction(game, playerId, prediction) {
  console.log(`Processing prediction for ${playerId}: ${prediction}`);
  
  const player = game.players.find(p => p.id === playerId);
  const currentPlayer = game.players[game.currentPlayerIndex];
  
  if (!player || game.phase !== 'prediction') {
    console.log(`Invalid game state - phase: ${game.phase}, player found: ${!!player}`);
    return false;
  }
  
  // Check if it's actually this player's turn
  if (currentPlayer.id !== playerId) {
    console.log(`Not player's turn. Current: ${currentPlayer.id}, Requesting: ${playerId}`);
    return false;
  }
  
  if (player.prediction !== null) {
    console.log(`Player ${playerId} already made prediction: ${player.prediction}`);
    return false;
  }

  // Validate prediction range
  if (prediction < 0 || prediction > game.currentRound) {
    console.log(`Invalid prediction range: ${prediction}, max: ${game.currentRound}`);
    return false;
  }
  
  player.prediction = prediction;
  console.log(`Prediction set for ${playerId}: ${prediction}`);
  
  // Move to next player for prediction
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  console.log(`Next player index: ${game.currentPlayerIndex}`);
  
  // Check if all predictions are made
  const allPredicted = game.players.every(p => p.prediction !== null);
  console.log(`All predictions made: ${allPredicted}`);
  
  if (allPredicted) {
    // Add delay before moving to playing phase
    setTimeout(() => {
      game.phase = 'playing';
      game.currentPlayerIndex = (game.dealer + 1) % game.players.length; // Start playing after dealer
      console.log(`Moving to playing phase, starting with player index: ${game.currentPlayerIndex}`);
      
      // Broadcast the updated game state
      const lobbyCode = Object.keys(games).find(key => games[key] === game);
      if (lobbyCode) {
        io.to(lobbyCode).emit('game update', game);
      }
    }, 2000); // 2 second delay
  }
  
  return true;
}

function playCard(game, playerId, cardIndex) {
  const player = game.players.find(p => p.id === playerId);
  
  if (!player || game.phase !== 'playing' || 
      game.players[game.currentPlayerIndex].id !== playerId ||
      cardIndex < 0 || cardIndex >= player.hand.length) {
    return false;
  }
  
  const card = player.hand.splice(cardIndex, 1)[0];
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  game.currentTrick.push({ 
    player: playerId, 
    playerId: playerIndex,
    card 
  });
  
  // Move to next player
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  
  // Check if trick is complete
  if (game.currentTrick.length === game.players.length) {
    // Add delay before finishing trick
    setTimeout(() => {
      finishTrick(game);
      
      // Broadcast the updated game state
      const lobbyCode = Object.keys(games).find(key => games[key] === game);
      if (lobbyCode) {
        io.to(lobbyCode).emit('game update', game);
      }
    }, 2000); // 2 second delay to see the completed trick
  }
  
  return true;
}

function finishTrick(game) {
  const winner = determineTrickWinner(game.currentTrick, game.trumpSuit);
  const winnerIndex = game.players.findIndex(p => p.id === winner);
  
  game.players[winnerIndex].tricks++;
  game.players[winnerIndex].tricksWon++;
  
  game.currentTrick = [];
  game.currentPlayerIndex = winnerIndex;
  
  // Check if round is complete
  if (game.players[0].hand.length === 0) {
    // Add delay before showing scoring
    setTimeout(() => {
      finishRound(game);
      
      // Broadcast the updated game state
      const lobbyCode = Object.keys(games).find(key => games[key] === game);
      if (lobbyCode) {
        io.to(lobbyCode).emit('game update', game);
      }
    }, 1500); // 1.5 second delay
  }
}

function determineTrickWinner(trick, trumpSuit) {
  // Wizard wins
  const wizards = trick.filter(play => play.card.type === 'wizard');
  if (wizards.length > 0) return wizards[0].player;
  
  // Filter out jesters
  const validPlays = trick.filter(play => play.card.type !== 'jester');
  if (validPlays.length === 0) return trick[0].player;
  
  // Trump cards win
  const trumpPlays = validPlays.filter(play => play.card.suit === trumpSuit);
  if (trumpPlays.length > 0) {
    return trumpPlays.reduce((winner, play) => 
      play.card.value > winner.card.value ? play : winner
    ).player;
  }
  
  // Highest card of led suit wins
  const ledSuit = validPlays[0].card.suit;
  const sameSuitPlays = validPlays.filter(play => play.card.suit === ledSuit);
  
  return sameSuitPlays.reduce((winner, play) => 
    play.card.value > winner.card.value ? play : winner
  ).player;
}

function finishRound(game) {
  // Calculate scores
  game.players.forEach(player => {
    if (player.tricks === player.prediction) {
      player.score += 20 + (10 * player.prediction);
    } else {
      player.score -= 10 * Math.abs(player.tricks - player.prediction);
    }
  });
  
  if (game.currentRound >= game.maxRounds) {
    game.phase = 'finished';
  } else {
    game.phase = 'scoring';
  }
}

function startNewRound(game) {
  game.currentRound++;
  game.phase = 'prediction';
  game.currentPlayerIndex = (game.dealer + 1) % game.players.length;
  game.dealer = (game.dealer + 1) % game.players.length;

  // Reset player round stats
  game.players.forEach(player => {
    player.tricks = 0;
    player.tricksWon = 0;
    player.prediction = null;
  });

  dealCards(game);
}

// API endpoint
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