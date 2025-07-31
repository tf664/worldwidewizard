<script lang="ts">
	import CardImage from '$lib/components/CardImage.svelte';
	import type { GameState, TrickCard } from './gameLogic.js';
	import type { Card } from './cards.js';

	export let gameState: GameState;

	function getCardDisplay(card: Card): string {
		if (card.rank === 'Zoro') return 'Z';
		if (card.rank === 'Fool') return 'F';
		return card.rank.toString();
	}

	function getCardColor(card: Card): string {
		if (!card.suit) return 'bg-purple-600';
		switch (card.suit) {
			case 'red':
				return 'bg-red-500';
			case 'blue':
				return 'bg-blue-500';
			case 'green':
				return 'bg-green-500';
			case 'yellow':
				return 'bg-yellow-500';
			default:
				return 'bg-gray-500';
		}
	}

	function getCardImagePath(card: Card): string {
		if (card.rank === 'Zoro') {
			return `/rcs/cards-optimized/wizard_${Math.floor(Math.random() * 4) + 1}.webp`;
		}
		if (card.rank === 'Fool') {
			return `/rcs/cards-optimized/fool_${Math.floor(Math.random() * 4) + 1}.webp`;
		}

		const suitName = card.suit?.toLowerCase() || 'unknown';
		const rankName =
			typeof card.rank === 'number'
				? [
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
					][card.rank]
				: String(card.rank).toLowerCase();

		return `/rcs/cards-optimized/${suitName}_${rankName}.webp`;
	}
</script>

<div class="flex flex-col items-center justify-center h-full space-y-4">
	<!-- Round and Phase Info -->
	<div class="text-center text-white mb-4">
		<h2 class="text-2xl font-bold">Round {gameState.currentRound}</h2>
		<p class="text-lg capitalize">{gameState.phase} Phase</p>
		{#if gameState.trumpSuit}
			<p class="text-sm">
				Trump: <span class="capitalize font-semibold">{gameState.trumpSuit}</span>
			</p>
		{/if}
	</div>

	<!-- Current Trick Area -->
	<div class="bg-green-700 rounded-xl p-6 min-w-64 min-h-32 flex items-center justify-center">
		{#if gameState.currentTrick.length > 0}
			<div class="flex space-x-2">
				{#each gameState.currentTrick as trickCard}
					<div class="relative w-12 h-16 rounded border-2 border-white overflow-hidden">
						<CardImage
							src={getCardImagePath(trickCard.card)}
							alt={getCardDisplay(trickCard.card)}
							className="w-full h-full object-cover"
						/>
						<div
							class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-1 rounded"
						>
							{gameState.players[trickCard.playerId].name}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-white opacity-60">Waiting for cards...</p>
		{/if}
	</div>

	<!-- Trump Card Display -->
	{#if gameState.deck.length > 0}
		{@const trumpCard = gameState.deck[gameState.deck.length - 1]}
		<div class="flex items-center space-x-2">
			<span class="text-white text-sm">Trump Card:</span>
			<div class="relative w-10 h-14 rounded border border-white overflow-hidden">
				<CardImage
					src={getCardImagePath(trumpCard)}
					alt={getCardDisplay(trumpCard)}
					className="w-full h-full object-cover"
				/>
			</div>
		</div>
	{/if}

	<!-- Current Player Indicator -->
	{#if gameState.phase === 'playing' || gameState.phase === 'bidding'}
		<div class="text-white text-center">
			<p class="text-sm">Current Player:</p>
			<p class="font-bold text-lg">
				{gameState.players[gameState.currentPlayerIndex]?.name || 'Unknown'}
			</p>
		</div>
	{/if}
</div>
