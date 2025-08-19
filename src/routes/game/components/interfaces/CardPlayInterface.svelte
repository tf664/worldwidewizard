<script lang="ts">
	import type { GameState } from '../../logic/gameLogic.js';
	import type { Card, Suit } from '../../logic/cards.js';
	import { isValidCardPlay } from '../../logic/gameRules.js';
	import CardImage from '$lib/components/CardImage.svelte';

	export let gameState: GameState;
	export let onCardPlayed: (playerId: number, cardIndex: number) => void;

	interface TrickCard {
		card: Card;
		playerId: number;
	}

	$: currentPlayer = gameState.players[gameState.currentPlayerIndex];
	$: validCards = getValidCards(currentPlayer.hand, gameState.currentTrick, gameState.trumpSuit);

	let showDetails = false;

	function getValidCards(hand: Card[], trick: TrickCard[], trumpSuit: Suit | null): boolean[] {
		const leadSuit = trick.length > 0 ? trick[0].card.suit : null;
		return hand.map((card) =>
			isValidCardPlay(
				card,
				hand,
				leadSuit,
				trick.map((t) => t.card)
			)
		);
	}

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

	function getPlayerPosition(index: number): string {
		const positions = ['bottom', 'left', 'top', 'right'];
		return positions[index] || 'bottom';
	}

	function getArrowClasses(): string {
		const position = getPlayerPosition(gameState.currentPlayerIndex);
		switch (position) {
			case 'bottom':
				return 'absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl';
			case 'top':
				return 'absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl rotate-180';
			case 'left':
				return 'absolute -right-6 top-1/2 transform -translate-y-1/2 text-yellow-400 text-2xl -rotate-90';
			case 'right':
				return 'absolute -left-6 top-1/2 transform -translate-y-1/2 text-yellow-400 text-2xl rotate-90';
			default:
				return 'absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl';
		}
	}
</script>

<!-- Compact card play interface with positioning arrow -->
<div class="relative max-w-md rounded-lg border-4 border-blue-500 bg-white p-4 shadow-2xl">
	<!-- Arrow pointing to player -->
	<div class={getArrowClasses()}>▲</div>

	<!-- Header -->
	<div class="mb-3 text-center">
		<h3 class="text-lg font-bold">{currentPlayer.name}'s Turn</h3>
		<div class="flex justify-center gap-4 text-sm text-gray-600">
			<span>Trump: {gameState.trumpSuit || 'None'}</span>
			<span>Pred: {currentPlayer.prediction}</span>
			<span>Won: {currentPlayer.tricksWon}</span>
		</div>
	</div>

	<!-- Compact hand display -->
	<div class="mb-3">
		<p class="mb-2 text-center text-sm font-medium">Choose your card:</p>
		<div class="flex flex-wrap justify-center gap-1">
			{#each currentPlayer.hand as card, index (getCardKey(card, index))}
				<button
					class="group relative h-14 w-10 rounded border-2 transition-all {validCards[index]
						? 'cursor-pointer border-green-500 hover:scale-105 hover:border-green-700'
						: 'cursor-not-allowed border-gray-300 opacity-50'}"
					disabled={!validCards[index] || gameState.paused}
					onclick={() => onCardPlayed(gameState.currentPlayerIndex, index)}
				>
					<CardImage
						src={getCardImagePath(card)}
						alt={getCardDisplay(card)}
						className="w-full h-full object-cover rounded transition-opacity duration-300 group-hover:opacity-0"
					/>

					<div
						class="absolute inset-0 {getCardColor(
							card
						)} flex items-center justify-center rounded text-xs font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					>
						{getCardDisplay(card)}
					</div>

					{#if validCards[index]}
						<div class="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-green-500"></div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Toggle details button -->
	<div class="text-center">
		<button
			class="rounded bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
			onclick={() => (showDetails = !showDetails)}
		>
			{showDetails ? 'Hide Details ▲' : 'Show Trick ▼'}
		</button>
	</div>

	<!-- Expandable current trick -->
	{#if showDetails}
		<div class="mt-3 border-t pt-3">
			<h4 class="mb-2 text-sm font-semibold">Current Trick:</h4>
			<div class="flex min-h-12 items-center justify-center gap-1 rounded bg-green-100 p-2">
				{#each gameState.currentTrick as trickCard, trickIndex}
					<div class="relative h-11 w-8">
						<CardImage
							src={getCardImagePath(trickCard.card)}
							alt={getCardDisplay(trickCard.card)}
							className="w-full h-full object-cover rounded border"
						/>
						<div
							class="absolute -bottom-1 left-1/2 -translate-x-1/2 transform rounded bg-blue-600 px-1 text-xs text-white"
						>
							{gameState.players[trickCard.playerId].name.substring(0, 2)}
						</div>
					</div>
				{:else}
					<p class="text-gray-500 text-sm">No cards played yet</p>
				{/each}
			</div>
		</div>
	{/if}
</div>
