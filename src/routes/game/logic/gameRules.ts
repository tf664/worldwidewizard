import type { Card, Suit } from './cards.js';

export function mustFollowSuit(playerHand: Card[], leadSuit: Suit | null): boolean {
    if (!leadSuit) return false;
    // Check if player has any non-special cards of the lead suit
    return playerHand.some(card =>
        card.suit === leadSuit &&
        card.rank !== 'Zoro' &&
        card.rank !== 'Fool'
    );
}

export function isValidCardPlay(
    card: Card,
    playerHand: Card[],
    leadSuit: Suit | null,
    currentTrick: Card[]
): boolean {
    // Zoro and Fool can always be played
    if (card.rank === 'Zoro' || card.rank === 'Fool') return true;

    // If no lead suit yet (first card of trick), any regular card is valid
    if (!leadSuit || currentTrick.length === 0) return true;

    // Must follow suit if player has cards of lead suit (excluding special cards)
    if (mustFollowSuit(playerHand, leadSuit)) {
        return card.suit === leadSuit;
    }

    // Can play any card if can't follow suit
    return true;
}