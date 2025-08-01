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
</script>

<div class="fixed inset-0 flex items-center justify-center z-50">
	<div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl border-4 border-blue-500">
		<h2 class="text-2xl font-bold mb-4 text-center">
			{currentPlayer.name}'s Turn
		</h2>

		<!-- Show current trick -->
		<div class="mb-6">
			<h3 class="font-semibold mb-2">Cards played this trick:</h3>
			<div class="flex gap-2 justify-center min-h-20 items-center bg-green-100 rounded p-4">
				{#each gameState.currentTrick as trickCard, trickIndex}
					<div class="w-12 h-16 relative">
						<CardImage
							src={getCardImagePath(trickCard.card)}
							alt={getCardDisplay(trickCard.card)}
							className="w-full h-full object-cover rounded border"
						/>
						<div
							class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-1 rounded"
						>
							{gameState.players[trickCard.playerId].name}
						</div>
					</div>
				{:else}
					<p class="text-gray-500">No cards played yet</p>
				{/each}
			</div>
		</div>

		<!-- Player's hand -->
		<div class="mb-6">
			<h3 class="font-semibold mb-2">Choose a card to play:</h3>
			<div class="grid grid-cols-8 gap-2 justify-center">
				{#each currentPlayer.hand as card, index (getCardKey(card, index))}
					<button
						class="relative w-16 h-24 rounded border-2 transition-all group {validCards[index]
							? 'border-green-500 hover:border-green-700 cursor-pointer hover:scale-105'
							: 'border-gray-300 opacity-50 cursor-not-allowed'}"
						disabled={!validCards[index]}
						onclick={() => onCardPlayed(gameState.currentPlayerIndex, index)}
					>
						<!-- Card Image -->
						<CardImage
							src={getCardImagePath(card)}
							alt={getCardDisplay(card)}
							className="w-full h-full object-cover rounded transition-opacity duration-300 group-hover:opacity-0"
						/>

						<!-- Colored overlay with card value - hidden by default, visible on hover -->
						<div
							class="absolute inset-0 {getCardColor(
								card
							)} rounded flex items-center justify-center text-white font-bold text-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						>
							{getCardDisplay(card)}
						</div>

						<!-- Valid play indicator only -->
						{#if validCards[index]}
							<div class="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full"></div>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- Game info -->
		<div class="text-sm text-gray-600 text-center">
			<p>Trump: {gameState.trumpSuit || 'None'} | Round: {gameState.currentRound}</p>
			<p>Prediction: {currentPlayer.prediction} | Tricks won: {currentPlayer.tricksWon}</p>
		</div>
	</div>
</div>
