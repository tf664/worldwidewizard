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
	import {
		calculateOptimalPosition,
		type InterfacePosition,
		type PlayerBounds,
		type Position
	} from './components/ui/interfacePosition.js';

	let gameState: GameState;
	let interfacePosition: InterfacePosition = {
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

	$: isMobile = windowWidth < 768;
	$: isTablet = windowWidth >= 768 && windowWidth < 1024;
	$: isSmallScreen = windowWidth < 1024 || windowHeight < 600;

	// Dynamic scaling based on screen size
	$: interfaceScale = getInterfaceScale(windowWidth, windowHeight);
	$: panelDimensions = getPanelDimensions(interfaceScale);

	function getInterfaceScale(width: number, height: number): number {
		if (isMobile) return 0.65;
		if (isTablet) return 0.7;
		if (isSmallScreen) return 0.75;
		return 0.8;
	}

	function getPanelDimensions(scale: number): { width: number; height: number } {
		const baseWidth = 384; // 24rem
		const baseHeight = 400; // Estimated height
		return {
			width: baseWidth * scale,
			height: baseHeight * scale
		};
	}

	function getPlayerNames(): string[] {
		// Get player names from localStorage (saved in /setup)
		const storedPlayers = localStorage.getItem('players');
		return storedPlayers ? JSON.parse(storedPlayers) : ['Player 1', 'Player 2', 'Player 3']; // Fallback names
	}

	onMount(() => {
		// Initialize game with the player names from setup
		gameState = initializeGame(getPlayerNames());
		startNewRound(gameState);

		// Timer setup
		startTime = Date.now();

		intervalId = setInterval(() => {
			// Only increment elapsed if game is not paused
			if (gameState && !gameState.paused) {
				elapsed = Math.floor((Date.now() - startTime) / 1000);
			} else {
				// Adjust startTime so that elapsed doesn't jump after resuming
				startTime = Date.now() - elapsed * 1000;
			}
		}, 1000);

		return () => clearInterval(intervalId);
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

	// Recalculate position whenever current player changes or window resizes
	$: if (gameState?.currentPlayerIndex !== undefined) {
		updateInterfacePosition();
	}
	$: if (windowWidth || windowHeight) {
		updateInterfacePosition();
	}

	async function updateInterfacePosition() {
		if (!gameState) return;

		// Mobile always centers
		if (isMobile) {
			interfacePosition = {
				x: '50%',
				y: '50%',
				transformX: '-50%',
				transformY: '-50%',
				arrowDir: 'bottom',
				position: 'bottom'
			};
			return;
		}

		await tick();
		await new Promise((resolve) => setTimeout(resolve, 50));

		const playerElement = document.getElementById(`player-${gameState.currentPlayerIndex}`);
		if (!playerElement) {
			interfacePosition = getCenterFallback();
			return;
		}

		const rect = playerElement.getBoundingClientRect();
		const playerBounds: PlayerBounds = {
			rect,
			position: getPlayerPosition(gameState.currentPlayerIndex),
			index: gameState.currentPlayerIndex
		};

		const newPosition = calculateOptimalPosition(
			playerBounds,
			panelDimensions.width,
			panelDimensions.height,
			windowWidth,
			windowHeight,
			20
		);

		interfacePosition = newPosition;
	}

	function getCenterFallback(): InterfacePosition {
		return {
			x: '50%',
			y: '50%',
			transformX: '-50%',
			transformY: '-50%',
			arrowDir: 'bottom',
			position: 'bottom'
		};
	}

	function getPlayerPosition(index: number): Position {
		const totalPlayers = gameState.players.length;
		const angleStep = (2 * Math.PI) / totalPlayers;
		const angle = Math.PI / 2 - index * angleStep;
		const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

		if (normalizedAngle >= (7 * Math.PI) / 4 || normalizedAngle < Math.PI / 4) {
			return 'right';
		} else if (normalizedAngle >= Math.PI / 4 && normalizedAngle < (3 * Math.PI) / 4) {
			return 'top';
		} else if (normalizedAngle >= (3 * Math.PI) / 4 && normalizedAngle < (5 * Math.PI) / 4) {
			return 'left';
		} else {
			return 'bottom';
		}
	}
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

{#if gameState}
	<div class="relative h-screen overflow-hidden bg-green-800" bind:this={containerRef}>
		<GameTable {gameState} />
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
	{#if gameState.phase === 'bidding' || gameState.phase === 'playing'}
		<div
			class="pointer-events-none fixed z-50 transition-all duration-300 ease-out"
			class:inset-4={isMobile}
			class:flex={isMobile}
			class:items-center={isMobile}
			class:justify-center={isMobile}
			style={isMobile
				? 'pointer-events: auto;'
				: `left: ${interfacePosition.x}; top: ${interfacePosition.y}; transform: translate(${interfacePosition.transformX}, ${interfacePosition.transformY}); pointer-events: auto;`}
		>
			<div
				class="origin-center"
				style="transform: scale({interfaceScale})"
				bind:this={interfaceRef}
			>
				{#if gameState.phase === 'bidding'}
					<BiddingInterface
						{gameState}
						onPredictionMade={handlePrediction}
						arrowDir={interfacePosition.arrowDir}
					/>
				{:else if gameState.phase === 'playing'}
					<CardPlayInterface
						{gameState}
						onCardPlayed={handleCardPlay}
						arrowDir={interfacePosition.arrowDir}
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
