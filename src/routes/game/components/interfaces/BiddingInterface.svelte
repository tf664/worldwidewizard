<script lang="ts">
	import type { GameState } from '../../logic/gameLogic.js';
	import type { Card } from '../../logic/cards.js';
	import { getForbiddenBid } from '../../logic/gameLogic.js';
	import CardImage from '$lib/components/CardImage.svelte';

	export let gameState: GameState;
	export let onPredictionMade: (playerId: number, prediction: number) => void;

	let selectedPrediction = 0;
	let showDetails = false;
	$: currentPlayer = gameState.players[gameState.currentPlayerIndex];
	$: forbiddenBid = getForbiddenBid(gameState, gameState.currentPlayerIndex);
	$: isLastBidder = forbiddenBid !== null;
	$: isForbiddenBid = selectedPrediction === forbiddenBid;

	// Track window size for responsive behavior
	let windowWidth = 0;
	$: isMobile = windowWidth < 768;

	// --- Card Utilities ---
	function getCardDisplay(card: Card): string {
		if (card.rank === 'Zoro') return 'Z';
		if (card.rank === 'Fool') return 'F';
		return card.rank.toString();
	}

	function getCardImagePath(card: Card): string {
		if (card.rank === 'Zoro' || card.rank === 'Fool') {
			const numbers = ['one', 'two', 'three', 'four'];
			const randomNum = numbers[Math.floor(Math.random() * 4)];
			return `/rcs/cards-optimized/${card.rank.toLowerCase()}_${randomNum}.webp`;
		}
		const suit = card.suit?.toLowerCase() || 'unknown';
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
		const rank = typeof card.rank === 'number' ? rankWords[card.rank] : 'unknown';
		return `/rcs/cards-optimized/${suit}_${rank}.webp`;
	}

	function getCardKey(card: Card, index: number) {
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
		if (isForbiddenBid) return; // Prevent forbidden bid
		onPredictionMade(gameState.currentPlayerIndex, selectedPrediction);
		selectedPrediction = 0;
		showDetails = false;
	}
</script>

<div
	class="relative mx-auto w-full max-w-sm rounded-2xl border-4 border-blue-500 bg-white p-4 shadow-2xl sm:max-w-md sm:p-6 md:w-96"
>
	<!-- Responsive content with consistent spacing -->
	<div class="space-y-4">
		<!-- Header -->
		<div class="text-center">
			<h3 class="truncate text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">
				{currentPlayer.name}'s Bid
			</h3>
			<p class="mt-1 text-sm text-gray-600 sm:text-base">
				Trump: <span class="font-semibold text-blue-600 capitalize">
					{gameState.trumpSuit || 'No Trump'}
				</span>
			</p>
			<div class="mt-1 text-xs text-gray-500 sm:text-sm">
				Round {gameState.currentRound} • {currentPlayer.hand.length} cards
			</div>
		</div>
		<!-- Prediction input -->
		<div class="mb-4 text-center">
			<p class={`${isMobile ? 'text-base' : 'text-lg'} mb-2 font-medium text-gray-700`}>
				Predict tricks to win:
			</p>

			{#if isLastBidder && forbiddenBid !== null}
				<div class="mb-2 text-sm font-medium text-red-600">
					Cannot bid {forbiddenBid} (total would equal {gameState.currentRound})
				</div>
			{/if}

			<div class="flex items-center justify-center gap-4">
				<button
					class={`flex items-center justify-center rounded-lg bg-gray-200 font-bold transition-all hover:scale-105 hover:bg-gray-300 
                ${isMobile ? 'h-10 w-10 text-lg' : 'h-12 w-12 text-xl'}`}
					onclick={() => (selectedPrediction = Math.max(0, selectedPrediction - 1))}>-</button
				>

				<div class="flex flex-col items-center">
					<span
						class={`rounded-lg text-center font-bold 
                        ${isForbiddenBid ? 'border-2 border-red-400 bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
                        ${isMobile ? 'w-14 py-2 text-2xl' : 'w-16 py-3 text-3xl'}`}
					>
						{selectedPrediction}
					</span>
					<span class="mt-1 text-xs text-gray-500">tricks</span>
				</div>

				<button
					class={`flex items-center justify-center rounded-lg bg-gray-200 font-bold transition-all hover:scale-105 hover:bg-gray-300
                ${isMobile ? 'h-10 w-10 text-lg' : 'h-12 w-12 text-xl'}`}
					onclick={() =>
						(selectedPrediction = Math.min(gameState.currentRound, selectedPrediction + 1))}
					>+</button
				>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="mb-4 flex gap-3">
			<button
				class={`flex-1 rounded-xl font-semibold text-white transition-all hover:scale-105
                ${isForbiddenBid ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                ${isMobile ? 'px-4 py-3 text-base' : 'px-6 py-4 text-lg'}`}
				onclick={confirmBid}
				disabled={gameState.paused || isForbiddenBid}
			>
				{isForbiddenBid ? 'Invalid Bid' : `Confirm: ${selectedPrediction}`}
			</button>
		</div>
		<!-- Player's hand -->
		<div>
			<p class="mb-2 text-sm font-medium text-gray-700">Your cards:</p>
			<div class="flex flex-wrap justify-center gap-2">
				{#each currentPlayer.hand as card, index (getCardKey(card, index))}
					<div class={`group relative cursor-pointer ${isMobile ? 'h-16 w-12' : 'h-20 w-14'}`}>
						<CardImage
							src={getCardImagePath(card)}
							alt={getCardDisplay(card)}
							className="h-full w-full rounded-lg border-2 object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-0"
						/>
						<div
							class={`absolute inset-0 flex items-center justify-center rounded-lg font-bold text-white opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 ${getCardColor(card)} ${isMobile ? 'text-sm' : 'text-base'}`}
						>
							{getCardDisplay(card)}
						</div>
					</div>
				{/each}
			</div>
		</div>
		<!-- Other players' bids -->
		<div>
			<p class="mb-2 text-sm font-medium text-gray-700">Other players' bids:</p>
			<div class="flex flex-wrap justify-center gap-2">
				{#each gameState.players as player, index}
					{#if index !== gameState.currentPlayerIndex}
						<div class="rounded-lg bg-gray-100 px-3 py-2 text-sm">
							<span class="font-medium text-gray-800"
								>{isMobile ? player.name.substring(0, 6) : player.name}</span
							>:
							<span class="font-bold text-blue-600"
								>{player.prediction >= 0 ? player.prediction : '?'}</span
							>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
