<script lang="ts">
	import type { GameState } from './logic/gameLogic.js';
	import { initializeGame, startNewRound, processPrediction, playCard } from './logic/gameLogic.js';
	import { onMount } from 'svelte';
	import GameTable from './components/ui/GameTable.svelte';
	import BiddingInterface from './components/interfaces/BiddingInterface.svelte';
	import CardPlayInterface from './components/interfaces/CardPlayInterface.svelte';
	import ScoringInterface from './components/interfaces/ScoringInterface.svelte';
	import GameControls from './components/ui/GameControls.svelte';
	import { undoMove } from './logic/gameLogic.js';
	import { tick } from 'svelte';

	let gameState: GameState;
	let interfacePosition = {
		x: '50%',
		y: '50%',
		transformX: '-50%',
		transformY: '-50%',
		arrowDir: 'bottom' as 'top' | 'bottom' | 'left' | 'right'
	};

	function getPlayerNames(): string[] {
		// Get player names from localStorage (saved in /setup)
		const storedPlayers = localStorage.getItem('players');
		return storedPlayers ? JSON.parse(storedPlayers) : ['Player 1', 'Player 2', 'Player 3']; // Fallback names
	}

	onMount(() => {
		// Initialize game with the player names from setup
		gameState = initializeGame(getPlayerNames());
		startNewRound(gameState);
	});

	function handlePrediction(playerId: number, prediction: number) {
		if (processPrediction(gameState, playerId, prediction)) {
			gameState = { ...gameState };
		}
	}

	function handleCardPlay(playerId: number, cardIndex: number) {
		if (playCard(gameState, playerId, cardIndex)) {
			gameState = { ...gameState };
		}
	}

	function handleNextRound() {
		if (gameState.phase === 'scoring') {
			gameState.players.forEach((player) => {
				if (player.prediction === player.tricksWon) {
					player.score += 20 + player.tricksWon;
				} else {
					player.score -= Math.abs(player.prediction - player.tricksWon) * 10;
				}
			});
		}

		if (gameState.currentRound < gameState.maxRounds) {
			gameState.currentRound++;
			startNewRound(gameState);
			gameState = { ...gameState };
		} else {
			gameState.phase = 'finished';
			gameState = { ...gameState };
		}
	}

	function handleRestart() {
		gameState = initializeGame(getPlayerNames());
		startNewRound(gameState);
	}

	function handlePause() {
		gameState.paused = !gameState.paused;
		gameState = { ...gameState }; // trigger reactivity
	}

	function handleUndo() {
		undoMove(gameState);
		gameState = { ...gameState }; // trigger reactivity
	}

	let startTime: number;
	let elapsed = 0;
	let intervalId: ReturnType<typeof setInterval>;

	function formatTime(seconds: number) {
		const m = Math.floor(seconds / 60)
			.toString()
			.padStart(2, '0');
		const s = (seconds % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}

	onMount(() => {
		startTime = Date.now();

		intervalId = setInterval(() => {
			// Only increment elapsed if game is not paused
			if (!gameState.paused) {
				elapsed = Math.floor((Date.now() - startTime) / 1000);
			} else {
				// Adjust startTime so that elapsed doesn't jump after resuming
				startTime = Date.now() - elapsed * 1000;
			}
		}, 1000);

		return () => clearInterval(intervalId);
	});

	async function updateInterfacePosition() {
		if (!gameState) return;

		await tick();
		const el = document.getElementById(`player-${gameState.currentPlayerIndex}-card`);
		if (!el) return;

		const rect = el.getBoundingClientRect();
		const position = getPlayerPosition(gameState.currentPlayerIndex);

		// Calculate position relative to player card with generous spacing
		switch (position) {
			case 'bottom':
				interfacePosition = {
					x: `${rect.left + rect.width / 2}px`,
					y: `${rect.top - 24}px`, // 24px above the card
					transformX: '-50%',
					transformY: '-100%',
					arrowDir: 'bottom'
				};
				break;
			case 'top':
				interfacePosition = {
					x: `${rect.left + rect.width / 2}px`,
					y: `${rect.bottom + 24}px`, // 24px below the card
					transformX: '-50%',
					transformY: '0%',
					arrowDir: 'top'
				};
				break;
			case 'left':
				interfacePosition = {
					x: `${rect.right + 24}px`, // 24px to the right of the card
					y: `${rect.top + rect.height / 2}px`,
					transformX: '0%',
					transformY: '-50%',
					arrowDir: 'left'
				};
				break;
			case 'right':
				interfacePosition = {
					x: `${rect.left - 24}px`, // 24px to the left of the card
					y: `${rect.top + rect.height / 2}px`,
					transformX: '-100%',
					transformY: '-50%',
					arrowDir: 'right'
				};
				break;
		}
	}

	// Recalculate position whenever current player changes
	$: if (gameState?.currentPlayerIndex !== undefined) {
		updateInterfacePosition();
	}

	function getPlayerPosition(index: number): string {
		const positions = ['bottom', 'left', 'top', 'right'];
		return positions[index] || 'bottom';
	}
</script>

{#if gameState}
	<!-- Full screen game table -->
	<div class="relative h-screen overflow-hidden bg-green-800">
		<GameTable {gameState} />
	</div>

	<!-- Game Controls -->
	<GameControls
		{gameState}
		onRestart={handleRestart}
		onPause={handlePause}
		onUndo={handleUndo}
		{elapsed}
		{formatTime}
	/>

	<!-- Game Overlays positioned relative to current player -->
	{#if gameState.phase === 'bidding'}
		<div
			class="fixed z-50"
			style="
                left: {interfacePosition.x}; 
                top: {interfacePosition.y}; 
                transform: translate({interfacePosition.transformX}, {interfacePosition.transformY});
                transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            "
		>
			<BiddingInterface
				{gameState}
				onPredictionMade={handlePrediction}
				arrowDir={interfacePosition.arrowDir}
			/>
		</div>
	{:else if gameState.phase === 'playing'}
		<div
			class="fixed z-50"
			style="
                left: {interfacePosition.x}; 
                top: {interfacePosition.y}; 
                transform: translate({interfacePosition.transformX}, {interfacePosition.transformY});
                transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            "
		>
			<CardPlayInterface
				{gameState}
				onCardPlayed={handleCardPlay}
				arrowDir={interfacePosition.arrowDir}
			/>
		</div>
	{:else if gameState.phase === 'scoring'}
		<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
			<ScoringInterface {gameState} onNextRound={handleNextRound} />
		</div>
	{:else if gameState.phase === 'finished'}
		<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
			<div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 text-center">
				<h2 class="mb-4 text-2xl font-bold">Game Finished!</h2>

				<div class="mb-6">
					<h3 class="mb-2 font-bold">Final Scores:</h3>
					{#each gameState.players.sort((a, b) => b.score - a.score) as player, index}
						<div
							class="flex items-center justify-between py-1 {index === 0
								? 'font-bold text-yellow-600'
								: ''}"
						>
							<span>{index + 1}. {player.name}</span>
							<span>{player.score}</span>
							{#if index === 0}
								<span class="text-yellow-500">👑</span>
							{/if}
						</div>
					{/each}
				</div>

				<button
					class="rounded bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-700"
					onclick={handleRestart}
					disabled={gameState.paused}
				>
					Play Again
				</button>
			</div>
		</div>
	{/if}
{/if}
