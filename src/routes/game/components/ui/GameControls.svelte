<script lang="ts">
	import type { GameState } from '../../logic/gameLogic.js';
	import { ButtonToggleGroup, ButtonToggle } from 'flowbite-svelte';
	import { BoothCurtainOutline, BeerMugEmptyOutline } from 'flowbite-svelte-icons';

	const { gameState, onRestart, onPause, onUndo, elapsed, formatTime } = $props<{
		gameState: GameState;
		onRestart: () => void;
		onPause: () => void;
		onUndo: () => void;
		elapsed: number;
		formatTime: (seconds: number) => string;
	}>();

	let visiblePanels = $state<string[]>([]);

	function handlePanelToggle(values: string[]) {
		visiblePanels = values;
	}
</script>

<!-- Game Timer -->
<div
	class="fixed top-24 left-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-xl text-2xl font-mono shadow flex items-center gap-4"
>
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
		<path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 7v5l3 3" />
	</svg>
	<span>{formatTime(elapsed)}</span>
</div>

<!-- Multi-selection toggle for controls/info -->
<div class="fixed top-28 right-2 z-[9999] bg-white rounded-lg shadow-lg p-4 w-64">
	<ButtonToggleGroup multiSelect={true} onSelect={handlePanelToggle}>
		<ButtonToggle value="one" selected={visiblePanels.includes('one')}>One</ButtonToggle>
		<ButtonToggle value="two" selected={visiblePanels.includes('two')}>Two</ButtonToggle>
		<ButtonToggle value="three" selected={visiblePanels.includes('three')}>Three</ButtonToggle>
	</ButtonToggleGroup>
	<p class="mt-2 dark:text-white">
		Selected: {visiblePanels.length ? visiblePanels.join(', ') : 'None'}
	</p>

	{#if visiblePanels.includes('controls')}
		<div class="space-y-2 mt-4">
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
	{/if}

	{#if visiblePanels.includes('info')}
		<!-- Game Stats -->
		<div class="mt-4 text-sm">
			<p>Round: {gameState.currentRound}/{gameState.maxRounds}</p>
			<p>Phase: {gameState.phase}</p>
			<p>Current Player: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
		</div>
	{/if}
</div>
