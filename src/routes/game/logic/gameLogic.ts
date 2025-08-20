import type { Card, Suit } from './cards.js';
import type { Player } from '../types/player.js';
import { createPlayers } from '../types/player.js';
import { createDeck } from './cards.js';
import { isValidCardPlay } from './gameRules.js';

export interface GameState {
    players: Player[];
    currentRound: number;
    maxRounds: number;
    deck: Card[];
    currentTrick: TrickCard[];
    currentPlayerIndex: number;
    trumpSuit: Suit | null;
    phase: 'bidding' | 'playing' | 'scoring' | 'finished' | 'choosing-trump';
    dealer: number;

    paused?: boolean;
    history?: TrickCard[][]; // Store previous tricks to undo moves
    moveHistory?: {
        playerId: number;
        card: Card;
        handIndex: number;
    }[];
    trumpChooser?: number; // player who needs to choose the trump when Zoro
}

export interface TrickCard {
    card: Card;
    playerId: number;
}

export interface Trick {
    cards: TrickCard[];
    winner: number;
}

export function initializeGame(playerNames: string[]): GameState {
    const players = createPlayers(playerNames);

    // Determine max rounds based on player count
    let maxRounds: number;
    switch (players.length) {
        case 3:
            maxRounds = 20;
            break;
        case 4:
            maxRounds = 15;
            break;
        case 5:
            maxRounds = 12;
            break;
        case 6:
            maxRounds = 10;
            break;
        default:
            maxRounds = 5; // safety fallback
            break;
    }

    return {
        players,
        currentRound: 1,
        maxRounds,
        deck: [],
        currentTrick: [],
        currentPlayerIndex: 0,
        trumpSuit: null,
        phase: 'bidding',
        dealer: 0,
        paused: false,
        history: [],
        moveHistory: []
    };
}

export function startNewRound(gameState: GameState): void {
    // Move dealer
    gameState.dealer = (gameState.dealer + 1) % gameState.players.length;

    // Reset player stats for round
    gameState.players.forEach(player => {
        player.hand = [];
        player.prediction = -1;  // -1 to indicate no prediction made yet
        player.tricksWon = 0;
    });

    // Create new deck and deal cards
    gameState.deck = createDeck();
    dealCards(gameState);
    determineTrumpSuit(gameState);

    // Only set to bidding if not choosing trump (Zoro case)
    if (gameState.phase !== 'choosing-trump') {
        gameState.phase = 'bidding';
        gameState.currentPlayerIndex = (gameState.dealer + 1) % gameState.players.length;
    }

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
        // Zoro - dealer chooses trump
        gameState.phase = 'choosing-trump';
        gameState.trumpChooser = gameState.dealer;
        gameState.trumpSuit = null; // Will be set when player chooses
    } else if (trumpCard.rank === 'Fool') {
        // Fool - no trump
        gameState.trumpSuit = null;
    } else {
        // Regular card - its suit is trump
        gameState.trumpSuit = trumpCard.suit;
    }
}

export function chooseTrumpSuit(gameState: GameState, playerId: number, suit: Suit): boolean {
    if (gameState.phase !== 'choosing-trump' || gameState.trumpChooser !== playerId) {
        return false;
    }

    gameState.trumpSuit = suit;
    gameState.phase = 'bidding';
    gameState.currentPlayerIndex = (gameState.dealer + 1) % gameState.players.length;
    gameState.trumpChooser = undefined;

    return true;
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
    if (gameState.phase !== 'playing' || gameState.currentPlayerIndex !== playerId || gameState.paused) {
        return false;
    }

    const player = gameState.players[playerId];
    const card = player.hand[cardIndex];

    const leadSuit = gameState.currentTrick.length > 0 ? gameState.currentTrick[0].card.suit : null;
    if (!isValidCardPlay(card, player.hand, leadSuit, gameState.currentTrick.map(t => t.card))) {
        return false;
    }

    // Save move for undo
    gameState.moveHistory!.push({ playerId, card, handIndex: cardIndex });

    const playedCard = player.hand.splice(cardIndex, 1)[0];
    gameState.currentTrick.push({ card: playedCard, playerId });

    if (gameState.currentTrick.length === gameState.players.length) {
        // Save the completed trick to history for undo
        if (gameState.history) {
            gameState.history.push([...gameState.currentTrick]);
        }
        const winnerId = calculateTrickWinner({ cards: gameState.currentTrick, winner: -1 }, gameState.trumpSuit);
        gameState.players[winnerId].tricksWon++;
        gameState.currentTrick = [];
        gameState.currentPlayerIndex = winnerId;

        if (gameState.players[0].hand.length === 0) {
            gameState.phase = 'scoring';
        }
    } else {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    }
    return true;
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

export function pauseGame(gameState: GameState): void {
    gameState.paused = !gameState.paused;
    gameState = { ...gameState }; // trigger Svelte reactivity
    console.log(gameState.paused ? 'Game paused' : 'Game resumed');
}

export function undoMove(gameState: GameState): void {
    if (!gameState.moveHistory || gameState.moveHistory.length === 0) {
        console.log('No moves to undo');
        return;
    }

    const lastMove = gameState.moveHistory.pop()!;
    const { playerId, card, handIndex } = lastMove;

    // If currentTrick is empty, restore the last completed trick
    if (gameState.currentTrick.length === 0 && gameState.history && gameState.history.length > 0) {
        // Restore the last trick
        const lastTrick = gameState.history.pop()!;
        gameState.currentTrick = [...lastTrick];

        // Find winner of last trick & decrement their tricksWon
        const winnerId = calculateTrickWinner({ cards: lastTrick, winner: -1 }, gameState.trumpSuit);
        if (winnerId !== -1) {
            gameState.players[winnerId].tricksWon = Math.max(0, gameState.players[winnerId].tricksWon - 1);
        }

        // Set currentPlayerIndex to the player who played last in restored trick
        gameState.currentPlayerIndex = lastTrick[lastTrick.length - 1].playerId;

        // If phase was 'scoring', revert to 'playing'
        if (gameState.phase === 'scoring') {
            gameState.phase = 'playing';
        }
    }

    // Remove card from currentTrick
    const idx = gameState.currentTrick.map(tc => tc.playerId).lastIndexOf(playerId);
    if (idx !== -1 && gameState.currentTrick[idx].card === card) {
        gameState.currentTrick.splice(idx, 1);
    }

    // Return card to player's hand at original position
    gameState.players[playerId].hand.splice(handIndex, 0, card);

    // Set currentPlayerIndex back to player who undid
    gameState.currentPlayerIndex = playerId;
}