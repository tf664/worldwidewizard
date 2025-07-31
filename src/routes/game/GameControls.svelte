<script lang="ts">
	import type { GameState } from './gameLogic.js';

	export let gameState: GameState;
	export let onRestart: () => void;
	export let onPause: () => void;
	export let onUndo: () => void;
</script>

<div class="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4">
	<h3 class="font-bold mb-2">Game Controls</h3>

	<div class="space-y-2">
		<button
			class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded w-full text-gray-800"
			on:click={onPause}
		>
			Pause Game
		</button>

		<button
			class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded w-full text-gray-800"
			on:click={onUndo}
		>
			Undo Last Move
		</button>

		<button
			class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded w-full text-white"
			on:click={onRestart}
		>
			Restart Game
		</button>
	</div>

	<!-- Game Stats -->
	<div class="mt-4 text-sm">
		<p>Round: {gameState.currentRound}/{gameState.maxRounds}</p>
		<p>Phase: {gameState.phase}</p>
		<p>Current Player: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
	</div>
</div>
