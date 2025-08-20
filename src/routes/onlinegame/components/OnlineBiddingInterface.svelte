<script lang="ts">
    import type { GameState, Player, Card } from '$lib/stores/socket';
    import CardImage from '$lib/components/CardImage.svelte';

    export let gameState: GameState;
    export let currentPlayer: Player | null;
    export let onPrediction: (prediction: number) => void;

    let selectedPrediction = 0;
    let showInterface = false;

    // Dragging state
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let windowX = 0;
    let windowY = 0;
    let interfaceElement: HTMLElement;
    let hasInitializedPosition = false;

    // Window size tracking
    let windowWidth = 0;
    let windowHeight = 0;
    $: isMobile = windowWidth < 768;

    // FIXED: Consistent trump display functions
    function getTrumpSuitDisplay(trumpSuit: string | null): string {
        if (!trumpSuit) return 'No Trump';
        return trumpSuit.charAt(0).toUpperCase() + trumpSuit.slice(1);
    }

    function getTrumpSuitColor(trumpSuit: string | null): string {
        if (!trumpSuit) return 'text-blue-600';
        
        switch (trumpSuit.toLowerCase()) {
            case 'red': return 'text-red-600';
            case 'blue': return 'text-blue-600';
            case 'green': return 'text-green-600';
            case 'yellow': return 'text-yellow-600';
            default: return 'text-blue-600';
        }
    }

    function getTrumpCardDisplay(trumpCard: Card | null): string {
        if (!trumpCard) return 'No Trump Card';
        
        const rank = trumpCard.rank === 'Zoro' ? 'Wizard' : 
                    trumpCard.rank === 'Fool' ? 'Jester' : 
                    trumpCard.rank;
        
        const suit = trumpCard.suit || 'Special';
        return `${rank} of ${suit}`;
    }

    $: if (showInterface && !hasInitializedPosition && !isMobile && windowWidth > 0 && windowHeight > 0) {
        setTimeout(() => {
            if (interfaceElement) {
                const rect = interfaceElement.getBoundingClientRect();
                if (rect) {
                    windowX = Math.max(50, (windowWidth - rect.width) / 2);
                    windowY = Math.max(50, (windowHeight - rect.height) / 2);
                    hasInitializedPosition = true;
                }
            }
        }, 50);
    }

    $: if (!showInterface) {
        hasInitializedPosition = false;
    }

    $: if (gameState && currentPlayer) {
        const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
        const isMyTurn = currentTurnPlayer?.id === currentPlayer.id;
        const isInPredictionPhase = gameState.phase === 'prediction';
        const haventMadePrediction = currentPlayer.prediction === null;
        
        showInterface = !!(
            currentPlayer && 
            isInPredictionPhase && 
            isMyTurn && 
            haventMadePrediction &&
            currentTurnPlayer
        );

        console.log('Bidding interface visibility detailed check:', {
            hasCurrentPlayer: !!currentPlayer,
            currentPlayerName: currentPlayer?.name,
            currentPlayerId: currentPlayer?.id,
            gamePhase: gameState?.phase,
            currentTurnPlayerIndex: gameState?.currentPlayerIndex,
            currentTurnPlayerName: currentTurnPlayer?.name,
            currentTurnPlayerId: currentTurnPlayer?.id,
            isMyTurn,
            isInPredictionPhase,
            haventMadePrediction,
            showInterface
        });
    } else {
        showInterface = false;
        console.log('Bidding interface - missing required data:', {
            hasGameState: !!gameState,
            hasCurrentPlayer: !!currentPlayer
        });
    }

    $: maxBid = gameState?.currentRound || 0;

    // Dragging functions
    function handleMouseDown(event: MouseEvent) {
        if (isMobile) return;
        
        const target = event.target as HTMLElement;
        if (!target.classList.contains('drag-handle') && !target.closest('.drag-handle')) {
            return;
        }
        
        isDragging = true;
        dragStartX = event.clientX - windowX;
        dragStartY = event.clientY - windowY;
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        event.preventDefault();
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isDragging) return;
        
        const newX = event.clientX - dragStartX;
        const newY = event.clientY - dragStartY;
        
        const minVisible = 50;
        const maxX = windowWidth - minVisible;
        const maxY = windowHeight - minVisible;
        const minX = -(400 - minVisible);
        const minY = -minVisible;
        
        windowX = Math.max(minX, Math.min(maxX, newX));
        windowY = Math.max(minY, Math.min(maxY, newY));
    }

    $: if (showInterface && !isDragging && windowWidth > 0 && windowHeight > 0) {
        if (!isMobile && interfaceElement) {
            const rect = interfaceElement.getBoundingClientRect();
            if (rect && windowX === 0 && windowY === 0) {
                windowX = Math.max(0, (windowWidth - rect.width) / 2);
                windowY = Math.max(0, (windowHeight - rect.height) / 2);
            }
        }
    }

    function handleMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        console.log('Drag ended at position:', { windowX, windowY });
    }

    // Card utility functions
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
            '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'
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
            case 'red': return 'bg-red-500';
            case 'blue': return 'bg-blue-600';
            case 'green': return 'bg-green-600';
            case 'yellow': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    }

    function confirmBid() {
        const savedX = windowX;
        const savedY = windowY;
        
        onPrediction(selectedPrediction);
        selectedPrediction = 0;
        
        setTimeout(() => {
            if (!hasInitializedPosition) {
                windowX = savedX;
                windowY = savedY;
                hasInitializedPosition = true;
            }
        }, 100);
    }

    // FIXED: Use the consistent trump display functions
    $: trumpSuitDisplay = getTrumpSuitDisplay(gameState?.trumpSuit);
    $: trumpCardDisplay = getTrumpCardDisplay(gameState?.trumpCard);
    $: trumpSuitColorClass = getTrumpSuitColor(gameState?.trumpSuit);
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

{#if showInterface}
    <!-- Mobile: Fixed overlay, Desktop: Movable window -->
    {#if isMobile}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div class="relative mx-auto w-full max-w-sm rounded-2xl border-4 border-blue-500 bg-white p-4 shadow-2xl sm:max-w-md sm:p-6">
                <!-- Mobile content -->
                <div class="space-y-4">
                    <!-- Header -->
                    <div class="text-center">
                        <h3 class="truncate text-lg font-bold text-gray-800">
                            {currentPlayer?.name || 'Unknown'}'s Bid
                        </h3>
                        <p class="mt-1 text-sm text-gray-600">
                            Trump: <span class="font-semibold {trumpSuitColorClass} capitalize">
                                {trumpSuitDisplay}
                            </span>
                        </p>
                        <div class="mt-1 text-xs text-gray-500">
                            Round {gameState.currentRound} • {currentPlayer?.hand.length || 0} cards
                        </div>
                    </div>

                    <!-- Prediction input -->
                    <div class="mb-4 text-center">
                        <p class="text-base mb-4 font-medium text-gray-700">Predict tricks to win:</p>
                        <div class="flex items-center justify-center gap-4">
                            <button
                                class="flex items-center justify-center rounded-lg bg-gray-200 font-bold transition-all hover:scale-105 hover:bg-gray-300 h-10 w-10 text-lg"
                                on:click={() => (selectedPrediction = Math.max(0, selectedPrediction - 1))}
                            >-</button>

                            <div class="flex flex-col items-center">
                                <span class="rounded-lg bg-blue-100 text-center font-bold text-blue-800 w-14 py-2 text-2xl">
                                    {selectedPrediction}
                                </span>
                                <span class="mt-1 text-xs text-gray-500">tricks</span>
                            </div>

                            <button
                                class="flex items-center justify-center rounded-lg bg-gray-200 font-bold transition-all hover:scale-105 hover:bg-gray-300 h-10 w-10 text-lg"
                                on:click={() => (selectedPrediction = Math.min(gameState.currentRound, selectedPrediction + 1))}
                            >+</button>
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="mb-4 flex gap-3">
                        <button
                            class="flex-1 rounded-xl bg-blue-600 font-semibold text-white transition-all hover:scale-105 hover:bg-blue-700 px-4 py-3 text-base"
                            on:click={confirmBid}
                            disabled={gameState.isPaused}
                        >
                            Confirm: {selectedPrediction}
                        </button>
                    </div>

                    <!-- Player's hand -->
                    {#if currentPlayer?.hand}
                        <div>
                            <p class="mb-2 text-sm font-medium text-gray-700">Your cards:</p>
                            <div class="flex flex-wrap justify-center gap-2">
                                {#each currentPlayer.hand as card, index (getCardKey(card, index))}
                                    <div class="group relative cursor-pointer h-16 w-12">
                                        <CardImage
                                            src={getCardImagePath(card)}
                                            alt={getCardDisplay(card)}
                                            className="h-full w-full rounded-lg border-2 object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-0"
                                        />
                                        <div class="absolute inset-0 flex items-center justify-center rounded-lg font-bold text-white opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 {getCardColor(card)} text-sm">
                                            {getCardDisplay(card)}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {:else}
        <!-- Desktop: Movable window -->
        <div class="fixed inset-0 z-50 pointer-events-none">
            <div 
                bind:this={interfaceElement}
                class="absolute pointer-events-auto w-96 rounded-2xl border-4 border-blue-500 bg-white shadow-2xl transition-transform duration-200 {isDragging ? 'cursor-grabbing' : ''}"
                style="left: {windowX}px; top: {windowY}px; transform: {isDragging ? 'scale(1.02)' : 'scale(1)'};"
                on:mousedown={handleMouseDown}
                role="dialog"
                tabindex="-1"
            >
                <!-- Draggable Header -->
                <div class="drag-handle cursor-grab bg-blue-500 text-white px-4 py-2 rounded-t-xl flex items-center justify-between {isDragging ? 'cursor-grabbing' : 'cursor-grab'}">
                    <h3 class="font-bold text-lg">
                        {currentPlayer?.name || 'Unknown'}'s Bid
                    </h3>
                    <div class="flex items-center gap-2">
                        <span class="text-sm">🎯</span>
                    </div>
                </div>

                <!-- Window Content -->
                <div class="p-4 space-y-4">
                    <!-- Game info -->
                    <div class="text-center">
                        <p class="text-sm text-gray-600">
                            Trump: <span class="font-semibold {trumpSuitColorClass} capitalize">
                                {trumpSuitDisplay}
                            </span>
                        </p>
                        <div class="text-xs text-gray-500">
                            Round {gameState.currentRound} • {currentPlayer?.hand.length || 0} cards
                        </div>
                    </div>

                    <!-- Prediction input -->
                    <div class="text-center">
                        <p class="text-lg mb-4 font-medium text-gray-700">Predict tricks to win:</p>
                        <div class="flex items-center justify-center gap-4">
                            <button
                                class="flex items-center justify-center rounded-lg bg-gray-200 font-bold transition-all hover:scale-105 hover:bg-gray-300 h-12 w-12 text-xl"
                                on:click={() => (selectedPrediction = Math.max(0, selectedPrediction - 1))}
                            >-</button>

                            <div class="flex flex-col items-center">
                                <span class="rounded-lg bg-blue-100 text-center font-bold text-blue-800 w-16 py-3 text-3xl">
                                    {selectedPrediction}
                                </span>
                                <span class="mt-1 text-xs text-gray-500">tricks</span>
                            </div>

                            <button
                                class="flex items-center justify-center rounded-lg bg-gray-200 font-bold transition-all hover:scale-105 hover:bg-gray-300 h-12 w-12 text-xl"
                                on:click={() => (selectedPrediction = Math.min(gameState.currentRound, selectedPrediction + 1))}
                            >+</button>
                        </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex gap-3">
                        <button
                            class="flex-1 rounded-xl bg-blue-600 font-semibold text-white transition-all hover:scale-105 hover:bg-blue-700 px-6 py-4 text-lg"
                            on:click={confirmBid}
                            disabled={gameState.isPaused}
                        >
                            Confirm: {selectedPrediction}
                        </button>
                    </div>

                    <!-- Player's hand -->
                    {#if currentPlayer?.hand}
                        <div>
                            <p class="mb-2 text-sm font-medium text-gray-700">Your cards:</p>
                            <div class="flex flex-wrap justify-center gap-2 max-h-24 overflow-y-auto">
                                {#each currentPlayer.hand as card, index (getCardKey(card, index))}
                                    <div class="group relative cursor-pointer h-20 w-14">
                                        <CardImage
                                            src={getCardImagePath(card)}
                                            alt={getCardDisplay(card)}
                                            className="h-full w-full rounded-lg border-2 object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-0"
                                        />
                                        <div class="absolute inset-0 flex items-center justify-center rounded-lg font-bold text-white opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 {getCardColor(card)} text-base">
                                            {getCardDisplay(card)}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Other players' bids -->
                    <div>
                        <p class="mb-2 text-sm font-medium text-gray-700">Other players' bids:</p>
                        <div class="flex flex-wrap justify-center gap-2">
                            {#each gameState.players as player}
                                {#if player.id !== currentPlayer?.id}
                                    <div class="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                                        <span class="font-medium text-gray-800">{player.name}</span>:
                                        <span class="font-bold text-blue-600">
                                            {player.prediction !== null ? player.prediction : '?'}
                                        </span>
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
{/if}

<style>
    .drag-handle {
        user-select: none;
    }
    
    .drag-handle:active {
        cursor: grabbing !important;
    }
</style>