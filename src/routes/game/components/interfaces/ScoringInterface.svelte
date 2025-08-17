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

<div class="fixed inset-0 z-50 flex items-center justify-center">
	<div class="mx-4 w-full max-w-2xl rounded-lg border-4 border-blue-500 bg-white p-6 shadow-2xl">
		<h2 class="mb-4 text-center text-2xl font-bold">Round {gameState.currentRound} Results</h2>

		<div class="mb-6 grid grid-cols-2 gap-4">
			{#each gameState.players as player}
				<div class="rounded-lg bg-gray-100 p-4">
					<h3 class="text-lg font-bold">{player.name}</h3>
					<div class="space-y-1 text-sm">
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
			class="w-full rounded bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
			onclick={onNextRound}
			disabled={gameState.paused}
		>
			{gameState.currentRound < gameState.maxRounds ? 'Next Round' : 'Finish Game'}
		</button>
	</div>
</div>
