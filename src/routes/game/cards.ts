export type Suit = 'red' | 'blue' | 'green' | 'yellow';
export type Rank = number | 'Wizard' | 'Fool';

export interface Card {
    suit: Suit | null; // colour type / special (fool/wizard)
    rank: Rank;
    image: string; // URL or path to the card image
}

export function createDeck(): Card[] {
    const suits: Suit[] = ['red', 'blue', 'green', 'yellow'];
    const cards: Card[] = [];

    for (let suit of suits) {
        for (let i = 1; i <= 13; i++) {
            cards.push({
                suit,
                rank: i,
                image: `/rcs/cards-optimized/${suit}_${numberToWord(i)}.webp`
            });
        }
    }

    function numberToWord(num: number): string {
        const words = [
            'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
            'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'
        ];
        return words[num];
    }

    // Add 4 Wizard and 4 Fool cards
    // TODO wizards and fools with the suit. 
    // TODO If Fool: No suit
    // TODO Wizard: suit can be chosen by first player of looking at their cards
    for (let i = 0; i < 4; i++) {
        cards.push({ suit: null, rank: 'Wizard', image: `static/rcs/cards-optimized/wizard_${i}.webp` });
        cards.push({ suit: null, rank: 'Fool', image: `static/rcs/cards-optimized/fool_${i}.webp` });
    }

    return shuffle(cards);
}

function shuffle(deck: Card[]): Card[] {
    return [...deck].sort(() => Math.random() - 0.5);
}
