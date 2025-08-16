<script lang="ts">
	import type { GameState } from '../../logic/gameLogic.js';
	import { Hamburger } from 'svelte-hamburgers';
	import { ButtonToggleGroup, ButtonToggle } from 'flowbite-svelte';
	import { BoothCurtainOutline, BeerMugEmptyOutline } from 'flowbite-svelte-icons';

	export let gameState: GameState;
	export let onRestart: () => void;
	export let onPause: () => void;
	export let onUndo: () => void;
	export let elapsed: number;
	export let formatTime: (seconds: number) => string;

	let gameControlsVisible = true; // default visible on desktop
	let visiblePanels: string[] = ['controls', 'info'];

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
<div
	class="fixed top-24 right-2 z-[9999] bg-gray-900 bg-opacity-95 rounded-2xl shadow-xl p-2 transition-all duration-300"
	class:w-72={gameControlsVisible}
	class:w-20={!gameControlsVisible}
>
	<!-- Header row: burger + buttons on the right -->
	<div class="flex justify-end gap-2">
		{#if gameControlsVisible}
			<ButtonToggleGroup multiSelect={true} onSelect={handlePanelToggle} class="flex gap-2">
				<ButtonToggle
					value="controls"
					selected={visiblePanels.includes('controls')}
					class={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white
		   bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-500 hover:to-lime-400 shadow-md
		   ${visiblePanels.includes('controls') ? 'ring-2 ring-emerald-300' : ''}`}
				>
					<BoothCurtainOutline class="shrink-0 h-6 w-6" />
					Controls
				</ButtonToggle>
				<ButtonToggle
					value="info"
					selected={visiblePanels.includes('info')}
					class={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white
		   bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 shadow-md
		   ${visiblePanels.includes('info') ? 'ring-2 ring-amber-300' : ''}`}
				>
					<BeerMugEmptyOutline class="shrink-0 h-6 w-6" />
					Info
				</ButtonToggle>
			</ButtonToggleGroup>
		{/if}

		<!-- Burger always on the far right -->
		<Hamburger bind:open={gameControlsVisible} --color="white" />
	</div>

	<!-- Expanded content -->
	{#if gameControlsVisible}
		{#if visiblePanels.includes('controls')}
			<div class="space-y-2 mt-4">
				<button
					class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg w-full text-gray-100 shadow-sm"
					on:click={onPause}
				>
					Pause Game
				</button>
				<button
					class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg w-full text-gray-100 shadow-sm"
					on:click={onUndo}
				>
					Undo Last Move
				</button>
				<button
					class="bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400
						   px-4 py-2 rounded-lg w-full text-white font-semibold shadow-md"
					on:click={onRestart}
				>
					Restart Game
				</button>
			</div>
		{/if}

		{#if visiblePanels.includes('info')}
			<div class="mt-4 text-sm text-gray-200">
				<p>Round: {gameState.currentRound}/{gameState.maxRounds}</p>
				<p>Phase: {gameState.phase}</p>
				<p>Current Player: {gameState.players[gameState.currentPlayerIndex]?.name}</p>
			</div>
		{/if}
	{/if}
</div>
