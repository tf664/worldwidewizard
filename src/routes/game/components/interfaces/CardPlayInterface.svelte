<script lang="ts">
	import type { GameState } from '../../logic/gameLogic.js';
	import type { Card, Suit } from '../../logic/cards.js';
	import { isValidCardPlay } from '../../logic/gameRules.js';
	import CardImage from '$lib/components/CardImage.svelte';

	export let gameState: GameState;
	export let onCardPlayed: (playerId: number, cardIndex: number) => void;
	export let arrowDir: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

	// Track window size for consistent mobile detection
	let windowWidth = 0;
	$: isMobile = windowWidth < 768;
	$: shouldShowArrow = !isMobile && arrowDir;

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
		if (card.rank === 'Zoro') return 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400';
		if (card.rank === 'Fool') return 'bg-gradient-to-r from-red-400 via-yellow-300 to-blue-500';

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

	function getArrowClasses() {
		const baseClasses = 'absolute text-yellow-400 text-3xl drop-shadow-lg pointer-events-none z-10';
		const positions = {
			top: '-top-3 left-1/2 -translate-x-1/2 rotate-180',
			bottom: '-bottom-3 left-1/2 -translate-x-1/2',
			left: '-left-3 top-1/2 -translate-y-1/2 -rotate-90',
			right: '-right-3 top-1/2 -translate-y-1/2 rotate-90'
		};

		return `${baseClasses} ${positions[arrowDir]}`;
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div class="relative w-96 rounded-2xl border-4 border-green-500 bg-white p-6 shadow-2xl">
	<!-- Dynamic Arrow - only show when not mobile -->
	{#if shouldShowArrow}
		<div class={getArrowClasses()}>▲</div>
	{/if}
	<div class="mb-6 text-center">
		<h3 class="text-2xl font-bold text-gray-800">{currentPlayer.name}'s Turn</h3>
		{#if gameState.trumpSuit}
			<p class="mt-2 text-base text-gray-600">
				Trump: <span class="text-lg font-semibold text-green-600 capitalize"
					>{gameState.trumpSuit}</span
				>
			</p>
		{:else}
			<p class="mt-2 text-base text-gray-600">No Trump</p>
		{/if}
		<div class="mt-3 flex justify-center gap-4 text-sm text-gray-500">
			<span>Predicted: <span class="font-bold text-blue-600">{currentPlayer.prediction}</span></span
			>
			<span>Won: <span class="font-bold text-green-600">{currentPlayer.tricksWon}</span></span>
		</div>
	</div>

	<div class="mb-6">
		<p class="mb-4 text-center text-lg font-medium text-gray-700">Choose your card:</p>
		<div class="flex flex-wrap justify-center gap-2">
			{#each currentPlayer.hand as card, index (getCardKey(card, index))}
				<button
					class="group relative h-22 w-14 rounded-lg border-2 transition-all {validCards[index]
						? 'cursor-pointer border-green-500 hover:scale-110 hover:border-green-700 hover:shadow-lg'
						: 'cursor-not-allowed border-gray-300 opacity-50'}"
					disabled={!validCards[index] || gameState.paused}
					onclick={() => onCardPlayed(gameState.currentPlayerIndex, index)}
				>
					<CardImage
						src={getCardImagePath(card)}
						alt={getCardDisplay(card)}
						className="w-full h-full object-cover rounded-lg transition-all duration-300 group-hover:opacity-0 group-hover:scale-105"
					/>
					<div
						class="absolute inset-0 {getCardColor(
							card
						)} flex items-center justify-center rounded-lg text-sm font-bold text-white opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
					>
						{getCardDisplay(card)}
					</div>

					{#if validCards[index]}
						<div
							class="absolute top-1 right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
						></div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<div class="text-center">
		<button
			class="rounded-xl bg-gray-200 px-6 py-3 text-base text-gray-700 transition-all hover:bg-gray-300"
			onclick={() => (showDetails = !showDetails)}
		>
			{showDetails ? 'Hide Current Trick ▲' : 'Show Current Trick ▼'}
		</button>
	</div>

	{#if showDetails}
		<div class="mt-4 space-y-4 border-t-2 pt-4">
			<div>
				<h4 class="mb-3 text-base font-semibold text-gray-700">Current Trick:</h4>
				<div class="flex min-h-16 items-center justify-center gap-2 rounded-lg bg-green-50 p-4">
					{#each gameState.currentTrick as trickCard, trickIndex}
						<div class="relative h-16 w-11">
							<CardImage
								src={getCardImagePath(trickCard.card)}
								alt={getCardDisplay(trickCard.card)}
								className="w-full h-full object-cover rounded-lg border-2"
							/>
							<div
								class="absolute -bottom-2 left-1/2 -translate-x-1/2 transform rounded bg-blue-600 px-1 py-0.5 text-xs font-medium text-white"
							>
								{gameState.players[trickCard.playerId].name.substring(0, 3)}
							</div>
						</div>
					{:else}
						<p class="text-gray-500 text-base">No cards played yet</p>
					{/each}
				</div>
			</div>

			<div>
				<p class="mb-2 text-sm font-medium text-gray-700">Game info:</p>
				<div class="flex flex-wrap justify-center gap-2">
					<div class="rounded-lg bg-gray-100 px-3 py-2 text-sm">
						<span class="font-medium text-gray-800">Round</span>:
						<span class="font-bold text-blue-600">{gameState.currentRound}</span>
					</div>
					<div class="rounded-lg bg-gray-100 px-3 py-2 text-sm">
						<span class="font-medium text-gray-800">Cards left</span>:
						<span class="font-bold text-green-600">{currentPlayer.hand.length}</span>
					</div>
					<div class="rounded-lg bg-gray-100 px-3 py-2 text-sm">
						<span class="font-medium text-gray-800">Deck</span>:
						<span class="font-bold text-purple-600">{gameState.deck.length}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
