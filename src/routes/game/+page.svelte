<script lang="ts">
	import type { GameState } from './logic/gameLogic.js';
	import { initializeGame, startNewRound, processPrediction, playCard } from './logic/gameLogic.js';
	import { onMount, tick } from 'svelte';
	import GameTable from './components/ui/GameTable.svelte';
	import BiddingInterface from './components/interfaces/BiddingInterface.svelte';
	import CardPlayInterface from './components/interfaces/CardPlayInterface.svelte';
	import ScoringInterface from './components/interfaces/ScoringInterface.svelte';
	import GameControls from './components/ui/GameControls.svelte';
	import { undoMove } from './logic/gameLogic.js';
	import { PanelPositionManager, type PanelPosition } from './components/ui/interfacePosition.js';
	import TrumpChoosingInterface from './components/interfaces/TrumpChoosingInterface.svelte';
	import { chooseTrumpSuit } from './logic/gameLogic.js';

	let gameState: GameState;
	let positionManager = new PanelPositionManager();
	let currentPanelPosition: PanelPosition = {
		x: '50%',
		y: '50%',
		transformX: '-50%',
		transformY: '-50%',
		arrowDir: 'bottom',
		position: 'bottom'
	};

	// Responsive breakpoints
	let windowWidth = 0;
	let windowHeight = 0;
	let containerRef: HTMLElement;
	let interfaceRef: HTMLElement;
	let positionsInitialized = false;
	let playerElements: HTMLElement[] = []; // Add this line

	$: isMobile = windowWidth < 768;
	$: isTablet = windowWidth >= 768 && windowWidth < 1024;
	$: isSmallScreen = windowWidth < 1024 || windowHeight < 600;

	// Dynamic scaling based on screen size
	$: interfaceScale = getInterfaceScale(windowWidth, windowHeight);

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

	onMount(() => {
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

		return () => clearInterval(intervalId);
	});

	// Initialize positions when game state and window dimensions are ready
	$: if (gameState && windowWidth > 0 && windowHeight > 0) {
		initializeOrUpdatePositions();
	}

	// Update current position when current player changes
	$: if (gameState?.currentPlayerIndex !== undefined && positionsInitialized) {
		currentPanelPosition = positionManager.getPlayerPosition(gameState.currentPlayerIndex);
	}

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

	// Add this function to handle player elements ready
	function handlePlayerElementsReady(elements: HTMLElement[]) {
		playerElements = elements;
		if (gameState && windowWidth > 0 && windowHeight > 0) {
			initializeOrUpdatePositions();
		}
	}

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

	function handleRestart() {
		positionsInitialized = false; // Force position recalculation
		gameState = initializeGame(getPlayerNames());
		startNewRound(gameState);
	}

	function handlePause() {
		gameState.paused = !gameState.paused;
		gameState = { ...gameState };
	}

	function handleUndo() {
		undoMove(gameState);
		gameState = { ...gameState };
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
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

{#if gameState}
	<div class="relative h-screen overflow-hidden bg-green-800" bind:this={containerRef}>
		<GameTable {gameState} onPlayerElementsReady={handlePlayerElementsReady} />
	</div>

	<GameControls
		{gameState}
		onRestart={handleRestart}
		onPause={handlePause}
		onUndo={handleUndo}
		{elapsed}
		{formatTime}
	/>

	<!-- Dynamic Interface Positioning -->
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
					<TrumpChoosingInterface
						{gameState}
						onTrumpChosen={handleTrumpChoice}
						arrowDir={currentPanelPosition.arrowDir}
					/>
				{:else if gameState.phase === 'bidding'}
					<BiddingInterface
						{gameState}
						onPredictionMade={handlePrediction}
						arrowDir={currentPanelPosition.arrowDir}
					/>
				{:else if gameState.phase === 'playing'}
					<CardPlayInterface
						{gameState}
						onCardPlayed={handleCardPlay}
						arrowDir={currentPanelPosition.arrowDir}
					/>
				{/if}
			</div>
		</div>
	{:else if gameState.phase === 'scoring'}
		<ScoringInterface {gameState} onNextRound={handleNextRound} />
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
					on:click={handleRestart}
					disabled={gameState.paused}
				>
					Play Again
				</button>
			</div>
		</div>
	{/if}
{/if}
