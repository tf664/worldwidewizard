export type Suit = 'red' | 'blue' | 'green' | 'yellow';
export type Rank = number | 'Zoro' | 'Fool';

export interface Card {
    suit: Suit | null; // colour type / special (fool/wizard)
    rank: Rank;
    image: string; // URL or path to the card image
}

export function createDeck(): Card[] {
    const suits: Suit[] = ['red', 'blue', 'green', 'yellow'];
    const cards: Card[] = [];

    // Number cards
    for (let suit of suits) {
        for (let i = 1; i <= 13; i++) {
            cards.push({
                suit,
                rank: i,
                image: `/rcs/cards-optimized/${suit}_${numberToWord(i)}.webp`
            });
        }
    }

    // Wizard and Fool cards (no suit)
    for (let i = 0; i < 4; i++) {
        cards.push({ suit: null, rank: 'Zoro', image: `/rcs/cards-optimized/wizard_${i + 1}.webp` });  // Changed ${i} to ${i + 1}
        cards.push({ suit: null, rank: 'Fool', image: `/rcs/cards-optimized/fool_${i + 1}.webp` });   // Changed ${i} to ${i + 1}
    }

    return shuffle(cards);
}

function numberToWord(num: number): string {
    const words = [
        'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
        'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'
    ];
    return words[num];
}

function shuffle(deck: Card[]): Card[] {
    return [...deck].sort(() => Math.random() - 0.5);
}