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

	// Track window size for responsive behavior
	let windowWidth = 0;
	let windowHeight = 0;
	$: isMobile = windowWidth < 768; // Mobile breakpoint

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
	$: if (gameState?.currentPlayerIndex !== undefined || windowWidth || windowHeight) {
		updateInterfacePosition();
		updateCurrentPlayerBorder();
	}

	async function updateInterfacePosition() {
		if (!gameState) return;

		// On mobile or small screens, always center the interface
		if (isMobile) {
			interfacePosition = {
				x: '50%',
				y: '50%',
				transformX: '-50%',
				transformY: '-50%',
				arrowDir: 'bottom' // Default arrow direction for mobile
			};
			return;
		}

		// On larger screens, position relative to player cards
		await tick();
		const el = document.getElementById(`player-${gameState.currentPlayerIndex}-card`);
		if (!el) {
			// Fallback to center if player card not found
			interfacePosition = {
				x: '50%',
				y: '50%',
				transformX: '-50%',
				transformY: '-50%',
				arrowDir: 'bottom'
			};
			return;
		}

		const rect = el.getBoundingClientRect();
		const position = getPlayerPosition(gameState.currentPlayerIndex);

		// Check if interface would go off-screen and fallback to center
		const interfaceWidth = 384; // w-96 = 384px
		const interfaceHeight = 400; // approximate height
		const margin = 16; // Reduced margin for closer positioning

		let newPosition: {
			x: string;
			y: string;
			transformX: string;
			transformY: string;
			arrowDir: 'top' | 'bottom' | 'left' | 'right';
		};

		switch (position) {
			case 'bottom':
				// Position interface to the right of the bottom player card
				newPosition = {
					x: `${rect.right + margin}px`,
					y: `${rect.top + rect.height / 2}px`,
					transformX: '0%',
					transformY: '-50%',
					arrowDir: 'left'
				};
				break;
			case 'top':
				// Position interface to the left of the top player card
				newPosition = {
					x: `${rect.left - margin}px`,
					y: `${rect.top + rect.height / 2}px`,
					transformX: '-100%',
					transformY: '-50%',
					arrowDir: 'right'
				};
				break;
			case 'left':
				// Position interface below the left player card
				newPosition = {
					x: `${rect.left + rect.width / 2}px`,
					y: `${rect.bottom + margin}px`,
					transformX: '-50%',
					transformY: '0%',
					arrowDir: 'top'
				};
				break;
			case 'right':
				// Position interface above the right player card
				newPosition = {
					x: `${rect.left + rect.width / 2}px`,
					y: `${rect.top - margin}px`,
					transformX: '-50%',
					transformY: '-100%',
					arrowDir: 'bottom'
				};
				break;
			default:
				newPosition = {
					x: '50%',
					y: '50%',
					transformX: '-50%',
					transformY: '-50%',
					arrowDir: 'bottom'
				};
				break;
		}

		// Check bounds and fallback to center if needed
		const finalX = parseFloat(newPosition.x);
		const finalY = parseFloat(newPosition.y);

		const wouldOverflowX =
			(newPosition.transformX === '-50%' &&
				(finalX - interfaceWidth / 2 < 0 || finalX + interfaceWidth / 2 > windowWidth)) ||
			(newPosition.transformX === '0%' && finalX + interfaceWidth > windowWidth) ||
			(newPosition.transformX === '-100%' && finalX - interfaceWidth < 0);

		const wouldOverflowY =
			(newPosition.transformY === '-50%' &&
				(finalY - interfaceHeight / 2 < 0 || finalY + interfaceHeight / 2 > windowHeight)) ||
			(newPosition.transformY === '0%' && finalY + interfaceHeight > windowHeight) ||
			(newPosition.transformY === '-100%' && finalY - interfaceHeight < 0);

		if (wouldOverflowX || wouldOverflowY) {
			// Fallback to center
			interfacePosition = {
				x: '50%',
				y: '50%',
				transformX: '-50%',
				transformY: '-50%',
				arrowDir: 'bottom'
			};
		} else {
			interfacePosition = newPosition;
		}
	}

	async function updateCurrentPlayerBorder() {
		if (!gameState) return;

		const playerIndex = gameState.currentPlayerIndex;
		const playerEl = document.getElementById(`player-${playerIndex}`);

		if (playerEl) {
			// Update the border of the current player
			playerEl.classList.add('border-4', 'border-yellow-500');
		}
	}

	function getPlayerPosition(index: number): string {
		const totalPlayers = gameState.players.length;

		// Calculate angle for each player in the circle (same as GameTable)
		const angleStep = (2 * Math.PI) / totalPlayers;
		const angle = Math.PI / 2 - index * angleStep;

		// Determine position name for arrow direction based on angle
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

	<!-- Game Overlays positioned relative to current player or centered on mobile -->
	{#if gameState.phase === 'bidding'}
		<div
			class="fixed z-50"
			class:inset-4={isMobile}
			class:flex={isMobile}
			class:items-center={isMobile}
			class:justify-center={isMobile}
			style={isMobile
				? ''
				: `left: ${interfacePosition.x}; top: ${interfacePosition.y}; transform: translate(${interfacePosition.transformX}, ${interfacePosition.transformY}); transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);`}
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
			class:inset-4={isMobile}
			class:flex={isMobile}
			class:items-center={isMobile}
			class:justify-center={isMobile}
			style={isMobile
				? ''
				: `left: ${interfacePosition.x}; top: ${interfacePosition.y}; transform: translate(${interfacePosition.transformX}, ${interfacePosition.transformY}); transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);`}
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
