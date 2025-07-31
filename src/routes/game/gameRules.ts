import type { Card, Suit } from './cards.js';

export function mustFollowSuit(playerHand: Card[], leadSuit: Suit | null): boolean {
    if (!leadSuit) return false;
    return playerHand.some(card => card.suit === leadSuit);
}

export function isValidCardPlay( // TODO allow special cards?h
    card: Card, 
    playerHand: Card[], 
    leadSuit: Suit | null,
    currentTrick: Card[]
): boolean {
    // Wizard can always be played
    if (card.rank === 'Zoro' || card.rank === 'Fool') return true;

    // If no lead suit yet, any card is valid
    if (!leadSuit || currentTrick.length === 0) return true;
    
    // Must follow suit if possible
    if (mustFollowSuit(playerHand, leadSuit)) { // TODO allow special cards?
        return card.suit === leadSuit;
    }
    
    return true; // Can play any card if can't follow suit
}