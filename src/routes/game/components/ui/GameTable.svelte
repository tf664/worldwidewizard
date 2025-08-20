<script lang="ts">
	import type { GameState } from '../../logic/gameLogic.js';
	import type { Card } from '../../logic/cards.js';
	import CardImage from '$lib/components/CardImage.svelte';

	export let gameState: GameState;

	let windowWidth = 0;
	let windowHeight = 0;
	$: responsiveConfig = getResponsiveConfig(windowWidth, windowHeight);
	$: isMobile = responsiveConfig.breakpoint === 'mobile';

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

	function isCurrentPlayer(index: number): boolean {
		return gameState.currentPlayerIndex === index;
	}

	function getResponsiveConfig(width: number, height: number) {
		const breakpoint = width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';

		const minDimension = Math.min(width, height);
		const configs = {
			mobile: {
				breakpoint: 'mobile',
				radius: minDimension * 0.3,
				cardSize: { width: 'w-6', height: 'h-10' },
				playerCardSize: { width: 'min-w-28', padding: 'p-2' },
				centralSize: 'h-48 w-48',
				textSize: { header: 'text-base', body: 'text-xs', score: 'text-sm' }
			},
			tablet: {
				breakpoint: 'tablet',
				radius: minDimension * 0.35,
				cardSize: { width: 'w-8', height: 'h-12' },
				playerCardSize: { width: 'min-w-32', padding: 'p-3' },
				centralSize: 'h-60 w-60',
				textSize: { header: 'text-lg', body: 'text-xs', score: 'text-base' }
			},
			desktop: {
				breakpoint: 'desktop',
				radius: minDimension * 0.42,
				cardSize: { width: 'w-10', height: 'h-14' },
				playerCardSize: { width: 'min-w-48', padding: 'p-4' },
				centralSize: 'h-80 w-80',
				textSize: { header: 'text-xl', body: 'text-sm', score: 'text-xl' }
			}
		};

		return configs[breakpoint];
	}

	// Enhanced circular positioning with collision avoidance
	function getPlayerCircularPosition(
		index: number,
		totalPlayers: number,
		windowWidth: number,
		windowHeight: number,
		config: any // Add config parameter
	): { x: number; y: number; position: string } {
		const angleStep = (2 * Math.PI) / totalPlayers;
		const startAngle = Math.PI / 2; // Start from top
		const angle = startAngle - index * angleStep;

		const x = Math.cos(angle) * config.radius; // Use passed config
		const y = -Math.sin(angle) * config.radius; // Use passed config

		const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
		let position: string;

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
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<div class="relative flex h-full w-full items-center justify-center">
	<!-- Player Cards with enhanced responsive positioning -->
	{#each gameState.players as player, index}
		{@const totalPlayers = gameState.players.length}
		{@const circularPos = getPlayerCircularPosition(
			index,
			totalPlayers,
			windowWidth,
			windowHeight,
			responsiveConfig
		)}
		{@const isCurrent = isCurrentPlayer(index)}

		<div
			id="player-{index}"
			class="absolute {isCurrent ? 'ring-opacity-75 ring-4 ring-yellow-400' : ''} 
                   {responsiveConfig.playerCardSize.width} {responsiveConfig.playerCardSize.padding}
                   rounded-lg bg-green-700 text-white shadow-lg transition-all duration-300
                   {isCurrent ? 'z-10 scale-105' : 'z-0'}"
			style="left: 50%; top: 50%; transform: translate(calc(-50% + {circularPos.x}px), calc(-50% + {circularPos.y}px));"
		>
			<!-- Player info with responsive text sizes -->
			<div class="text-center">
				<h3 class="{responsiveConfig.textSize.header} mb-1 truncate font-bold" title={player.name}>
					{player.name}
				</h3>
				<div class="grid grid-cols-3 gap-1 {responsiveConfig.textSize.body}">
					<div>
						<div class="font-semibold">Score</div>
						<div class={responsiveConfig.textSize.score}>{player.score}</div>
					</div>
					<div>
						<div class="font-semibold">Pred</div>
						<div class={responsiveConfig.textSize.score}>
							{player.prediction >= 0 ? player.prediction : '?'}
						</div>
					</div>
					<div>
						<div class="font-semibold">Won</div>
						<div class={responsiveConfig.textSize.score}>{player.tricksWon}</div>
					</div>
				</div>

				<div class="mt-2 {responsiveConfig.textSize.body} opacity-75">
					Cards: {player.hand.length}
				</div>

				{#if isCurrent}
					<div class="mt-1 rounded bg-yellow-400 px-1 py-0.5 text-xs font-bold text-black">
						Current
					</div>
				{/if}
			</div>
		</div>
	{/each}

	<!-- Central game area with responsive sizing -->
	<div
		class="relative flex {responsiveConfig.centralSize} flex-col items-center justify-center rounded-full bg-green-600 text-white shadow-inner"
	>
		<!-- Game Info -->
		<div class="mb-4 text-center">
			<h2 class="{isMobile ? 'text-xl' : 'text-2xl'} font-bold">Round {gameState.currentRound}</h2>
			<p class="{isMobile ? 'text-base' : 'text-lg'} capitalize">{gameState.phase} Phase</p>
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
						<div
							class="relative {isMobile
								? 'h-12 w-8'
								: 'h-14 w-10'} overflow-hidden rounded border border-white"
						>
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
				<div
					class="relative {isMobile
						? 'h-12 w-8'
						: 'h-16 w-12'} overflow-hidden rounded border border-white"
				>
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
