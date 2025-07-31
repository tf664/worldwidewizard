<script lang="ts">
	import CardImage from '$lib/components/CardImage.svelte';
	import type { GameState } from './gameLogic.js';
	import type { Card } from './cards.js';

	export let gameState: GameState;

	function getCardDisplay(card: Card): string {
		if (card.rank === 'Zoro') return 'Z';
		if (card.rank === 'Fool') return 'F';
		return card.rank.toString();
	}

	function getCardColor(card: Card): string {
		if (!card.suit) return 'bg-purple-600'; // Zoro/Fool

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

	function getTrumpCardDisplay(): Card | null {
		if (gameState.deck.length === 0) return null;
		return gameState.deck[gameState.deck.length - 1];
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
				: String(card.rank).toLowerCase(); // Fix: Convert to string first

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
				{#each gameState.currentTrick as card}
					<div class="relative w-12 h-16 rounded border-2 border-white overflow-hidden">
						<!-- Use CardImage with fallback -->
						<CardImage
							src={getCardImagePath(card)}
							alt={getCardDisplay(card)}
							className="w-full h-full object-cover"
						/>
						<!-- Fallback overlay with color and text -->
						<div
							class="absolute inset-0 {getCardColor(
								card
							)} rounded flex items-center justify-center text-white font-bold opacity-0 hover:opacity-100 transition-opacity"
						>
							{getCardDisplay(card)}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-white opacity-60">Waiting for cards...</p>
		{/if}
	</div>

	<!-- Trump Card Display -->
	{#if getTrumpCardDisplay()}
		{@const trumpCard = getTrumpCardDisplay()!}
		<div class="flex items-center space-x-2">
			<span class="text-white text-sm">Trump Card:</span>
			<div class="relative w-10 h-14 rounded border border-white overflow-hidden">
				<CardImage
					src={getCardImagePath(trumpCard)}
					alt={getCardDisplay(trumpCard)}
					className="w-full h-full object-cover"
				/>
				<!-- Fallback overlay -->
				<div
					class="absolute inset-0 {getCardColor(
						trumpCard
					)} rounded flex items-center justify-center text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity"
				>
					{getCardDisplay(trumpCard)}
				</div>
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

	<!-- Game Status Messages -->
	{#if gameState.phase === 'bidding'}
		<div class="bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
			<p class="text-sm font-semibold">Bidding Phase</p>
			<p class="text-xs">Players are making their predictions</p>
		</div>
	{:else if gameState.phase === 'playing'}
		<div class="bg-yellow-600 text-white px-4 py-2 rounded-lg text-center">
			<p class="text-sm font-semibold">Playing Phase</p>
			<p class="text-xs">Trick {gameState.currentTrick.length + 1} of {gameState.currentRound}</p>
		</div>
	{:else if gameState.phase === 'scoring'}
		<div class="bg-green-600 text-white px-4 py-2 rounded-lg text-center">
			<p class="text-sm font-semibold">Scoring Phase</p>
			<p class="text-xs">Calculating round results</p>
		</div>
	{:else if gameState.phase === 'finished'}
		<div class="bg-purple-600 text-white px-4 py-2 rounded-lg text-center">
			<p class="text-sm font-semibold">Game Finished!</p>
			<p class="text-xs">Final scores calculated</p>
		</div>
	{/if}

	<!-- Deck Count -->
	<div class="text-white text-xs opacity-75">
		Cards remaining: {gameState.deck.length}
	</div>
</div>
