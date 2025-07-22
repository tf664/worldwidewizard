import type { Card, Suit } from './cards.js';
import type { Player } from './player.js';
import { createPlayers } from './player.js';
import { createDeck } from './cards.js';
import { isValidCardPlay } from './gameRules.js';

export interface GameState {
    players: Player[];
    currentRound: number;
    maxRounds: number;
    deck: Card[];
    currentTrick: Card[];
    currentPlayerIndex: number;
    trumpSuit: Suit | null;
    phase: 'bidding' | 'playing' | 'scoring' | 'finished';
    dealer: number;
}

export interface Trick {
    cards: Array<{ card: Card; playerId: number }>;
    winner: number;
}

export function initializeGame(playerNames: string[]): GameState {
    const players = createPlayers(playerNames);
    const maxRounds = Math.floor(60 / playerNames.length);  // TODO maxRounds adjusted to playerSize
    
    return {
        players,
        currentRound: 1,
        maxRounds,
        deck: createDeck(),
        currentTrick: [],
        currentPlayerIndex: 0,
        trumpSuit: null,
        phase: 'bidding',
        dealer: 0
    };
}

export function dealCards(gameState: GameState): void {
    const cardsPerPlayer = gameState.currentRound;
    gameState.deck = createDeck();
    
    // Clear all player hands
    gameState.players.forEach(player => player.hand = []);
    
    // Deal cards to each player
    for (let i = 0; i < cardsPerPlayer; i++) {
        for (let j = 0; j < gameState.players.length; j++) {
            if (gameState.deck.length > 0) {
                const card = gameState.deck.pop()!;
                gameState.players[j].hand.push(card);
            }
        }
    }
}

export function determineTrumpSuit(gameState: GameState): Suit | null {
    if (gameState.deck.length === 0) return null;
    
    const trumpCard = gameState.deck[gameState.deck.length - 1];
    gameState.trumpSuit = trumpCard.suit;
    return trumpCard.suit;
}

export function isValidPlay(card: Card, gameState: GameState): boolean {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const leadSuit = gameState.currentTrick.length > 0 ? gameState.currentTrick[0].suit : null;
    
    return isValidCardPlay(card, currentPlayer.hand, leadSuit, gameState.currentTrick);
}

export function calculateTrickWinner(trick: Trick, trumpSuit: Suit | null): number {
    if (trick.cards.length === 0) return -1;
    
    let winner = trick.cards[0];
    
    // Check for Wizards first (highest priority)
    const wizards = trick.cards.filter(c => c.card.rank === 'Wizard');
    if (wizards.length > 0) {
        return wizards[0].playerId;
    }
    
    // Remove Fools from consideration
    const validCards = trick.cards.filter(c => c.card.rank !== 'Fool');
    if (validCards.length === 0) {
        return trick.cards[0].playerId; // If only Fools, first player wins
    }
    
    const leadSuit = validCards[0].card.suit;
    
    // Check for trump cards
    const trumpCards = validCards.filter(c => c.card.suit === trumpSuit && c.card.suit !== leadSuit);
    if (trumpCards.length > 0) {
        winner = trumpCards.reduce((highest, current) => {
            if (typeof current.card.rank === 'number' && typeof highest.card.rank === 'number') {
                return current.card.rank > highest.card.rank ? current : highest;
            }
            return highest;
        });
        return winner.playerId;
    }
    
    // Check cards of lead suit
    const leadSuitCards = validCards.filter(c => c.card.suit === leadSuit);
    if (leadSuitCards.length > 0) {
        winner = leadSuitCards.reduce((highest, current) => {
            if (typeof current.card.rank === 'number' && typeof highest.card.rank === 'number') {
                return current.card.rank > highest.card.rank ? current : highest;
            }
            return highest;
        });
    }
    
    return winner.playerId;
}

export function calculateRoundScores(gameState: GameState): void {
    gameState.players.forEach(player => {
        if (player.prediction === player.tricksWon) {
            player.score += 20 + player.tricksWon;
        } else {
            player.score += Math.abs(player.prediction - player.tricksWon) * -10;
        }
        
        // Reset for next round
        player.tricksWon = 0;
        player.prediction = 0;
        player.hand = [];
    });
}