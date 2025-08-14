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
		const m = Math.floor(seconds / 60).toString().padStart(2, '0');
		const s = (seconds % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}

	onMount(() => {
		startTime = Date.now();
		intervalId = setInterval(() => {
			elapsed = Math.floor((Date.now() - startTime) / 1000);
		}, 1000);

		return () => clearInterval(intervalId);
	});
</script>

{#if gameState}
	<!-- Full screen game table -->
	<div class="h-screen bg-green-800 relative overflow-hidden">
		<GameTable {gameState} />
	</div>

	<!-- Game Controls -->
	<GameControls {gameState} onRestart={handleRestart} onPause={handlePause} onUndo={handleUndo} elapsed={elapsed} formatTime={formatTime} />

	<!-- Game Overlays -->
	{#if gameState.phase === 'bidding'}
		<BiddingInterface {gameState} onPredictionMade={handlePrediction} />
	{:else if gameState.phase === 'playing'}
		<CardPlayInterface {gameState} onCardPlayed={handleCardPlay} />
	{:else if gameState.phase === 'scoring'}
		<ScoringInterface {gameState} onNextRound={handleNextRound} />
	{:else if gameState.phase === 'finished'}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
				<h2 class="text-2xl font-bold mb-4">Game Finished!</h2>

				<div class="mb-6">
					<h3 class="font-bold mb-2">Final Scores:</h3>
					{#each gameState.players.sort((a, b) => b.score - a.score) as player, index}
						<div
							class="flex justify-between items-center py-1 {index === 0
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
					class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold"
					onclick={handleRestart}
				>
					Play Again
				</button>
			</div>
		</div>
	{/if}
{/if}
