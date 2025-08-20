import { writable, get } from 'svelte/store';
import { io, type Socket } from 'socket.io-client';

// Storage keys
const GAME_STATE_KEY = 'wizard_game_state';
const LOBBY_CODE_KEY = 'wizard_lobby_code';
const USERNAME_KEY = 'wizard_username';
const TAB_ID_KEY = 'wizard_tab_id';
const CHAT_MESSAGES_KEY = 'wizard_chat_messages';
const CHAT_READ_TIMESTAMP_KEY = 'wizard_chat_read_timestamp';

// ========================================
// INTERFACES
// ========================================

export interface GameState {
  id: number;
  players: Player[];
  currentRound: number;
  maxRounds: number;
  currentTrick: TrickPlay[];
  currentPlayerIndex: number;
  trumpCard: Card | null;
  trumpSuit: string | null;
  phase: 'prediction' | 'playing' | 'scoring' | 'finished';
  roundScores: RoundScore[];
  deck: Card[];
  dealer: number;
  isPaused?: boolean;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  tricks: number;
  tricksWon: number;
  score: number;
  prediction: number | null;
  isActive: boolean;
}

export interface Card {
  suit?: string;
  value: number;
  type: 'regular' | 'wizard' | 'jester';
  rank: string | number;
}

export interface TrickPlay {
  player: string;
  playerId: number;
  card: Card;
}

export interface RoundScore {
  round: number;
  scores?: Array<{
    player: string;
    score: number;
    tricks: number;
    prediction: number;
  }>;
}

export interface LobbyMessage {
  user: string;
  text: string;
}

export interface StoredLobbyMessage extends LobbyMessage {
  id: string;
  timestamp: number;
  read: boolean;
}

export interface ChatState {
  messages: StoredLobbyMessage[];
  unreadCount: number;
  lastReadTimestamp: number;
}

// ========================================
// STORES
// ========================================

export const gameState = writable<GameState | null>(null);
export const connectionStatus = writable<'disconnected' | 'connecting' | 'connected'>('disconnected');
export const error = writable<string | null>(null);
export const isReconnecting = writable<boolean>(false);
export const chatMessages = writable<StoredLobbyMessage[]>([]);
export const unreadMessageCount = writable<number>(0);

// ========================================
// STORAGE UTILITIES
// ========================================

function getTabId(): string {
  let tabId = sessionStorage.getItem(TAB_ID_KEY);
  if (!tabId) {
    tabId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem(TAB_ID_KEY, tabId);
  }
  return tabId;
}

function saveGameData(gameState: GameState | null, lobbyCode: string, username: string) {
  const tabId = getTabId();
  
  if (typeof localStorage !== 'undefined') {
    if (gameState) localStorage.setItem(`${GAME_STATE_KEY}_${tabId}`, JSON.stringify(gameState));
    if (lobbyCode) localStorage.setItem(`${LOBBY_CODE_KEY}_${tabId}`, lobbyCode);
    if (username) localStorage.setItem(`${USERNAME_KEY}_${tabId}`, username);
  }
  
  if (typeof sessionStorage !== 'undefined') {
    if (gameState) sessionStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    if (lobbyCode) sessionStorage.setItem(LOBBY_CODE_KEY, lobbyCode);
    if (username) sessionStorage.setItem(USERNAME_KEY, username);
  }
}

function loadGameData() {
  const tabId = getTabId();
  
  if (typeof localStorage !== 'undefined') {
    const savedState = localStorage.getItem(`${GAME_STATE_KEY}_${tabId}`);
    const savedLobby = localStorage.getItem(`${LOBBY_CODE_KEY}_${tabId}`);
    const savedUsername = localStorage.getItem(`${USERNAME_KEY}_${tabId}`);
    
    if (savedState || savedLobby || savedUsername) {
      return {
        gameState: savedState ? JSON.parse(savedState) : null,
        lobbyCode: savedLobby,
        username: savedUsername
      };
    }
  }
  
  if (typeof sessionStorage !== 'undefined') {
    const savedState = sessionStorage.getItem(GAME_STATE_KEY);
    const savedLobby = sessionStorage.getItem(LOBBY_CODE_KEY);
    const savedUsername = sessionStorage.getItem(USERNAME_KEY);
    
    return {
      gameState: savedState ? JSON.parse(savedState) : null,
      lobbyCode: savedLobby,
      username: savedUsername
    };
  }
  
  return { gameState: null, lobbyCode: null, username: null };
}

function clearGameData() {
  const tabId = getTabId();
  
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(`${GAME_STATE_KEY}_${tabId}`);
    localStorage.removeItem(`${LOBBY_CODE_KEY}_${tabId}`);
    localStorage.removeItem(`${USERNAME_KEY}_${tabId}`);
  }
  
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(GAME_STATE_KEY);
    sessionStorage.removeItem(LOBBY_CODE_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
  }
}

function saveChatData(tabId: string, lobbyCode: string, messages: StoredLobbyMessage[], lastReadTimestamp: number) {
  if (typeof localStorage !== 'undefined') {
    const chatKey = `${CHAT_MESSAGES_KEY}_${tabId}_${lobbyCode}`;
    const readKey = `${CHAT_READ_TIMESTAMP_KEY}_${tabId}_${lobbyCode}`;
    
    localStorage.setItem(chatKey, JSON.stringify(messages));
    localStorage.setItem(readKey, lastReadTimestamp.toString());
  }
}

function loadChatData(tabId: string, lobbyCode: string): ChatState {
  if (typeof localStorage !== 'undefined') {
    const chatKey = `${CHAT_MESSAGES_KEY}_${tabId}_${lobbyCode}`;
    const readKey = `${CHAT_READ_TIMESTAMP_KEY}_${tabId}_${lobbyCode}`;
    
    const messagesJson = localStorage.getItem(chatKey);
    const lastReadStr = localStorage.getItem(readKey);
    
    const messages: StoredLobbyMessage[] = messagesJson ? JSON.parse(messagesJson) : [];
    const lastReadTimestamp = lastReadStr ? parseInt(lastReadStr) : 0;
    const unreadCount = messages.filter(msg => !msg.read && msg.timestamp > lastReadTimestamp).length;
    
    return { messages, unreadCount, lastReadTimestamp };
  }
  
  return { messages: [], unreadCount: 0, lastReadTimestamp: 0 };
}

// ========================================
// SOCKET SERVICE CLASS
// ========================================

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private currentLobbyCode: string | null = null;
  private currentUsername: string | null = null;
  private isConnecting = false;
  private hasJoinedLobby = false;
  private connectionPromise: Promise<void> | null = null;
  private isDestroyed = false;
  
  // Chat-related properties
  private messageCallbacks: ((message: LobbyMessage) => void)[] = [];
  private lobbyUsersCallbacks: ((data: { users: string[], admin: string }) => void)[] = [];
  private storedMessages: Map<string, StoredLobbyMessage[]> = new Map();
  private lastReadTimestamp: number = 0;

  private debugLog(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[SOCKET ${timestamp}] ${message}:`, data);
    } else {
      console.log(`[SOCKET ${timestamp}] ${message}`);
    }
  }

  // ========================================
  // CONNECTION MANAGEMENT
  // ========================================

  connect(lobbyCode?: string, username?: string): Promise<void> {
    this.debugLog('Connect called', { 
      lobbyCode, 
      username, 
      isConnected: this.socket?.connected,
      isConnecting: this.isConnecting,
      isDestroyed: this.isDestroyed
    });

    if (this.isDestroyed) {
      return Promise.reject(new Error('Service is destroyed'));
    }

    if (this.socket?.connected && 
        this.currentLobbyCode === lobbyCode && 
        this.currentUsername === username) {
      this.debugLog('Already connected to same lobby/username');
      return Promise.resolve();
    }

    if (this.socket?.connected && 
        (this.currentLobbyCode !== lobbyCode || this.currentUsername !== username)) {
      this.debugLog('Connected to different lobby/username, disconnecting first');
      this.disconnect();
    }

    if (this.connectionPromise) {
      this.debugLog('Connection already in progress');
      return this.connectionPromise;
    }

    this.connectionPromise = this.createConnection(lobbyCode, username);
    return this.connectionPromise;
  }

  private createConnection(lobbyCode?: string, username?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.isConnecting = true;
      connectionStatus.set('connecting');
      
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      this.debugLog('Creating new socket connection');
      this.socket = io('http://localhost:3001', {
        forceNew: true,
        timeout: 5000,
        autoConnect: true
      });

      const connectionTimeout = setTimeout(() => {
        this.debugLog('Connection timeout');
        this.cleanup();
        reject(new Error('Connection timeout'));
      }, 10000);

      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        this.debugLog('Connected to server');
        connectionStatus.set('connected');
        isReconnecting.set(false);
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.connectionPromise = null;
        
        if (lobbyCode) this.currentLobbyCode = lobbyCode;
        if (username) this.currentUsername = username;
        
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(connectionTimeout);
        this.debugLog('Connection error', error);
        this.cleanup();
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        this.debugLog('Disconnected from server', { reason, isDestroyed: this.isDestroyed });
        connectionStatus.set('disconnected');
        this.isConnecting = false;
        this.hasJoinedLobby = false;
        
        if (reason !== 'io client disconnect' && !this.isDestroyed) {
          this.handleReconnection();
        }
      });

      this.setupEventListeners(lobbyCode);
    });
  }

  private cleanup() {
    this.isConnecting = false;
    this.connectionPromise = null;
    connectionStatus.set('disconnected');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private handleReconnection() {
    const saved = loadGameData();
    if (saved.gameState && this.reconnectAttempts < this.maxReconnectAttempts) {
      isReconnecting.set(true);
      this.reconnectAttempts++;
      this.debugLog(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.connect(saved.lobbyCode || undefined, saved.username || undefined);
        }
      }, 2000);
    } else {
      isReconnecting.set(false);
    }
  }

  private setupEventListeners(lobbyCode?: string) {
    if (!this.socket) return;

    this.socket.on('error', (err: any) => {
      console.error('Socket error:', err);
      let errorMessage: string;
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        errorMessage = err.message || err.error || JSON.stringify(err);
      } else {
        errorMessage = 'Unknown connection error occurred';
      }
      
      error.set(errorMessage);
    });

    this.socket.on('game update', (state: GameState) => {
      try {
        this.debugLog('Game state updated', { phase: state.phase, currentPlayerIndex: state.currentPlayerIndex });
        
        if (!state || !state.players || !Array.isArray(state.players)) {
          throw new Error('Invalid game state received');
        }

        if (typeof state.currentPlayerIndex !== 'number' || 
            state.currentPlayerIndex < 0 || 
            state.currentPlayerIndex >= state.players.length) {
          state.currentPlayerIndex = 0;
        }
        
        gameState.set(state);
        
        const saved = loadGameData();
        if (saved.lobbyCode && saved.username) {
          saveGameData(state, saved.lobbyCode, saved.username);
        }
      } catch (err) {
        console.error('Error processing game update:', err);
        error.set('Failed to update game state');
      }
    });

    this.socket.on('game started', (state: GameState) => {
      try {
        this.debugLog('Game started', { gameId: state.id });
        
        if (!state || !state.players || !Array.isArray(state.players)) {
          throw new Error('Invalid game state received on start');
        }
        
        gameState.set(state);
        
        const saved = loadGameData();
        if (saved.lobbyCode && saved.username) {
          saveGameData(state, saved.lobbyCode, saved.username);
        }
      } catch (err) {
        console.error('Error processing game start:', err);
        error.set('Failed to start game');
      }
    });

    this.socket.on('player rejoined', (data: { player: string; gameState: GameState }) => {
      this.debugLog(`Player ${data.player} rejoined the game`);
      gameState.set(data.gameState);
    });

    this.socket.on('game paused', (data: { isPaused: boolean; pausedBy: string }) => {
      this.debugLog('Game pause state changed', data);
      const currentState = get(gameState);
      if (currentState) {
        currentState.isPaused = data.isPaused;
        gameState.set(currentState);
      }
    });

    this.socket.on('game restarted', (data: { restartedBy: string }) => {
      this.debugLog('Game restarted', data);
    });

    this.socket.on('game ended', (data: { endedBy: string }) => {
      this.debugLog('Game ended', data);
    });

    // Chat event listeners
    this.socket.on('lobby message', (msg: LobbyMessage) => {
      if (!lobbyCode) return;
      
      const storedMessage: StoredLobbyMessage = {
        ...msg,
        id: Date.now().toString() + Math.random().toString(36).substr(2),
        timestamp: Date.now(),
        read: false
      };
      
      const currentMessages = this.storedMessages.get(lobbyCode) || [];
      const updatedMessages = [...currentMessages, storedMessage];
      this.storedMessages.set(lobbyCode, updatedMessages);
      
      chatMessages.set([...updatedMessages]);
      const unreadCount = this.calculateUnreadCount(updatedMessages);
      unreadMessageCount.set(unreadCount);
      
      const tabId = getTabId();
      saveChatData(tabId, lobbyCode, updatedMessages, this.lastReadTimestamp);
      
      this.messageCallbacks.forEach(callback => callback(msg));
    });

    this.socket.on('lobby users', (data: { users: string[], admin: string }) => {
      this.lobbyUsersCallbacks.forEach(callback => callback(data));
    });
  }

  disconnect() {
    this.debugLog('Disconnecting socket service');
    this.isDestroyed = true;
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.connectionPromise = null;
    this.hasJoinedLobby = false;
    connectionStatus.set('disconnected');
    isReconnecting.set(false);
    
    this.messageCallbacks = [];
    this.lobbyUsersCallbacks = [];
    this.storedMessages.clear();
    chatMessages.set([]);
    unreadMessageCount.set(0);
  }

  reset() {
    this.debugLog('Resetting socket service');
    this.disconnect();
    setTimeout(() => {
      this.isDestroyed = false;
    }, 100);
  }

  // ========================================
  // INITIALIZATION METHODS
  // ========================================

  initializeWithSavedData() {
    const saved = loadGameData();
    if (saved.gameState) {
      gameState.set(saved.gameState);
      this.debugLog('Restored game state from localStorage');
    }
    return saved;
  }

  initializeChatData(lobbyCode: string): ChatState {
    const tabId = getTabId();
    const chatState = loadChatData(tabId, lobbyCode);
    
    const freshMessages = [...chatState.messages];
    this.storedMessages.set(lobbyCode, freshMessages);
    this.lastReadTimestamp = chatState.lastReadTimestamp;
    
    chatMessages.set([...freshMessages]);
    unreadMessageCount.set(chatState.unreadCount);
    
    this.debugLog('Chat data initialized', {
      lobbyCode,
      messageCount: freshMessages.length,
      unreadCount: chatState.unreadCount
    });
    
    return { ...chatState, messages: freshMessages };
  }

  // ========================================
  // GAME ACTIONS
  // ========================================

  joinLobby(lobbyCode: string, username: string) {
    this.debugLog('Joining lobby', { lobbyCode, username });
    this.socket?.emit('join lobby', { lobbyCode, user: username });
    this.currentLobbyCode = lobbyCode;
    this.currentUsername = username;
    this.hasJoinedLobby = true;
    saveGameData(get(gameState), lobbyCode, username);
  }

  joinGame(lobbyCode: string) {
    const username = this.currentUsername;
    this.debugLog('Joining game', { lobbyCode, username });
    this.socket?.emit('join game', { lobbyCode, username });
  }

  startGame(lobbyCode: string) {
    const username = this.currentUsername;
    this.debugLog('Starting game', { lobbyCode, username });
    
    if (!username || !lobbyCode || !this.socket?.connected) {
      error.set('Cannot start game: missing requirements');
      return;
    }
    
    this.socket.emit('start game', { lobbyCode, username });
  }

  makePrediction(lobbyCode: string, prediction: number) {
    const username = this.currentUsername;
    this.debugLog('Making prediction', { prediction, username });
    this.socket?.emit('make prediction', { lobbyCode, prediction, username });
  }

  playCard(lobbyCode: string, cardIndex: number) {
    const username = this.currentUsername;
    this.debugLog('Playing card', { cardIndex, username });
    this.socket?.emit('play card', { lobbyCode, cardIndex, username });
  }

  nextRound(lobbyCode: string) {
    const username = this.currentUsername;
    this.socket?.emit('next round', { lobbyCode, username });
  }

  pauseGame(lobbyCode: string, isPaused: boolean) {
    const username = this.currentUsername;
    this.debugLog('Pausing/Resuming game', { lobbyCode, username, isPaused });
    this.socket?.emit('pause game', { lobbyCode, username, isPaused });
  }

  restartGame(lobbyCode: string) {
    const username = this.currentUsername;
    this.debugLog('Restarting game', { lobbyCode, username });
    this.socket?.emit('restart game', { lobbyCode, username });
  }

  endGame(lobbyCode: string) {
    const username = this.currentUsername;
    this.debugLog('Ending game', { lobbyCode, username });
    this.socket?.emit('end game', { lobbyCode, username });
  }

  // ========================================
  // CHAT METHODS
  // ========================================

  sendLobbyMessage(lobbyCode: string, username: string, text: string) {
    if (this.socket?.connected) {
      this.debugLog('Sending lobby message', { lobbyCode, username, text });
      this.socket.emit('lobby message', { lobbyCode, user: username, text });
    }
  }

  onLobbyMessage(callback: (message: LobbyMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  onLobbyUsers(callback: (data: { users: string[], admin: string }) => void): () => void {
    this.lobbyUsersCallbacks.push(callback);
    return () => {
      const index = this.lobbyUsersCallbacks.indexOf(callback);
      if (index > -1) {
        this.lobbyUsersCallbacks.splice(index, 1);
      }
    };
  }

  markMessagesAsRead(lobbyCode: string): void {
    const currentTime = Date.now();
    const messages = this.storedMessages.get(lobbyCode) || [];
    
    const updatedMessages = messages.map(msg => ({ ...msg, read: true }));
    
    this.storedMessages.set(lobbyCode, updatedMessages);
    this.lastReadTimestamp = currentTime;
    
    chatMessages.set([...updatedMessages]);
    unreadMessageCount.set(0);
    
    const tabId = getTabId();
    saveChatData(tabId, lobbyCode, updatedMessages, currentTime);
  }

  private calculateUnreadCount(messages: StoredLobbyMessage[]): number {
    return messages.filter(msg => !msg.read && msg.timestamp > this.lastReadTimestamp).length;
  }

  getChatMessages(lobbyCode: string): StoredLobbyMessage[] {
    return this.storedMessages.get(lobbyCode) || [];
  }

  getUnreadCount(lobbyCode: string): number {
    const messages = this.storedMessages.get(lobbyCode) || [];
    return this.calculateUnreadCount(messages);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  saveSession(lobbyCode: string, username: string) {
    const currentState = get(gameState);
    saveGameData(currentState, lobbyCode, username);
  }

  clearSession() {
    clearGameData();
    gameState.set(null);
  }

  getCurrentUserInfo() {
    return {
      lobbyCode: this.currentLobbyCode,
      username: this.currentUsername
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    return get(connectionStatus);
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();