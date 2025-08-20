<script lang="ts">
	// Type Imports
	import type { GameState } from './logic/gameLogic.js';
	import type { Suit } from './logic/cards.js';
	import type { PanelPosition } from './components/ui/interfacePosition.js';
	// Core Svelte Imports
	import { onMount, tick } from 'svelte';
	// Game Logic Imports
	import {
		initializeGame,
		startNewRound,
		processPrediction,
		playCard,
		undoMove,
		chooseTrumpSuit
	} from './logic/gameLogic.js';
	import { PanelPositionManager } from './components/ui/interfacePosition.js';

	// Component Imports
	import GameTable from './components/ui/GameTable.svelte';
	import GameControls from './components/ui/GameControls.svelte';
	import BiddingInterface from './components/interfaces/BiddingInterface.svelte';
	import CardPlayInterface from './components/interfaces/CardPlayInterface.svelte';
	import ScoringInterface from './components/interfaces/ScoringInterface.svelte';
	import TrumpChoosingInterface from './components/interfaces/TrumpChoosingInterface.svelte';

	// ===========================================
	// STATE MANAGEMENT
	// ===========================================
	let gameState: GameState;

	// Position Management
	let positionManager = new PanelPositionManager();
	let currentPanelPosition: PanelPosition = {
		x: '50%',
		y: '50%',
		transformX: '-50%',
		transformY: '-50%',
		position: 'bottom'
	};
	let positionsInitialized = false;
	let playerElements: HTMLElement[] = [];

	let containerRef: HTMLElement;
	let interfaceRef: HTMLElement;

	let windowWidth = 0;
	let windowHeight = 0;

	let startTime: number;
	let elapsed = 0;
	let intervalId: ReturnType<typeof setInterval>;

	// ===========================================
	// REACTIVE COMPUTATIONS
	// ===========================================
	$: isMobile = windowWidth < 768;
	$: isTablet = windowWidth >= 768 && windowWidth < 1024;
	$: isSmallScreen = windowWidth < 1024 || windowHeight < 600;
	$: interfaceScale = getInterfaceScale(windowWidth, windowHeight);

	// Position Management Reactions
	$: if (gameState && windowWidth > 0 && windowHeight > 0) {
		initializeOrUpdatePositions();
	}

	$: if (gameState?.currentPlayerIndex !== undefined && positionsInitialized) {
		currentPanelPosition = positionManager.getPlayerPosition(gameState.currentPlayerIndex);
	}

	// ===========================================
	// UTILITY FUNCTIONS
	// ===========================================
	function getInterfaceScale(width: number, height: number): number {
		if (isMobile) return 0.65;
		if (isTablet) return 0.7;
		if (isSmallScreen) return 0.75;
		return 0.8;
	}

	function getPlayerNames(): string[] {
		const storedPlayers = localStorage.getItem('players');
		return storedPlayers ? JSON.parse(storedPlayers) : ['Player 1', 'Player 2', 'Player 3'];
	}

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60)
			.toString()
			.padStart(2, '0');
		const s = (seconds % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}

	// ===========================================
	// POSITION MANAGEMENT
	// ===========================================
	async function initializeOrUpdatePositions() {
		if (!gameState || playerElements.length === 0) return;

		const shouldRecalc =
			!positionsInitialized || positionManager.shouldRecalculate(windowWidth, windowHeight);

		if (shouldRecalc) {
			// Wait for DOM to be ready
			await tick();
			await new Promise((resolve) => setTimeout(resolve, 100));

			console.log('Initializing panel positions for', gameState.players.length, 'players');

			// Use the new DOM-based method
			positionManager.initializePositionsFromDOM(
				playerElements,
				windowWidth,
				windowHeight,
				interfaceScale
			);

			positionsInitialized = true;
			currentPanelPosition = positionManager.getPlayerPosition(gameState.currentPlayerIndex);

			console.log('Panel positions initialized');
		}
	}

	function handlePlayerElementsReady(elements: HTMLElement[]) {
		playerElements = elements;
		if (gameState && windowWidth > 0 && windowHeight > 0) {
			initializeOrUpdatePositions();
		}
	}

	// ===========================================
	// GAME ACTION HANDLERS
	// ===========================================
	function handleTrumpChoice(playerId: number, suit: Suit) {
		if (chooseTrumpSuit(gameState, playerId, suit)) {
			gameState = { ...gameState };
		}
	}

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
					// TODO ? adjust scoring
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

	// ===========================================
	// CONTROL HANDLERS
	// ===========================================
	function handleRestart() {
		positionsInitialized = false; // Force position recalculation
		gameState = initializeGame(getPlayerNames());
		startNewRound(gameState);
	}

	function handlePause() {
		gameState.paused = !gameState.paused;
		gameState = { ...gameState }; // Trigger reactivity
	}

	function handleUndo() {
		undoMove(gameState);
		gameState = { ...gameState }; // Trigger reactivity
	}

	// ===========================================
	// LIFECYCLE
	// ===========================================
	onMount(() => {
		// Initialize game state
		gameState = initializeGame(getPlayerNames());
		startNewRound(gameState);

		// Timer setup
		startTime = Date.now();
		intervalId = setInterval(() => {
			if (gameState && !gameState.paused) {
				elapsed = Math.floor((Date.now() - startTime) / 1000);
			} else {
				startTime = Date.now() - elapsed * 1000;
			}
		}, 1000);

		// Cleanup function
		return () => clearInterval(intervalId);
	});
</script>

<!-- Window size binding -->
<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

{#if gameState}
	<!-- GAME TABLE CONTAINER -->
	<div class="relative h-screen overflow-hidden bg-green-800" bind:this={containerRef}>
		<GameTable {gameState} onPlayerElementsReady={handlePlayerElementsReady} />
	</div>

	<!-- GAME CONTROLS -->
	<GameControls
		{gameState}
		onRestart={handleRestart}
		onPause={handlePause}
		onUndo={handleUndo}
		{elapsed}
		{formatTime}
	/>

	<!-- DYNAMIC INTERFACE PANELS -->
	{#if gameState.phase === 'choosing-trump' || gameState.phase === 'bidding' || gameState.phase === 'playing'}
		<div
			class="pointer-events-none fixed z-50 transition-all duration-500 ease-out"
			class:inset-4={isMobile}
			class:flex={isMobile}
			class:items-center={isMobile}
			class:justify-center={isMobile}
			style={isMobile
				? 'pointer-events: auto;'
				: `left: ${currentPanelPosition.x}; top: ${currentPanelPosition.y}; transform: translate(${currentPanelPosition.transformX}, ${currentPanelPosition.transformY}); pointer-events: auto;`}
		>
			<div
				class="origin-center transition-transform duration-300"
				style="transform: scale({interfaceScale})"
				bind:this={interfaceRef}
			>
				{#if gameState.phase === 'choosing-trump'}
					<TrumpChoosingInterface {gameState} onTrumpChosen={handleTrumpChoice} />
				{:else if gameState.phase === 'bidding'}
					<BiddingInterface {gameState} onPredictionMade={handlePrediction} />
				{:else if gameState.phase === 'playing'}
					<CardPlayInterface {gameState} onCardPlayed={handleCardPlay} />
				{/if}
			</div>
		</div>
	{/if}

	<!-- SCORING INTERFACE -->
	{#if gameState.phase === 'scoring'}
		<ScoringInterface {gameState} onNextRound={handleNextRound} />
	{/if}

	<!-- GAME FINISHED -->
	{#if gameState.phase === 'finished'}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<div
				class="mx-4 w-full max-w-md rounded-2xl border-4 border-yellow-500 bg-white p-6 shadow-2xl"
			>
				<!-- Winner spotlight -->
				{#if gameState.players.length > 0}
					{@const winner = gameState.players.sort((a, b) => b.score - a.score)[0]}
					<div
						class="mb-6 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 p-4 text-center text-white shadow-lg"
					>
						<div class="mb-2 flex justify-center">
							<svg
								class="h-8 w-8 text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
									clip-rule="evenodd"
								></path>
							</svg>
						</div>
						<h3 class="text-xl font-bold">{winner.name} Wins!</h3>
						<p class="text-lg font-semibold">{winner.score} points</p>
					</div>
				{/if}

				<!-- Final Scores -->
				<div class="mb-6">
					<h3 class="mb-4 text-center text-lg font-bold text-gray-800">Final Scores</h3>
					<div class="space-y-2">
						{#each gameState.players.sort((a, b) => b.score - a.score) as player, index}
							<div
								class="flex items-center justify-between rounded-lg p-3 transition-colors
                            {index === 0
									? 'border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100'
									: index === 1
										? 'border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100'
										: index === 2
											? 'border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100'
											: 'border border-gray-200 bg-gray-50'}"
							>
								<div class="flex items-center gap-3">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white
                                    {index === 0
											? 'bg-yellow-500'
											: index === 1
												? 'bg-gray-500'
												: index === 2
													? 'bg-orange-500'
													: 'bg-gray-400'}"
									>
										{index + 1}
									</div>
									<span class="font-semibold text-gray-800 {index === 0 ? 'text-yellow-800' : ''}"
										>{player.name}</span
									>
								</div>

								<div class="flex items-center gap-2">
									<span
										class="text-lg font-bold {index === 0 ? 'text-yellow-700' : 'text-gray-700'}"
										>{player.score}</span
									>
									{#if index === 0}
										<svg
											class="h-5 w-5 text-yellow-500"
											fill="currentColor"
											viewBox="0 0 20 20"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												fill-rule="evenodd"
												d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
												clip-rule="evenodd"
											></path>
										</svg>
									{:else if index === 1}
										<svg
											class="h-5 w-5 text-gray-500"
											fill="currentColor"
											viewBox="0 0 20 20"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												fill-rule="evenodd"
												d="M10 12a2 2 0 100-4 2 2 0 000 4z"
												clip-rule="evenodd"
											></path>
											<path
												fill-rule="evenodd"
												d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
												clip-rule="evenodd"
											></path>
										</svg>
									{:else if index === 2}
										<svg
											class="h-5 w-5 text-orange-500"
											fill="currentColor"
											viewBox="0 0 20 20"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												fill-rule="evenodd"
												d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
												clip-rule="evenodd"
											></path>
										</svg>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Game Statistics -->
				<div class="mb-6 rounded-lg bg-gray-50 p-4">
					<h4 class="mb-3 text-center font-semibold text-gray-700">Game Statistics</h4>
					<div class="gap-4 text-sm">
						<div class="text-center">
							<div class="font-bold text-gray-800">{formatTime(elapsed)}</div>
							<div class="text-gray-600">Total Time</div>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-3">
					<button
						class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
						on:click={handleRestart}
						disabled={gameState.paused}
					>
						<svg
							class="h-5 w-5"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
								clip-rule="evenodd"
							></path>
						</svg>
						Play Again
					</button>
					<button
						class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-600 px-4 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-gray-700"
						on:click={() => (window.location.href = '/')}
					>
						<svg
							class="h-5 w-5"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
							></path>
						</svg>
						Main Menu
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}
