<script lang="ts">
	import CardImage from '$lib/components/CardImage.svelte';
	import type { Player } from '../../types/player.js';
	import type { Card } from '../../logic/cards.js';

	export let player: Player;
	export let position: 'top' | 'left' | 'right' | 'bottom';

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
			const zoroNumbers = ['one', 'two', 'three', 'four'];
			const randomZoro = zoroNumbers[Math.floor(Math.random() * 4)];
			return `/rcs/cards-optimized/zoro_${randomZoro}.webp`;
		}
		if (card.rank === 'Fool') {
			const foolNumbers = ['one', 'two', 'three', 'four'];
			const randomFool = foolNumbers[Math.floor(Math.random() * 4)];
			return `/rcs/cards-optimized/fool_${randomFool}.webp`;
		}

		// Handle number cards
		const suitName = card.suit?.toLowerCase() || 'unknown';

		// Explicitly handle number ranks only
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

		// Fallback
		return `/rcs/cards-optimized/_placeholder_.webp`;
	}
</script>

<div class="h-full flex flex-col items-center justify-center bg-green-700 m-2 rounded-lg p-4">
	<div class="text-white text-center mb-4">
		<h3 class="font-bold text-lg">{player.name}</h3>
		<div class="text-sm space-y-1">
			<p>Score: <span class="font-semibold">{player.score}</span></p>
			<p>Prediction: <span class="font-semibold">{player.prediction}</span></p>
			<p>Tricks Won: <span class="font-semibold">{player.tricksWon}</span></p>
		</div>
	</div>

	<!-- Player's hand -->
	<div class="flex flex-wrap gap-1 justify-center">
		{#if position === 'bottom'}
			<!-- Show actual cards for bottom player (current player) -->
			{#each player.hand as card}
				<div
					class="relative w-8 h-12 rounded border border-white cursor-pointer hover:scale-105 transition-transform overflow-hidden"
				>
					<CardImage
						src={getCardImagePath(card)}
						alt={getCardDisplay(card)}
						className="w-full h-full object-cover"
					/>
					<!-- Fallback overlay -->
					<div
						class="absolute inset-0 {getCardColor(
							card
						)} rounded flex items-center justify-center text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity"
					>
						{getCardDisplay(card)}
					</div>
				</div>
			{/each}
		{:else}
			<!-- Show card backs for other players -->
			{#each Array(player.hand.length) as _}
				<div class="relative w-8 h-12 rounded border border-white overflow-hidden">
					<CardImage
						src="/rcs/cards-optimized/card_back.webp"
						alt="Card back"
						className="w-full h-full object-cover"
					/>
					<!-- Fallback for card back -->
					<div
						class="absolute inset-0 bg-blue-900 rounded flex items-center justify-center text-white text-xs opacity-0 hover:opacity-100 transition-opacity"
					>
						?
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
