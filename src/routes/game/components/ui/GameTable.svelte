<script lang="ts">
	import type { GameState } from '../../logic/gameLogic.js';
	import type { Card } from '../../logic/cards.js';
	import CardImage from '$lib/components/CardImage.svelte';

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

	function getPlayerCircularPosition(
		index: number,
		totalPlayers: number
	): { x: number; y: number; position: string } {
		// Calculate angle for each player in the circle
		// Start from top (90 degrees) and go clockwise
		const angleStep = (2 * Math.PI) / totalPlayers;
		const angle = Math.PI / 2 - index * angleStep; // Start from top, go clockwise

		// Radius from center (adjust based on screen size)
		const radius = 480; // Distance from center

		// Calculate position
		const x = Math.cos(angle) * radius;
		const y = -Math.sin(angle) * radius; // Negative because CSS y increases downward

		// Determine position name for arrow direction
		let position: string;
		const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

		if (normalizedAngle >= (7 * Math.PI) / 4 || normalizedAngle < Math.PI / 4) {
			position = 'right';
		} else if (normalizedAngle >= Math.PI / 4 && normalizedAngle < (3 * Math.PI) / 4) {
			position = 'top';
		} else if (normalizedAngle >= (3 * Math.PI) / 4 && normalizedAngle < (5 * Math.PI) / 4) {
			position = 'left';
		} else {
			position = 'bottom';
		}

		return { x, y, position };
	}

	function getPlayerPosition(index: number): string {
		const totalPlayers = gameState.players.length;
		return getPlayerCircularPosition(index, totalPlayers).position;
	}

	function isCurrentPlayer(index: number): boolean {
		return gameState.currentPlayerIndex === index;
	}
</script>

<div class="relative flex h-full w-full items-center justify-center">
	<!-- Player Areas arranged in circle -->
	{#each gameState.players as player, index}
		{@const totalPlayers = gameState.players.length}
		{@const circularPos = getPlayerCircularPosition(index, totalPlayers)}
		{@const isCurrent = isCurrentPlayer(index)}

		<!-- Player Info Card -->
		<div
			id="player-{index}-card"
			class="absolute {isCurrent
				? 'ring-4 ring-yellow-400'
				: ''} min-w-48 rounded-lg bg-green-700 p-4 text-white"
			style="left: 50%; top: 50%; transform: translate(calc(-50% + {circularPos.x}px), calc(-50% + {circularPos.y}px));"
		>
			<div class="text-center">
				<h3 class="mb-2 text-lg font-bold">{player.name}</h3>
				<div class="grid grid-cols-3 gap-2 text-sm">
					<div>
						<div class="font-semibold">Score</div>
						<div class="text-xl">{player.score}</div>
					</div>
					<div>
						<div class="font-semibold">Predicted</div>
						<div class="text-xl">{player.prediction >= 0 ? player.prediction : '?'}</div>
					</div>
					<div>
						<div class="font-semibold">Tricks</div>
						<div class="text-xl">{player.tricksWon}</div>
					</div>
				</div>

				<!-- Show hand count -->
				<div class="mt-3 text-xs opacity-75">
					Cards: {player.hand.length}
				</div>

				<!-- Current player indicator -->
				{#if isCurrent}
					<div class="mt-2 rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-black">
						Current Player
					</div>
				{/if}
			</div>
		</div>
	{/each}

	<!-- Central Game Area -->
	<div
		class="relative flex h-80 w-80 flex-col items-center justify-center rounded-full bg-green-600 text-white"
	>
		<!-- Game Info -->
		<div class="mb-4 text-center">
			<h2 class="text-2xl font-bold">Round {gameState.currentRound}</h2>
			<p class="text-lg capitalize">{gameState.phase} Phase</p>
			{#if gameState.trumpSuit}
				<p class="mt-1 text-sm">
					Trump: <span class="font-semibold capitalize">{gameState.trumpSuit}</span>
				</p>
			{:else}
				<p class="mt-1 text-sm">No Trump</p>
			{/if}
		</div>

		<!-- Current Trick -->
		<div class="flex flex-col items-center">
			<h3 class="mb-2 text-sm font-semibold">Current Trick</h3>
			<div class="flex min-h-16 items-center space-x-1">
				{#if gameState.currentTrick.length > 0}
					{#each gameState.currentTrick as trickCard}
						<div class="relative h-14 w-10 overflow-hidden rounded border border-white">
							<CardImage
								src={getCardImagePath(trickCard.card)}
								alt={getCardDisplay(trickCard.card)}
								className="w-full h-full object-cover"
							/>
							<!-- Player name -->
							<div
								class="absolute -bottom-4 left-1/2 -translate-x-1/2 transform rounded bg-blue-600 px-1 text-xs whitespace-nowrap text-white"
							>
								{gameState.players[trickCard.playerId].name}
							</div>
						</div>
					{/each}
				{:else}
					<p class="text-sm opacity-75">No cards played</p>
				{/if}
			</div>
		</div>

		<!-- Trump Card (if exists) -->
		{#if gameState.deck.length > 0}
			{@const trumpCard = gameState.deck[gameState.deck.length - 1]}
			<div class="absolute -right-2 -bottom-2">
				<div class="relative h-16 w-12 overflow-hidden rounded border border-white">
					<CardImage
						src={getCardImagePath(trumpCard)}
						alt={getCardDisplay(trumpCard)}
						className="w-full h-full object-cover"
					/>
					<div
						class="absolute -bottom-3 left-1/2 -translate-x-1/2 transform rounded bg-yellow-600 px-1 text-xs font-bold text-black"
					>
						Trump
					</div>
				</div>
			</div>
		{/if}

		<!-- Deck Count -->
		<div class="absolute -top-2 -left-2 rounded bg-blue-600 px-2 py-1 text-xs text-white">
			Deck: {gameState.deck.length}
		</div>
	</div>
</div>
