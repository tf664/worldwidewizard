<script lang="ts">
	import type { GameState } from '../../logic/gameLogic.js';
	import { Hamburger } from 'svelte-hamburgers';
	import { ButtonToggleGroup, ButtonToggle } from 'flowbite-svelte';
	import {
		BoothCurtainOutline,
		BeerMugEmptyOutline,
		PauseSolid,
		ClockOutline
	} from 'flowbite-svelte-icons';

	export let gameState: GameState;
	export let onRestart: () => void; // doesn't require any implementation, since reloads
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
	class="fixed top-24 left-4 z-50 flex items-center gap-4 rounded-xl bg-gray-800 px-4 py-2 font-mono text-2xl text-white shadow"
>
	{#if gameState.paused}
		<PauseSolid class="h-6 w-6 shrink-0" />
	{:else}
		<ClockOutline class="h-6 w-6 shrink-0" />
	{/if}
	<span>{formatTime(elapsed)}</span>
</div>

<!-- Multi-selection toggle for controls/info -->
<div
	class="bg-opacity-95 fixed top-24 right-2 z-[9999] rounded-2xl bg-gray-900 p-2 shadow-xl transition-all duration-300"
	class:w-68={gameControlsVisible}
	class:w-20={!gameControlsVisible}
>
	<!-- Header row: burger + buttons on the right -->
	<div class="flex justify-end gap-2">
		{#if gameControlsVisible}
			<ButtonToggleGroup
				multiSelect={true}
				onSelect={handlePanelToggle}
				class="flex gap-2 border-0 p-0.5"
			>
				<ButtonToggle
					value="controls"
					selected={visiblePanels.includes('controls')}
					class={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 px-5
		   py-2.5 font-medium text-white shadow-md hover:from-emerald-500 hover:to-lime-400
		   ${visiblePanels.includes('controls') ? 'ring-2 ring-emerald-300' : ''}`}
				>
					<BoothCurtainOutline class="h-6 w-6 shrink-0" />
					Controls
				</ButtonToggle>
				<ButtonToggle
					value="info"
					selected={visiblePanels.includes('info')}
					class={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 px-5
		   py-2.5 font-medium text-white shadow-md hover:from-amber-400 hover:to-orange-300
		   ${visiblePanels.includes('info') ? 'ring-2 ring-amber-300' : ''}`}
				>
					<BeerMugEmptyOutline class="h-6 w-6 shrink-0" />
					Info
				</ButtonToggle>
			</ButtonToggleGroup>
		{/if}

		<!-- Burger Toggle Menu on the far right -->
		<Hamburger
			bind:open={gameControlsVisible}
			type="elastic"
			title="Game Controls"
			--color="white"
		/>
	</div>

	<!-- Expanded content -->
	{#if gameControlsVisible}
		{#if visiblePanels.includes('controls')}
			<div class="mt-4 space-y-2">
				<button
					class="w-full rounded-lg bg-gray-700 px-4 py-2 text-gray-100 shadow-sm hover:bg-gray-600"
					on:click={onPause}>{gameState.paused ? 'Resume Game' : 'Pause Game'}</button
				>
				<button
					class="w-full rounded-lg bg-gray-700 px-4 py-2 text-gray-100 shadow-sm hover:bg-gray-600"
					on:click={onUndo}>Undo Last Move</button
				>
				<button
					class="w-full rounded-lg bg-gradient-to-r from-red-600 to-rose-500
						   px-4 py-2 font-semibold text-white shadow-md hover:from-red-500 hover:to-rose-400"
					on:click={onRestart}>Restart Game</button
				>
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
