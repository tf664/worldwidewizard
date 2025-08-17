<script lang="ts">
	import type { GameState } from '../../logic/gameLogic.js';
	import type { Card } from '../../logic/cards.js';
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
			const zoroNumbers = ['one', 'two', 'three', 'four'];
			const randomZoro = zoroNumbers[Math.floor(Math.random() * 4)];
			return `/rcs/cards-optimized/zoro_${randomZoro}.webp`;
		}
		if (card.rank === 'Fool') {
			const foolNumbers = ['one', 'two', 'three', 'four'];
			const randomFool = foolNumbers[Math.floor(Math.random() * 4)];
			return `/rcs/cards-optimized/fool_${randomFool}.webp`;
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

	// Add unique key for each card
	function getCardKey(card: Card, index: number): string {
		return `${card.suit}-${card.rank}-${index}`;
	}

	function getCardColor(card: Card): string {
		if (card.rank === 'Zoro') {
			return 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400';
		}
		if (card.rank === 'Fool') {
			return 'bg-gradient-to-r from-red-400 via-yellow-300 to-blue-500';
		}

		switch (card.suit) {
			case 'red':
				return 'bg-red-500';
			case 'blue':
				return 'bg-blue-600';
			case 'green':
				return 'bg-green-600';
			case 'yellow':
				return 'bg-yellow-500';
			default:
				return 'bg-gray-500';
		}
	}

	function confirmBid() {
		onPredictionMade(gameState.currentPlayerIndex, selectedPrediction);
		selectedPrediction = 0;
	}
</script>

<!-- Modal-style bidding interface -->
<div class="fixed inset-0 z-50 flex items-center justify-center">
	<div class="mx-4 w-full max-w-2xl rounded-lg border-4 border-blue-500 bg-white p-6 shadow-2xl">
		<h2 class="mb-4 text-center text-2xl font-bold">
			{currentPlayer.name}'s Bid
		</h2>

		<!-- Show trump suit -->
		{#if gameState.trumpSuit}
			<div class="mb-4 text-center">
				<p class="text-sm font-medium">
					Trump Suit:
					<span class="text-lg font-bold capitalize">{gameState.trumpSuit}</span>
				</p>
			</div>
		{:else}
			<div class="mb-4 text-center">
				<p class="text-sm font-medium">No Trump This Round</p>
			</div>
		{/if}

		<!-- Show player's hand -->
		<div class="mb-4">
			<p class="mb-2 text-sm text-gray-600">Your cards:</p>
			<div class="flex flex-wrap justify-center gap-2">
				{#each currentPlayer.hand as card, index (getCardKey(card, index))}
					<div class="group relative h-16 w-12 cursor-pointer">
						<!-- Card Image -->
						<CardImage
							src={getCardImagePath(card)}
							alt={getCardDisplay(card)}
							className="w-full h-full object-cover rounded border transition-opacity duration-300 group-hover:opacity-0"
						/>

						<!-- Colored overlay with card value - hidden by default, visible on hover -->
						<div
							class="absolute inset-0 {getCardColor(
								card
							)} flex items-center justify-center rounded text-lg font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						>
							{getCardDisplay(card)}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Show other players' bids -->
		<div class="mb-4">
			<p class="mb-2 text-sm text-gray-600">Other players' bids:</p>
			<div class="grid grid-cols-2 gap-2 text-xs">
				{#each gameState.players as player, index}
					{#if index !== gameState.currentPlayerIndex}
						<div class="rounded bg-gray-100 p-2 text-center">
							<div class="font-semibold">{player.name}</div>
							<div>{player.prediction >= 0 ? player.prediction : '?'}</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Prediction input -->
		<div class="mb-6">
			<p class="mb-2 block text-sm font-medium">
				How many tricks will {currentPlayer.name} win?
			</p>
			<div class="flex items-center justify-center gap-4">
				<button
					class="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
					onclick={() => (selectedPrediction = Math.max(0, selectedPrediction - 1))}>-</button
				>
				<span class="w-16 text-center text-3xl font-bold">{selectedPrediction}</span>
				<button
					class="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
					onclick={() =>
						(selectedPrediction = Math.min(gameState.currentRound, selectedPrediction + 1))}
					>+</button
				>
			</div>
		</div>

		<button
			class="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			onclick={confirmBid}
			disabled={gameState.paused}
		>
			Confirm Bid: {selectedPrediction} tricks
		</button>
	</div>
</div>
