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

// ========================================
// STATE MANAGEMENT
// ========================================
const lobbyUsers = {};
const lobbyAdmins = {};
const socketToUser = {};
const games = {};
const activeConnections = new Map();

function debugLog(message, data = null) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] ${message}:`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}

// ========================================
// GAME LOGIC FUNCTIONS
// ========================================

function createDeck() {
  const deck = [];
  const suits = ['blue', 'red', 'green', 'yellow']; // Changed from hearts/diamonds/clubs/spades
  
  // Add numbered cards (1-13 for each suit)
  for (let suit of suits) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        suit: suit,
        rank: rank,
        value: rank,
        type: 'regular'
      });
    }
  }
  
  // Add special cards (4 Wizards and 4 Jesters)
  for (let i = 0; i < 4; i++) {
    deck.push({
      suit: null,
      rank: 'Zoro',
      value: 15,
      type: 'wizard'
    });
    deck.push({
      suit: null,
      rank: 'Fool',
      value: 0,
      type: 'jester'
    });
  }
  
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function initializeGame(playerNames) {
  debugLog('Initializing new game', { players: playerNames });
  
  try {
    const deck = createDeck();
    const gameId = Date.now();
    //const maxRounds = Math.min(Math.floor(60 / playerNames.length), 15);
    const maxRounds = 2;
    
    const players = playerNames.map((name, index) => ({
      id: name,
      name: name,
      hand: [],
      tricks: 0,
      tricksWon: 0,
      score: 0,
      prediction: null,
      isActive: true
    }));
    
    const game = {
      id: gameId,
      players: players,
      currentRound: 1,
      maxRounds: maxRounds,
      currentTrick: [],
      currentPlayerIndex: 0,
      trumpCard: null,
      trumpSuit: null,
      phase: 'prediction',
      roundScores: [],
      deck: deck,
      dealer: 0,
      isPaused: false
    };
    
    // Deal cards for first round
    dealCards(game);
    
    debugLog('Game initialized successfully', {
      gameId: game.id,
      playersCount: game.players.length,
      maxRounds: game.maxRounds,
      cardsInDeck: game.deck.length
    });
    
    return game;
  } catch (error) {
    debugLog('Error initializing game', { error: error.message });
    throw error;
  }
}

function dealCards(game) {
  try {
    const cardsPerPlayer = game.currentRound;
    debugLog(`Dealing ${cardsPerPlayer} cards to each of ${game.players.length} players`);
    
    // Reset hands
    game.players.forEach(player => {
      player.hand = [];
      player.prediction = null;
      player.tricksWon = 0;
    });
    
    // Deal cards
    for (let i = 0; i < cardsPerPlayer; i++) {
      for (let player of game.players) {
        if (game.deck.length > 0) {
          player.hand.push(game.deck.pop());
        }
      }
    }
    
    // Set trump card
    if (game.deck.length > 0) {
      game.trumpCard = game.deck.pop();
      game.trumpSuit = game.trumpCard.type === 'regular' ? game.trumpCard.suit : null;
    } else {
      game.trumpCard = null;
      game.trumpSuit = null;
    }
    
    // Set starting player (rotates each round)
    game.currentPlayerIndex = (game.dealer + 1) % game.players.length;
    
    debugLog(`Dealt ${cardsPerPlayer} cards to each player`, {
      trumpCard: game.trumpCard,
      trumpSuit: game.trumpSuit,
      startingPlayer: game.players[game.currentPlayerIndex].name
    });
    
  } catch (error) {
    debugLog('Error dealing cards', { error: error.message });
    throw error;
  }
}

function processPrediction(game, playerId, prediction) {
  try {
    debugLog('Processing prediction', { playerId, prediction, phase: game.phase });
    
    if (game.phase !== 'prediction') {
      debugLog('Invalid phase for prediction', { currentPhase: game.phase });
      return false;
    }
    
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
      debugLog('Player not found', { playerId });
      return false;
    }
    
    if (player.prediction !== null) {
      debugLog('Player already made prediction', { playerId, existingPrediction: player.prediction });
      return false;
    }
    
    if (prediction < 0 || prediction > game.currentRound) {
      debugLog('Invalid prediction value', { prediction, maxAllowed: game.currentRound });
      return false;
    }
    
    player.prediction = prediction;
    debugLog('Prediction recorded', { playerId, prediction });
    
    // Check if all players have made predictions
    const allPredictionsMade = game.players.every(p => p.prediction !== null);
    if (allPredictionsMade) {
      game.phase = 'playing';
      game.currentPlayerIndex = (game.dealer + 1) % game.players.length;
      debugLog('All predictions made, moving to playing phase');
    } else {
      // Move to next player
      do {
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
      } while (game.players[game.currentPlayerIndex].prediction !== null);
    }
    
    return true;
  } catch (error) {
    debugLog('Error processing prediction', { error: error.message });
    return false;
  }
}

function playCard(game, playerId, cardIndex) {
  try {
    debugLog('Processing card play', { playerId, cardIndex, phase: game.phase });
    
    if (game.phase !== 'playing') {
      debugLog('Invalid phase for card play', { currentPhase: game.phase });
      return false;
    }
    
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
      debugLog('Player not found', { playerId });
      return false;
    }
    
    if (game.players[game.currentPlayerIndex].id !== playerId) {
      debugLog('Not player turn', { 
        currentPlayer: game.players[game.currentPlayerIndex].id,
        attemptingPlayer: playerId 
      });
      return false;
    }
    
    if (cardIndex < 0 || cardIndex >= player.hand.length) {
      debugLog('Invalid card index', { cardIndex, handSize: player.hand.length });
      return false;
    }
    
    const card = player.hand[cardIndex];
    
    // Validate card play according to game rules
    if (!isValidCardPlay(game, player, card)) {
      debugLog('Invalid card play according to rules');
      return false;
    }
    
    // Remove card from hand and add to trick
    player.hand.splice(cardIndex, 1);
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    game.currentTrick.push({
      player: playerId,
      playerId: playerIndex,
      card: card
    });
    
    debugLog('Card played successfully', { 
      playerId, 
      card, 
      trickSize: game.currentTrick.length 
    });
    
    // Check if trick is complete
    if (game.currentTrick.length === game.players.length) {
      // Evaluate trick
      const winner = evaluateTrick(game);
      game.players[winner].tricksWon++;
      
      debugLog('Trick completed', { 
        winner: game.players[winner].name,
        tricksWon: game.players[winner].tricksWon 
      });
      
      // Clear trick and set winner as next starter
      game.currentTrick = [];
      game.currentPlayerIndex = winner;
      
      // Check if round is complete
      if (game.players[0].hand.length === 0) {
        calculateRoundScores(game);
        game.phase = 'scoring';
        debugLog('Round completed, moving to scoring phase');
      }
    } else {
      // Move to next player
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    }
    
    return true;
  } catch (error) {
    debugLog('Error processing card play', { error: error.message });
    return false;
  }
}

function isValidCardPlay(game, player, card) {
  // First card of trick can be anything
  if (game.currentTrick.length === 0) {
    return true;
  }
  
  const leadCard = game.currentTrick[0].card;
  const leadSuit = leadCard.suit;
  
  // Jester can be played anytime
  if (card.type === 'jester') {
    return true;
  }
  
  // Wizard can be played anytime
  if (card.type === 'wizard') {
    return true;
  }
  
  // If lead card is jester, any card can be played
  if (leadCard.type === 'jester') {
    return true;
  }
  
  // If lead card is wizard, any card can be played
  if (leadCard.type === 'wizard') {
    return true;
  }
  
  // Must follow suit if possible
  if (card.suit === leadSuit) {
    return true;
  }
  
  // Check if player has any cards of the lead suit
  const hasLeadSuit = player.hand.some(c => c.suit === leadSuit && c.type === 'regular');
  
  // If player doesn't have lead suit, any card is valid
  return !hasLeadSuit;
}

function evaluateTrick(game) {
  let winningPlay = game.currentTrick[0];
  let winnerIndex = 0;
  
  for (let i = 1; i < game.currentTrick.length; i++) {
    const currentPlay = game.currentTrick[i];
    
    if (beatsCard(currentPlay.card, winningPlay.card, game.trumpSuit)) {
      winningPlay = currentPlay;
      winnerIndex = i;
    }
  }
  
  return winningPlay.playerId;
}

function beatsCard(card1, card2, trumpSuit) {
  // Wizard beats everything
  if (card1.type === 'wizard') return true;
  if (card2.type === 'wizard') return false;
  
  // Everything beats jester
  if (card2.type === 'jester') return true;
  if (card1.type === 'jester') return false;
  
  // Trump beats non-trump
  const card1IsTrump = card1.suit === trumpSuit;
  const card2IsTrump = card2.suit === trumpSuit;
  
  if (card1IsTrump && !card2IsTrump) return true;
  if (!card1IsTrump && card2IsTrump) return false;
  
  // Same suit, higher value wins
  if (card1.suit === card2.suit) {
    return card1.value > card2.value;
  }
  
  // Different suits, card2 wins (was played first)
  return false;
}

function calculateRoundScores(game) {
  const roundScore = {
    round: game.currentRound,
    scores: []
  };
  
  for (let player of game.players) {
    let roundPoints = 0;
    
    if (player.prediction === player.tricksWon) {
      // Correct prediction: 20 + 10 per trick
      roundPoints = 20 + (player.prediction * 10);
    } else {
      // Wrong prediction: -10 per trick difference
      roundPoints = -10 * Math.abs(player.prediction - player.tricksWon);
    }
    
    player.score += roundPoints;
    
    roundScore.scores.push({
      player: player.name,
      score: roundPoints,
      tricks: player.tricksWon,
      prediction: player.prediction
    });
    
    debugLog('Round score calculated', {
      player: player.name,
      prediction: player.prediction,
      tricksWon: player.tricksWon,
      roundPoints: roundPoints,
      totalScore: player.score
    });
  }
  
  game.roundScores.push(roundScore);
}

function startNewRound(game) {
  try {
    game.currentRound++;
    
    if (game.currentRound > game.maxRounds) {
      game.phase = 'finished';
      debugLog('Game finished', { 
        finalScores: game.players.map(p => ({ name: p.name, score: p.score }))
      });
      return;
    }
    
    // Reset for new round
    game.currentTrick = [];
    game.phase = 'prediction';
    game.dealer = (game.dealer + 1) % game.players.length;
    
    // Create new deck and deal cards
    game.deck = createDeck();
    dealCards(game);
    
    debugLog('New round started', { 
      round: game.currentRound,
      dealer: game.players[game.dealer].name 
    });
  } catch (error) {
    debugLog('Error starting new round', { error: error.message });
    throw error;
  }
}

// ========================================
// SOCKET CONNECTION HANDLING
// ========================================
io.on('connection', (socket) => {
  // Track connection with better deduplication
  const existingConnection = Array.from(activeConnections.values())
    .find(conn => conn.userInfo && conn.userInfo.timestamp && 
          Date.now() - conn.userInfo.timestamp < 5000);
  
  if (existingConnection) {
    debugLog('Potential duplicate connection detected, closing', { 
      socketId: socket.id,
      existingSocketId: existingConnection.socketId 
    });
    socket.disconnect();
    return;
  }
  
  activeConnections.set(socket.id, {
    connectedAt: Date.now(),
    userInfo: null,
    socketId: socket.id
  });
  
  debugLog('New socket connection', { 
    socketId: socket.id,
    totalConnections: activeConnections.size
  });

  // Connection timeout for idle connections
  const connectionTimeout = setTimeout(() => {
    if (!socketToUser[socket.id]) {
      debugLog('Disconnecting idle connection', { socketId: socket.id });
      socket.disconnect();
    }
  }, 30000); // 30 seconds timeout

  // ========================================
  // LOBBY MANAGEMENT
  // ========================================
  
  socket.on('join lobby', ({ lobbyCode, user }) => {
    clearTimeout(connectionTimeout);
    
    debugLog('Join lobby request', { socketId: socket.id, lobbyCode, user });
    
    // Validate input parameters
    if (!lobbyCode || !user) {
      debugLog('Invalid lobby join parameters', { lobbyCode, user });
      socket.emit('error', 'Invalid lobby code or username');
      return;
    }

    if (user.length < 1 || user.length > 20) {
      debugLog('Invalid username length', { user, length: user.length });
      socket.emit('error', 'Username must be between 1 and 20 characters');
      return;
    }

    // Check existing mapping - allow reconnection
    const existingMapping = socketToUser[socket.id];
    if (existingMapping && 
        existingMapping.lobbyCode === lobbyCode && 
        existingMapping.user === user) {
      debugLog('Socket already correctly mapped', { socketId: socket.id });
      sendLobbyUsers(lobbyCode);
      return;
    }
    
    try {
      socket.join(lobbyCode);

      if (!lobbyUsers[lobbyCode]) {
        // Create new lobby
        lobbyUsers[lobbyCode] = [];
        lobbyAdmins[lobbyCode] = user;
        debugLog('Created new lobby', { lobbyCode, admin: user });
      }
      
      // Check for maximum lobby size
      const MAX_LOBBY_SIZE = 6;
      if (lobbyUsers[lobbyCode].length >= MAX_LOBBY_SIZE && !lobbyUsers[lobbyCode].includes(user)) {
        debugLog('Lobby is full', { lobbyCode, currentSize: lobbyUsers[lobbyCode].length });
        socket.emit('error', 'Lobby is full (maximum 6 players)');
        return;
      }
      
      // FIXED: Check if username is already taken in this lobby (but allow reconnection)
      if (lobbyUsers[lobbyCode].includes(user)) {
        // Check if this is a reconnection (same user, different socket)
        const existingUserSocket = Object.keys(socketToUser).find(id => 
          socketToUser[id].lobbyCode === lobbyCode && socketToUser[id].user === user
        );
        
        if (existingUserSocket && existingUserSocket !== socket.id) {
          debugLog('Username already taken by active user', { lobbyCode, user, existingSocket: existingUserSocket });
          socket.emit('error', 'Username already taken in this lobby');
          return;
        }
        
        debugLog('User rejoining lobby', { lobbyCode, user });
      } else {
        // Add new user to lobby
        lobbyUsers[lobbyCode].push(user);
        debugLog('Added new user to lobby', { lobbyCode, user, totalUsers: lobbyUsers[lobbyCode].length });
      }

      socketToUser[socket.id] = { lobbyCode, user };
      
      if (activeConnections.has(socket.id)) {
        activeConnections.get(socket.id).userInfo = { 
          lobbyCode, 
          user, 
          timestamp: Date.now() 
        };
      }
      
      debugLog('Successfully joined lobby', { 
        socketId: socket.id, 
        lobbyCode, 
        user,
        totalUsers: lobbyUsers[lobbyCode].length 
      });
      
      sendLobbyUsers(lobbyCode);
      
    } catch (err) {
      debugLog('Error joining lobby', { error: err.message, lobbyCode, user });
      socket.emit('error', 'Failed to join lobby. Please try again.');
    }
  });

  socket.on('leave lobby', ({ lobbyCode, user }) => {
    debugLog('Leave lobby request', { socketId: socket.id, lobbyCode, user });
    
    if (lobbyUsers[lobbyCode]) {
      lobbyUsers[lobbyCode] = lobbyUsers[lobbyCode].filter(u => u !== user);
      
      if (lobbyUsers[lobbyCode].length === 0) {
        delete lobbyUsers[lobbyCode];
        delete lobbyAdmins[lobbyCode];
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

  socket.on('remove user', ({ lobbyCode, user }) => {
    debugLog('Remove user request', { socketId: socket.id, lobbyCode, user });
    
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

  // ========================================
  // CHAT SYSTEM
  // ========================================
  
  socket.on('lobby message', ({ lobbyCode, user, text }) => {
    debugLog('Lobby message received', { lobbyCode, user, text });
    
    const messageData = {
      user,
      text,
      timestamp: Date.now(),
      id: Date.now().toString() + Math.random().toString(36).substr(2)
    };
    
    io.to(lobbyCode).emit('lobby message', messageData);
    
    debugLog('Lobby message broadcasted', { 
      lobbyCode, 
      messageId: messageData.id,
      user: messageData.user 
    });
  });

  // ========================================
  // GAME MANAGEMENT
  // ========================================

  socket.on('start game', ({ lobbyCode, username }) => {
    debugLog('START GAME REQUEST', { 
      socketId: socket.id, 
      lobbyCode, 
      username,
      socketMapping: socketToUser[socket.id],
      lobbyExists: !!lobbyUsers[lobbyCode],
      lobbyPlayers: lobbyUsers[lobbyCode],
      gameExists: !!games[lobbyCode]
    });
    
    try {
      if (!lobbyCode || !username) {
        socket.emit('error', 'Invalid lobby code or username');
        return;
      }

      if (!lobbyUsers[lobbyCode]) {
        socket.emit('error', 'Lobby not found');
        return;
      }

      const players = lobbyUsers[lobbyCode];
      debugLog('Lobby players found', { lobbyCode, players });
      
      if (players.length < 3) {
        socket.emit('error', 'Not enough players to start the game.');
        return;
      }

      if (!players.includes(username)) {
        socket.emit('error', 'You must be in the lobby to start the game.');
        return;
      }

      // Update socket mapping for game start
      socketToUser[socket.id] = { lobbyCode, user: username };
      debugLog('Updated socket mapping for game start', { 
        socketId: socket.id, 
        mapping: socketToUser[socket.id] 
      });

      if (games[lobbyCode]) {
        debugLog('Game already exists, sending current state', { lobbyCode });
        io.to(lobbyCode).emit('game update', games[lobbyCode]);
        return;
      }

      debugLog('Creating new game', { lobbyCode, players });
      games[lobbyCode] = initializeGame(players);
      
      const gameState = games[lobbyCode];
      if (gameState) {
        debugLog('Game created successfully', { 
          lobbyCode, 
          gameId: gameState.id,
          gamePlayers: gameState.players.map(p => p.name)
        });
        
        debugLog('Emitting game started and game update', { lobbyCode });
        io.to(lobbyCode).emit('game started', gameState);
        io.to(lobbyCode).emit('game update', gameState);
        
        debugLog('Game started successfully', { lobbyCode });
      } else {
        socket.emit('error', 'Failed to create game state.');
      }
    } catch (error) {
      debugLog('Error starting game', { error: error.message });
      socket.emit('error', 'Failed to start game. Please try again.');
    }
  });

  socket.on('join game', ({ lobbyCode, username }) => {
    debugLog('JOIN GAME REQUEST', {
      socketId: socket.id,
      lobbyCode,
      username,
      currentMapping: socketToUser[socket.id],
      gameExists: !!games[lobbyCode]
    });
    
    try {
      if (!lobbyCode) {
        socket.emit('error', 'Invalid lobby code');
        return;
      }

      const currentMapping = socketToUser[socket.id];
      if (currentMapping && 
          currentMapping.lobbyCode === lobbyCode && 
          currentMapping.user === username) {
        
        debugLog('Socket already correctly mapped, checking game state', {
          socketId: socket.id,
          mapping: currentMapping,
          gameExists: !!games[lobbyCode]
        });
        
        if (games[lobbyCode]) {
          debugLog('Sending existing game state', { lobbyCode });
          socket.emit('game update', games[lobbyCode]);
        }
        return;
      }
      
      if (games[lobbyCode]) {
        const game = games[lobbyCode];
        if (!game.players || !Array.isArray(game.players) || game.players.length === 0) {
          socket.emit('error', 'Game state is corrupted');
          return;
        }
        
        socket.join(lobbyCode);
        
        if (username) {
          socketToUser[socket.id] = { lobbyCode, user: username };
        }
        
        socket.emit('game update', game);
        socket.to(lobbyCode).emit('player rejoined', { 
          player: username,
          gameState: game 
        });
        
        debugLog('Player successfully joined game', { lobbyCode, username });
      } else {
        socket.emit('error', 'Game not found. Please start a new game from the lobby.');
      }
    } catch (error) {
      debugLog('Error joining game', { error: error.message });
      socket.emit('error', 'Failed to join game');
    }
  });

  // ========================================
  // GAME ACTIONS
  // ========================================

  socket.on('make prediction', ({ lobbyCode, prediction, username }) => {
    debugLog('Make prediction request', { lobbyCode, prediction, username });
    
    if (!games[lobbyCode]) {
      socket.emit('error', 'Game not found.');
      return;
    }

    const playerId = username || socketToUser[socket.id]?.user;
    if (!playerId) {
      socket.emit('error', 'User identification failed.');
      return;
    }

    if (username) {
      socketToUser[socket.id] = { lobbyCode, user: username };
    }

    if (processPrediction(games[lobbyCode], playerId, prediction)) {
      io.to(lobbyCode).emit('game update', games[lobbyCode]);
    } else {
      socket.emit('error', 'Invalid prediction.');
    }
  });

  socket.on('play card', ({ lobbyCode, cardIndex, username }) => {
    debugLog('Play card request', { lobbyCode, cardIndex, username });
    
    if (!games[lobbyCode]) {
      socket.emit('error', 'Game not found.');
      return;
    }

    const playerId = username || socketToUser[socket.id]?.user;
    if (!playerId) {
      socket.emit('error', 'User identification failed.');
      return;
    }

    if (username) {
      socketToUser[socket.id] = { lobbyCode, user: username };
    }

    if (playCard(games[lobbyCode], playerId, cardIndex)) {
      io.to(lobbyCode).emit('game update', games[lobbyCode]);
    } else {
      socket.emit('error', 'Invalid card play.');
    }
  });

  socket.on('next round', ({ lobbyCode, username }) => {
    debugLog('Next round request', { lobbyCode, username });
    
    if (games[lobbyCode] && games[lobbyCode].phase === 'scoring') {
      if (username) {
        socketToUser[socket.id] = { lobbyCode, user: username };
      }
      
      startNewRound(games[lobbyCode]);
      io.to(lobbyCode).emit('game update', games[lobbyCode]);
    } else {
      socket.emit('error', 'Cannot start next round.');
    }
  });

  // ========================================
  // ADMIN ACTIONS
  // ========================================

  socket.on('pause game', ({ lobbyCode, username, isPaused }) => {
    debugLog('Pause game request', { lobbyCode, username, isPaused });
    
    if (!games[lobbyCode]) {
      socket.emit('error', 'Game not found.');
      return;
    }

    const isAdmin = lobbyAdmins[lobbyCode] === username;
    if (!isAdmin) {
      socket.emit('error', 'Only admin can pause the game.');
      return;
    }

    games[lobbyCode].isPaused = isPaused;
    io.to(lobbyCode).emit('game paused', { isPaused, pausedBy: username });
    io.to(lobbyCode).emit('game update', games[lobbyCode]);
    
    debugLog('Game pause state updated', { lobbyCode, isPaused, pausedBy: username });
  });

  socket.on('restart game', ({ lobbyCode, username }) => {
    debugLog('Restart game request', { lobbyCode, username });
    
    if (!lobbyUsers[lobbyCode]) {
      socket.emit('error', 'Lobby not found.');
      return;
    }

    const isAdmin = lobbyAdmins[lobbyCode] === username;
    if (!isAdmin) {
      socket.emit('error', 'Only admin can restart the game.');
      return;
    }

    const players = lobbyUsers[lobbyCode];
    
    try {
      games[lobbyCode] = initializeGame(players);
      
      const gameState = games[lobbyCode];
      io.to(lobbyCode).emit('game restarted', { restartedBy: username });
      io.to(lobbyCode).emit('game started', gameState);
      io.to(lobbyCode).emit('game update', gameState);
      
      debugLog('Game restarted successfully', { lobbyCode, restartedBy: username });
    } catch (error) {
      debugLog('Error restarting game', { error: error.message });
      socket.emit('error', 'Failed to restart game.');
    }
  });

  socket.on('end game', ({ lobbyCode, username }) => {
    debugLog('End game request', { lobbyCode, username });
    
    if (!games[lobbyCode]) {
      socket.emit('error', 'Game not found.');
      return;
    }

    games[lobbyCode].phase = 'finished';
    
    io.to(lobbyCode).emit('game ended', { endedBy: username });
    io.to(lobbyCode).emit('game update', games[lobbyCode]);
    
    debugLog('Game ended', { lobbyCode, endedBy: username });
  });

  // ========================================
  // DISCONNECT HANDLING
  // ========================================

  socket.on('disconnect', (reason) => {
    clearTimeout(connectionTimeout);
    
    const info = socketToUser[socket.id];
    activeConnections.delete(socket.id);
    
    debugLog('Socket disconnected', { 
      socketId: socket.id, 
      userInfo: info,
      reason: reason,
      remainingConnections: activeConnections.size,
      wasInGame: info && games[info.lobbyCode] ? true : false
    });
    
    if (info) {
      const isGameActive = games[info.lobbyCode] && games[info.lobbyCode].phase !== 'finished';
      
      debugLog('Disconnect analysis', {
        lobbyCode: info.lobbyCode,
        user: info.user,
        isGameActive,
        gamePhase: games[info.lobbyCode]?.phase
      });
      
      // Only remove from lobby if game is not active (prevents removal during active games)
      if (lobbyUsers[info.lobbyCode] && !isGameActive) {
        lobbyUsers[info.lobbyCode] = lobbyUsers[info.lobbyCode].filter(u => u !== info.user);
        
        if (lobbyUsers[info.lobbyCode].length === 0) {
          delete lobbyUsers[info.lobbyCode];
          delete lobbyAdmins[info.lobbyCode];
          if (games[info.lobbyCode]) {
            delete games[info.lobbyCode];
          }
          debugLog('Lobby cleaned up (empty)', { lobbyCode: info.lobbyCode });
        } else if (lobbyAdmins[info.lobbyCode] === info.user) {
          lobbyAdmins[info.lobbyCode] = lobbyUsers[info.lobbyCode][0];
          debugLog('Admin transferred', { 
            lobbyCode: info.lobbyCode, 
            newAdmin: lobbyAdmins[info.lobbyCode] 
          });
        }
        sendLobbyUsers(info.lobbyCode);
      } else {
        debugLog('User not removed from lobby (game active or lobby not found)', {
          lobbyExists: !!lobbyUsers[info.lobbyCode],
          isGameActive
        });
      }
    }
    
    delete socketToUser[socket.id];
    debugLog('Cleaned up socket mapping', { socketId: socket.id });
  });
});

// ========================================
// HELPER FUNCTIONS
// ========================================

function sendLobbyUsers(lobbyCode) {
  if (lobbyUsers[lobbyCode]) {
    const data = {
      users: lobbyUsers[lobbyCode],
      admin: lobbyAdmins[lobbyCode]
    };
    debugLog('Sending lobby users update', { lobbyCode, data });
    io.to(lobbyCode).emit('lobby users', data);
  }
}

// ========================================
// PERIODIC CLEANUP
// ========================================

setInterval(() => {
  const stats = {
    activeConnections: activeConnections.size,
    activeLobbies: Object.keys(lobbyUsers).length,
    activeGames: Object.keys(games).length,
    socketMappings: Object.keys(socketToUser).length
  };
  
  debugLog('Server statistics', stats);
  
  // Clean up stale connections
  const now = Date.now();
  for (const [socketId, connection] of activeConnections.entries()) {
    if (now - connection.connectedAt > 300000) { // 5 minutes
      debugLog('Cleaning up stale connection', { socketId, age: now - connection.connectedAt });
      activeConnections.delete(socketId);
      if (socketToUser[socketId]) {
        delete socketToUser[socketId];
      }
    }
  }
}, 60000); // Run every minute

// ========================================
// SERVER STARTUP
// ========================================

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});