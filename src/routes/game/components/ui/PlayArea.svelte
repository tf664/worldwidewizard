<script lang="ts">
	import CardImage from '$lib/components/CardImage.svelte';
	import type { GameState } from '../../logic/gameLogic.js';
	import type { Card } from '../../logic/cards.js';

	export let gameState: GameState;

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

<div class="flex h-full flex-col items-center justify-center space-y-4">
	<!-- Round and Phase Info -->
	<div class="mb-4 text-center text-white">
		<h2 class="text-2xl font-bold">Round {gameState.currentRound}</h2>
		<p class="text-lg capitalize">{gameState.phase} Phase</p>
		{#if gameState.trumpSuit}
			<p class="text-sm">
				Trump: <span class="font-semibold capitalize">{gameState.trumpSuit}</span>
			</p>
		{/if}
	</div>

	<!-- Current Trick Area -->
	<div class="flex min-h-32 min-w-64 items-center justify-center rounded-xl bg-green-700 p-6">
		{#if gameState.currentTrick.length > 0}
			<div class="flex space-x-2">
				{#each gameState.currentTrick as trickCard}
					<div class="relative h-16 w-12 overflow-hidden rounded border-2 border-white">
						<CardImage
							src={getCardImagePath(trickCard.card)}
							alt={getCardDisplay(trickCard.card)}
							className="w-full h-full object-cover"
						/>
						<div
							class="absolute -bottom-2 left-1/2 -translate-x-1/2 transform rounded bg-blue-600 px-1 text-xs text-white"
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
			<span class="text-sm text-white">Trump Card:</span>
			<div class="relative h-14 w-10 overflow-hidden rounded border border-white">
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
		<div class="text-center text-white">
			<p class="text-sm">Current Player:</p>
			<p class="text-lg font-bold">
				{gameState.players[gameState.currentPlayerIndex]?.name || 'Unknown'}
			</p>
		</div>
	{/if}
</div>
