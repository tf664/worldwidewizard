<script lang="ts">
	import type { GameState } from './gameLogic.js';
	import type { Card } from './cards.js';
	import CardImage from '$lib/components/CardImage.svelte';

	export let gameState: GameState;
	export let onPredictionMade: (playerId: number, prediction: number) => void;

	let selectedPrediction = 0;
	$: currentPlayer = gameState.players[gameState.currentPlayerIndex];

	function getCardDisplay(card: Card): string {
		if (card.rank === 'Zoro') return 'Z';
		if (card.rank === 'Fool') return 'F';
		return card.rank.toString();
	}

	function getCardImagePath(card: Card): string {
		if (card.rank === 'Zoro') {
			return `/rcs/cards-optimized/zoro_${Math.floor(Math.random() * 4) + 1}.webp`;
		}
		if (card.rank === 'Fool') {
			return `/rcs/cards-optimized/fool_${Math.floor(Math.random() * 4) + 1}.webp`;
		}

		const suitName = card.suit?.toLowerCase() || 'unknown';

		if (typeof card.rank === 'number') {
			const rankWords = [
				'',
				'one',
				'two',
				'three',
				'four',
				'five',
				'six',
				'seven',
				'eight',
				'nine',
				'ten',
				'eleven',
				'twelve',
				'thirteen'
			];
			const rankName = rankWords[card.rank] || 'unknown';
			return `/rcs/cards-optimized/${suitName}_${rankName}.webp`;
		}

		return `/rcs/cards-optimized/unknown_unknown.webp`;
	}

	function confirmBid() {
		onPredictionMade(gameState.currentPlayerIndex, selectedPrediction);
		selectedPrediction = 0; // Reset for next player
	}
</script>

<!-- Modal-style bidding interface -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
	<div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
		<h2 class="text-2xl font-bold mb-4 text-center">
			{currentPlayer.name}'s Bid
		</h2>

		<!-- Show trump suit -->
		{#if gameState.trumpSuit}
			<div class="mb-4 text-center">
				<p class="text-sm font-medium">
					Trump Suit:
					<span class="capitalize font-bold text-lg">{gameState.trumpSuit}</span>
				</p>
			</div>
		{:else}
			<div class="mb-4 text-center">
				<p class="text-sm font-medium">No Trump This Round</p>
			</div>
		{/if}

		<!-- Show player's hand -->
		<div class="mb-4">
			<p class="text-sm text-gray-600 mb-2">Your cards:</p>
			<div class="flex flex-wrap gap-1 justify-center">
				{#each currentPlayer.hand as card}
					<div class="w-8 h-12 relative">
						<CardImage
							src={getCardImagePath(card)}
							alt={getCardDisplay(card)}
							className="w-full h-full object-cover rounded border"
						/>
					</div>
				{/each}
			</div>
		</div>

		<!-- Show other players' bids -->
		<div class="mb-4">
			<p class="text-sm text-gray-600 mb-2">Other players' bids:</p>
			<div class="grid grid-cols-2 gap-2 text-xs">
				{#each gameState.players as player, index}
					{#if index !== gameState.currentPlayerIndex}
						<div class="bg-gray-100 p-2 rounded text-center">
							<div class="font-semibold">{player.name}</div>
							<div>{player.prediction >= 0 ? player.prediction : '?'}</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Prediction input -->
		<div class="mb-6">
			<p class="block text-sm font-medium mb-2">
				How many tricks will {currentPlayer.name} win?
			</p>
			<div class="flex items-center justify-center gap-4">
				<button
					class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
					on:click={() => (selectedPrediction = Math.max(0, selectedPrediction - 1))}>-</button
				>
				<span class="text-3xl font-bold w-16 text-center">{selectedPrediction}</span>
				<button
					class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
					on:click={() =>
						(selectedPrediction = Math.min(gameState.currentRound, selectedPrediction + 1))}
					>+</button
				>
			</div>
		</div>

		<button
			class="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
			on:click={confirmBid}
		>
			Confirm Bid: {selectedPrediction} tricks
		</button>
	</div>
</div>
