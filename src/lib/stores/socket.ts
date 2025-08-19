import { writable } from 'svelte/store';
import { io, type Socket } from 'socket.io-client';

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
  suit?: string; // Made optional to handle special cards
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
  scores: { player: string; score: number; tricks: number; prediction: number }[];
}

// Export stores directly
export const gameState = writable<GameState | null>(null);
export const connectionStatus = writable<'disconnected' | 'connecting' | 'connected'>('disconnected');
export const error = writable<string | null>(null);

class SocketService {
  private socket: Socket | null = null;

  connect() {
    connectionStatus.set('connecting');
    this.socket = io('http://localhost:3001');
    
    this.socket.on('connect', () => {
      connectionStatus.set('connected');
    });

    this.socket.on('disconnect', () => {
      connectionStatus.set('disconnected');
    });

    this.socket.on('game started', (newGameState: GameState) => {
      gameState.set(newGameState);
    });

    this.socket.on('game update', (newGameState: GameState) => {
      gameState.set(newGameState);
    });

    this.socket.on('error', (errorMsg: { message: string }) => {
      error.set(errorMsg.message);
    });
  }

  joinLobby(lobbyCode: string, username: string) {
    this.socket?.emit('join lobby', { lobbyCode, user: username });
  }

  joinGame(lobbyCode: string) {
    this.socket?.emit('join game', { lobbyCode });
  }

  startGame(lobbyCode: string) {
    this.socket?.emit('start game', { lobbyCode });
  }

  makePrediction(lobbyCode: string, prediction: number) {
    this.socket?.emit('make prediction', { lobbyCode, prediction });
  }

  playCard(lobbyCode: string, cardIndex: number) {
    this.socket?.emit('play card', { lobbyCode, cardIndex });
  }

  nextRound(lobbyCode: string) {
    this.socket?.emit('next round', { lobbyCode });
  }

  disconnect() {
    this.socket?.disconnect();
  }
}

export const socketService = new SocketService();