export type Suit = 'red' | 'blue' | 'green' | 'yellow';
export type Rank = number | 'Wizard' | 'Fool';

export interface Card {
    suit: Suit | null;
    rank: Rank;
}

export function createDeck(): Card[] {
    const suits: Suit[] = ['red', 'blue', 'green', 'yellow'];
    const cards: Card[] = [];

    for (let suit of suits) {
        for (let i = 1; i <= 13; i++) {
            cards.push({ suit, rank: i });
        }
    }

    // Add 4 Wizard and 4 Fool cards
    for (let i = 0; i < 4; i++) {
        cards.push({ suit: null, rank: 'Wizard' });
        cards.push({ suit: null, rank: 'Fool' });
    }

    return shuffle(cards);
}

function shuffle(deck: Card[]): Card[] {
    return [...deck].sort(() => Math.random() - 0.5);
}
