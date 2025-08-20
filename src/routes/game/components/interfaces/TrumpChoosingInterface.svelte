<script lang="ts">
    import type { GameState } from '../../logic/gameLogic.js';
    import type { Suit, Card } from '../../logic/cards.js';
    import { chooseTrumpSuit } from '../../logic/gameLogic.js';
    import CardImage from '$lib/components/CardImage.svelte';

    export let gameState: GameState;
    export let onTrumpChosen: (playerId: number, suit: Suit) => void;
    export let arrowDir: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    // Track window size for responsive behavior
    let windowWidth = 0;
    $: isMobile = windowWidth < 768;
    $: shouldShowArrow = !isMobile && arrowDir;

    $: currentPlayer = gameState.players[gameState.trumpChooser || 0];
    $: trumpCard = gameState.deck[gameState.deck.length - 1];

    let selectedSuit: Suit | null = null;

    const suits: { suit: Suit; name: string; color: string; bgColor: string }[] = [
        { suit: 'blue', name: 'Blue', color: 'text-blue-500', bgColor: 'bg-blue-700' },
        { suit: 'red', name: 'Red', color: 'text-red-500', bgColor: 'bg-red-700' },
        { suit: 'green', name: 'Green', color: 'text-green-500', bgColor: 'bg-green-700' },
        {
            suit: 'yellow',
            name: 'Yellow',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-600'
        }
    ];

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

    function confirmTrumpChoice() {
        if (selectedSuit && gameState.trumpChooser !== undefined) {
            onTrumpChosen(gameState.trumpChooser, selectedSuit);
            selectedSuit = null;
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

<div
    class="relative mx-auto w-full max-w-sm rounded-2xl border-4 border-purple-500 bg-white p-2 shadow-2xl sm:max-w-md sm:p-4 md:w-96"
>
    <!-- Dynamic Arrow -->
    {#if shouldShowArrow}
        <div class={getArrowClasses()}>▲</div>
    {/if}

    <!-- Header -->
    <div class="mb-2 text-center">
        <h3 class="truncate text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">
            {currentPlayer.name} - Choose Trump
        </h3>
        <p class="mt-1 text-sm text-gray-600 sm:text-base">
            The trump card is <span class="font-bold text-purple-600">Zoro</span>
        </p>
        <div class="mt-1 text-xs text-gray-500 sm:text-sm">
            Round {gameState.currentRound} • {currentPlayer.hand.length} cards
        </div>
    </div>

    <!-- Trump Card Display -->
    <div class="mb-4 flex justify-center">
        <div class="relative">
            <div
                class="flex h-20 w-14 items-center justify-center rounded-lg border-2 border-purple-300 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-2xl font-bold text-white shadow-lg sm:h-24 sm:w-16"
            >
                Z
            </div>
            <div
                class="absolute -bottom-2 left-1/2 -translate-x-1/2 transform rounded bg-purple-600 px-2 py-1 text-xs font-bold text-white"
            >
                Zoro
            </div>
        </div>
    </div>

    <!-- Player's hand -->
    <div class="mb-4">
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

    <!-- Suit Selection -->
    <div class="mb-6">
        <p class={`${isMobile ? 'text-base' : 'text-lg'} mb-4 text-center font-medium text-gray-700`}>
            Choose the trump suit:
        </p>
        <div class="grid grid-cols-2 gap-3">
            {#each suits as suitOption}
                <button
                    class="group relative rounded-xl border-2 p-4 transition-all hover:scale-105 {selectedSuit ===
                    suitOption.suit
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-300'
                        : 'border-gray-200 hover:border-gray-300'}"
                    onclick={() => (selectedSuit = suitOption.suit)}
                >
                    <div class="flex flex-col items-center space-y-2">
                        <div
                            class="flex h-12 w-12 items-center justify-center rounded-full {suitOption.bgColor} text-2xl font-bold text-white shadow-md transition-transform group-hover:scale-110"
                        ></div>
                        <span class="font-semibold {suitOption.color}">{suitOption.name}</span>
                    </div>

                    {#if selectedSuit === suitOption.suit}
                        <div
                            class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white ring-2 ring-white"
                        >
                            ✓
                        </div>
                    {/if}
                </button>
            {/each}
        </div>
    </div>

    <!-- Confirm Button -->
    <div class="mb-4">
        <button
            class={`w-full rounded-xl font-semibold text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100
            ${isMobile ? 'px-4 py-3 text-base' : 'px-6 py-4 text-lg'}
            ${
                            selectedSuit
                                ? `${suits.find((s) => s.suit === selectedSuit)?.bgColor} hover:brightness-110`
                                : 'bg-gray-400 hover:bg-gray-500'
                        }`}
            onclick={confirmTrumpChoice}
            disabled={!selectedSuit || gameState.paused}
        >
            {#if selectedSuit}
                Confirm: {suits.find((s) => s.suit === selectedSuit)?.name} Trump
            {:else}
                Select a trump suit
            {/if}
        </button>
    </div>

    <!-- Game Info -->
    <div class="text-center">
        <p class="mb-2 text-sm font-medium text-gray-700">Round info:</p>
        <div class="flex justify-center gap-2">
            <div class="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                <span class="font-medium text-gray-800">Round</span>:
                <span class="font-bold text-blue-600">{gameState.currentRound}</span>
            </div>
            <div class="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                <span class="font-medium text-gray-800">Dealer</span>:
                <span class="font-bold text-green-600">{gameState.players[gameState.dealer].name}</span>
            </div>
        </div>
    </div>
</div>