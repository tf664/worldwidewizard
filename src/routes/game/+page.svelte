<script lang="ts">
	import type { GameState } from './logic/gameLogic.js';
	import { initializeGame, startNewRound, processPrediction, playCard } from './logic/gameLogic.js';
	import { onMount } from 'svelte';
	import GameTable from './components/ui/GameTable.svelte';
	import BiddingInterface from './components/interfaces/BiddingInterface.svelte';
	import CardPlayInterface from './components/interfaces/CardPlayInterface.svelte';
	import ScoringInterface from './components/interfaces/ScoringInterface.svelte';
	import GameControls from './components/ui/GameControls.svelte';

	let gameState: GameState;

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
		console.log('Game paused');
	}

	function handleUndo() {
		console.log('Undo last move');
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
</script>

{#if gameState}
	<!-- Full screen game table -->
	<div class="relative h-screen overflow-hidden bg-green-800">
		<GameTable {gameState} />
	</div>

	<!-- Game Controls -->
	<GameControls {gameState} onRestart={handleRestart} {elapsed} {formatTime} />

	<!-- Game Overlays -->
	{#if gameState.phase === 'bidding'}
		<BiddingInterface {gameState} onPredictionMade={handlePrediction} />
	{:else if gameState.phase === 'playing'}
		<CardPlayInterface {gameState} onCardPlayed={handleCardPlay} />
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
					onclick={handleRestart}
				>
					Play Again
				</button>
			</div>
		</div>
	{/if}
{/if}
