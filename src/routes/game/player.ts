import type { Card } from "./cards.js";

export interface Player {
    name: string;
    hand: Card[];
    prediction: number;
    tricksWon: number;
    score: number;
    id: number;
}

export function createPlayers(names: string[]): Player[] {
    return names.map((name, index) => ({
        name,
        hand: [],
        prediction: 0,
        tricksWon: 0,
        score: 0,
        id: index
    }));
}