export interface Player {
	name: string;
	hand: any[];
	prediction: number;
	tricksWon: number;
	score: number;
}

export function createPlayers(names: string[]): Player[] {
	return names.map(name => ({
		name,
		hand: [],
		prediction: 0,
		tricksWon: 0,
		score: 0
	}));
}
