<script lang="ts">
    import type { GameState } from '../../logic/gameLogic.js';
    import type { Card } from '../../logic/cards.js';
    import CardImage from '$lib/components/CardImage.svelte';

    export let gameState: GameState;
    export let onPredictionMade: (playerId: number, prediction: number) => void;

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
            const rankWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'];
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
            case 'red': return 'bg-red-500';
            case 'blue': return 'bg-blue-600';
            case 'green': return 'bg-green-600';
            case 'yellow': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    }

    function confirmBid() {
        onPredictionMade(gameState.currentPlayerIndex, selectedPrediction);
        selectedPrediction = 0;
        showDetails = false;
    }
</script>

<!-- Compact bidding interface -->
<div class="bg-white rounded-lg shadow-2xl border-4 border-blue-500 p-4 max-w-sm">
    <!-- Header -->
    <div class="text-center mb-3">
        <h3 class="text-lg font-bold">{currentPlayer.name}'s Bid</h3>
        {#if gameState.trumpSuit}
            <p class="text-sm text-gray-600">
                Trump: <span class="font-semibold capitalize">{gameState.trumpSuit}</span>
            </p>
        {:else}
            <p class="text-sm text-gray-600">No Trump</p>
        {/if}
    </div>

    <!-- Compact prediction input -->
    <div class="mb-3">
        <p class="text-sm font-medium mb-2 text-center">Predict tricks:</p>
        <div class="flex items-center justify-center gap-2">
            <button
                class="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                onclick={() => (selectedPrediction = Math.max(0, selectedPrediction - 1))}
            >
                -
            </button>
            <span class="w-12 text-center text-xl font-bold bg-gray-100 rounded py-1">
                {selectedPrediction}
            </span>
            <button
                class="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                onclick={() => (selectedPrediction = Math.min(gameState.currentRound, selectedPrediction + 1))}
            >
                +
            </button>
        </div>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-2 mb-3">
        <button
            class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700"
            onclick={confirmBid}
            disabled={gameState.paused}
        >
            Confirm: {selectedPrediction}
        </button>
        <button
            class="bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300"
            onclick={() => showDetails = !showDetails}
        >
            {showDetails ? '▲' : '▼'}
        </button>
    </div>

    <!-- Expandable details -->
    {#if showDetails}
        <div class="border-t pt-3 space-y-3">
            <!-- Player's hand (compact) -->
            <div>
                <p class="text-xs text-gray-600 mb-1">Your cards:</p>
                <div class="flex flex-wrap gap-1">
                    {#each currentPlayer.hand as card, index (getCardKey(card, index))}
                        <div class="group relative h-10 w-7 cursor-pointer">
                            <CardImage
                                src={getCardImagePath(card)}
                                alt={getCardDisplay(card)}
                                className="w-full h-full object-cover rounded border transition-opacity duration-300 group-hover:opacity-0"
                            />
                            <div class="absolute inset-0 {getCardColor(card)} flex items-center justify-center rounded text-xs font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                {getCardDisplay(card)}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Other players' bids (compact) -->
            <div>
                <p class="text-xs text-gray-600 mb-1">Other bids:</p>
                <div class="flex flex-wrap gap-1">
                    {#each gameState.players as player, index}
                        {#if index !== gameState.currentPlayerIndex}
                            <div class="bg-gray-100 rounded px-2 py-1 text-xs">
                                <span class="font-medium">{player.name.substring(0, 3)}</span>:
                                <span>{player.prediction >= 0 ? player.prediction : '?'}</span>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>