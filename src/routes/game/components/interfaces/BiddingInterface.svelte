<script lang="ts">
    import type { GameState } from '../../logic/gameLogic.js';
    import type { Card } from '../../logic/cards.js';
    import CardImage from '$lib/components/CardImage.svelte';

    export let gameState: GameState;
    export let onPredictionMade: (playerId: number, prediction: number) => void;
    export let arrowDir: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    let selectedPrediction = 0;
    let showDetails = false;
    $: currentPlayer = gameState.players[gameState.currentPlayerIndex];

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

    function confirmBid() {
        onPredictionMade(gameState.currentPlayerIndex, selectedPrediction);
        selectedPrediction = 0;
        showDetails = false;
    }

    function getArrowClasses() {
        switch (arrowDir) {
            case 'top':
                return 'absolute -top-4 left-1/2 -translate-x-1/2 rotate-180 text-yellow-400 text-4xl drop-shadow-lg';
            case 'bottom':
                return 'absolute -bottom-4 left-1/2 -translate-x-1/2 text-yellow-400 text-4xl drop-shadow-lg';
            case 'left':
                return 'absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-yellow-400 text-4xl drop-shadow-lg';
            case 'right':
                return 'absolute -right-4 top-1/2 -translate-y-1/2 rotate-90 text-yellow-400 text-4xl drop-shadow-lg';
        }
    }
</script>

<!-- Enlarged bidding interface with enhanced positioning -->
<div class="relative w-96 rounded-2xl border-4 border-blue-500 bg-white p-6 shadow-2xl">
    <!-- Enhanced arrow pointing to player -->
    <div class={getArrowClasses()}>▲</div>

    <!-- Header -->
    <div class="mb-6 text-center">
        <h3 class="text-2xl font-bold text-gray-800">{currentPlayer.name}'s Bid</h3>
        {#if gameState.trumpSuit}
            <p class="text-base text-gray-600 mt-2">
                Trump: <span class="font-semibold capitalize text-lg text-blue-600">{gameState.trumpSuit}</span>
            </p>
        {:else}
            <p class="text-base text-gray-600 mt-2">No Trump</p>
        {/if}
        <div class="mt-3 text-sm text-gray-500">
            Round {gameState.currentRound} • {currentPlayer.hand.length} cards
        </div>
    </div>

    <!-- Prediction input - enlarged -->
    <div class="mb-6">
        <p class="mb-4 text-center text-lg font-medium text-gray-700">Predict tricks to win:</p>
        <div class="flex items-center justify-center gap-4">
            <button
                class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-xl font-bold transition-all hover:bg-gray-300 hover:scale-105"
                onclick={() => (selectedPrediction = Math.max(0, selectedPrediction - 1))}
            >
                -
            </button>
            <div class="flex flex-col items-center">
                <span class="w-16 rounded-lg bg-blue-100 py-3 text-center text-3xl font-bold text-blue-800">
                    {selectedPrediction}
                </span>
                <span class="mt-1 text-xs text-gray-500">tricks</span>
            </div>
            <button
                class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-xl font-bold transition-all hover:bg-gray-300 hover:scale-105"
                onclick={() =>
                    (selectedPrediction = Math.min(gameState.currentRound, selectedPrediction + 1))}
            >
                +
            </button>
        </div>
    </div>

    <!-- Action buttons - enlarged -->
    <div class="mb-4 flex gap-3">
        <button
            class="flex-1 rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 hover:scale-105"
            onclick={confirmBid}
            disabled={gameState.paused}
        >
            Confirm Bid: {selectedPrediction}
        </button>
        <button
            class="rounded-xl bg-gray-200 px-4 py-4 text-lg text-gray-700 transition-all hover:bg-gray-300"
            onclick={() => (showDetails = !showDetails)}
        >
            {showDetails ? '▲' : '▼'}
        </button>
    </div>

    <!-- Expandable details - improved layout -->
    {#if showDetails}
        <div class="space-y-4 border-t-2 pt-4">
            <!-- Player's hand -->
            <div>
                <p class="mb-2 text-sm font-medium text-gray-700">Your cards:</p>
                <div class="flex flex-wrap justify-center gap-2">
                    {#each currentPlayer.hand as card, index (getCardKey(card, index))}
                        <div class="group relative h-16 w-11 cursor-pointer">
                            <CardImage
                                src={getCardImagePath(card)}
                                alt={getCardDisplay(card)}
                                className="w-full h-full object-cover rounded-lg border-2 transition-all duration-300 group-hover:opacity-0 group-hover:scale-105"
                            />
                            <div
                                class="absolute inset-0 {getCardColor(
                                    card
                                )} flex items-center justify-center rounded-lg text-sm font-bold text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
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
                                <span class="font-medium text-gray-800">{player.name}</span>:
                                <span class="font-bold text-blue-600">
                                    {player.prediction >= 0 ? player.prediction : '?'}
                                </span>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>