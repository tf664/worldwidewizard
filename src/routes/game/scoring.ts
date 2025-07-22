import type { Player } from './player.js';

export function calculateScore(player: Player): number {
    if (player.prediction === player.tricksWon) {
        return 20 + player.tricksWon;
    } else {
        return Math.abs(player.prediction - player.tricksWon) * -10;
    }
}

export function updatePlayerScores(players: Player[]): void {
    players.forEach(player => {
        player.score += calculateScore(player);
        // Reset for next round
        player.tricksWon = 0;
        player.prediction = 0;
        player.hand = [];
    });
}