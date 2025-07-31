import type { Card, Suit } from './cards.js';
import type { Player } from './player.js';
import { createPlayers } from './player.js';
import { createDeck } from './cards.js';
import { isValidCardPlay } from './gameRules.js';

export interface TrickCard {
    card: Card;
    playerId: number;
}

export interface GameState {
    players: Player[];
    currentRound: number;
    maxRounds: number;
    deck: Card[];
    currentTrick: TrickCard[];  // Changed from Card[] to TrickCard[]
    currentPlayerIndex: number;
    trumpSuit: Suit | null;
    phase: 'bidding' | 'playing' | 'scoring' | 'finished';
    dealer: number;
}

export interface Trick {
    cards: TrickCard[];
    winner: number;
}
// Add these missing functions:

export function initializeGame(playerNames: string[]): GameState {
    const players = createPlayers(playerNames);

    return {
        players,
        currentRound: 1,
        maxRounds: 10, // Adjust based on player count
        deck: [],
        currentTrick: [],
        currentPlayerIndex: 0,
        trumpSuit: null,
        phase: 'bidding',
        dealer: 0
    };
}

export function startNewRound(gameState: GameState): void {
    // Move dealer
    gameState.dealer = (gameState.dealer + 1) % gameState.players.length;

    // Reset player stats for round
    gameState.players.forEach(player => {
        player.hand = [];
        player.prediction = -1;  // Use -1 to indicate no prediction made yet
        player.tricksWon = 0;
    });

    // Create new deck and deal cards
    gameState.deck = createDeck();
    dealCards(gameState);
    determineTrumpSuit(gameState);

    // Start bidding phase
    gameState.phase = 'bidding';
    gameState.currentPlayerIndex = (gameState.dealer + 1) % gameState.players.length;
    gameState.currentTrick = [];
}

export function dealCards(gameState: GameState): void {
    const cardsPerPlayer = gameState.currentRound;

    for (let i = 0; i < cardsPerPlayer; i++) {
        for (let j = 0; j < gameState.players.length; j++) {
            if (gameState.deck.length > 0) {
                const card = gameState.deck.pop()!;
                gameState.players[j].hand.push(card);
            }
        }
    }
}

export function determineTrumpSuit(gameState: GameState): void {
    if (gameState.deck.length === 0) {
        gameState.trumpSuit = null;
        return;
    }

    const trumpCard = gameState.deck[gameState.deck.length - 1];

    if (trumpCard.rank === 'Zoro') {
        // Zoro - player chooses trump (for now, random)
        const suits: Suit[] = ['red', 'blue', 'green', 'yellow'];
        gameState.trumpSuit = suits[Math.floor(Math.random() * suits.length)];
    } else if (trumpCard.rank === 'Fool') {
        // Fool - no trump
        gameState.trumpSuit = null;
    } else {
        // Regular card - its suit is trump
        gameState.trumpSuit = trumpCard.suit;
    }
}

export function processPrediction(gameState: GameState, playerId: number, prediction: number): boolean {
    if (gameState.phase !== 'bidding' || gameState.currentPlayerIndex !== playerId) {
        return false;
    }

    gameState.players[playerId].prediction = prediction;

    // Move to next player
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const startingPlayer = (gameState.dealer + 1) % gameState.players.length;

    // If we've cycled back to the starting player, all bids are in
    if (nextPlayerIndex === startingPlayer) {
        gameState.phase = 'playing';
        gameState.currentPlayerIndex = startingPlayer;
    } else {
        gameState.currentPlayerIndex = nextPlayerIndex;
    }

    return true;
}

export function playCard(gameState: GameState, playerId: number, cardIndex: number): boolean {
    if (gameState.phase !== 'playing' || gameState.currentPlayerIndex !== playerId) {
        return false;
    }

    const player = gameState.players[playerId];
    const card = player.hand[cardIndex];

    // Validate card play
    const leadSuit = gameState.currentTrick.length > 0 ? gameState.currentTrick[0].card.suit : null;
    if (!isValidCardPlay(card, player.hand, leadSuit, gameState.currentTrick.map(t => t.card))) {
        return false;
    }

    // Play the card
    const playedCard = player.hand.splice(cardIndex, 1)[0];
    gameState.currentTrick.push({ card: playedCard, playerId });  // Fixed: push TrickCard object

    // Check if trick is complete
    if (gameState.currentTrick.length === gameState.players.length) {
        // End trick, determine winner
        const winnerId = calculateTrickWinner({ cards: gameState.currentTrick, winner: -1 }, gameState.trumpSuit);
        gameState.players[winnerId].tricksWon++;

        // Clear trick and set next player
        gameState.currentTrick = [];
        gameState.currentPlayerIndex = winnerId;

        // Check if round is over
        if (gameState.players[0].hand.length === 0) {
            gameState.phase = 'scoring';
        }
    } else {
        // Next player's turn
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    }

    return true;
}

export function calculateTrickWinner(trick: Trick, trumpSuit: Suit | null): number {
    if (trick.cards.length === 0) return -1;

    let winner = trick.cards[0];

    // Check for Zoro first (highest priority)
    const zoros = trick.cards.filter(c => c.card.rank === 'Zoro');
    if (zoros.length > 0) {
        return zoros[0].playerId;
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