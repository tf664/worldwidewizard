<script lang="ts">
	import type { GameState } from '../../logic/gameLogic.js';
	import type { Player } from '../../types/player.js';

	export let gameState: GameState;
	export let onNextRound: () => void;

	function calculateRoundScore(player: Player): number {
		if (player.prediction === player.tricksWon) {
			return 20 + player.tricksWon;
		} else {
			return Math.abs(player.prediction - player.tricksWon) * -10;
		}
	}

	function getScoreColor(score: number): string {
		return score >= 0 ? 'text-green-600' : 'text-red-600';
	}
</script>

<div class="fixed inset-0 flex items-center justify-center z-50">
	<div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl border-4 border-blue-500">
		<h2 class="text-2xl font-bold mb-4 text-center">Round {gameState.currentRound} Results</h2>

		<div class="grid grid-cols-2 gap-4 mb-6">
			{#each gameState.players as player}
				<div class="bg-gray-100 p-4 rounded-lg">
					<h3 class="font-bold text-lg">{player.name}</h3>
					<div class="text-sm space-y-1">
						<p>Predicted: <span class="font-semibold">{player.prediction}</span></p>
						<p>Actual: <span class="font-semibold">{player.tricksWon}</span></p>
						<p>
							Round Score: <span class="font-semibold {getScoreColor(calculateRoundScore(player))}"
								>{calculateRoundScore(player)}</span
							>
						</p>
						<p>Total Score: <span class="font-semibold">{player.score}</span></p>
					</div>
				</div>
			{/each}
		</div>

		<button
			class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded w-full font-bold"
			onclick={onNextRound}
		>
			{gameState.currentRound < gameState.maxRounds ? 'Next Round' : 'Finish Game'}
		</button>
	</div>
</div>
