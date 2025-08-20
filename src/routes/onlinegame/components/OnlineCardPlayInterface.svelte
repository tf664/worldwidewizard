<script lang="ts">
    import type { Card, TrickPlay, GameState, Player } from '$lib/stores/socket';
    import CardImage from '$lib/components/CardImage.svelte';

    export let gameState: GameState;
    export let currentPlayer: Player | null;
    export let onCardPlay: (cardIndex: number) => void;

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
        if (!trumpSuit) return 'text-green-600';
        
        switch (trumpSuit.toLowerCase()) {
            case 'red': return 'text-red-600';
            case 'blue': return 'text-blue-600';
            case 'green': return 'text-green-600';
            case 'yellow': return 'text-yellow-600';
            default: return 'text-green-600';
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
        const isInPlayingPhase = gameState.phase === 'playing';
        
        showInterface = !!(
            currentPlayer && 
            isInPlayingPhase && 
            isMyTurn &&
            currentTurnPlayer
        );
    } else {
        showInterface = false;
    }

    $: hand = currentPlayer?.hand || [];
    $: trumpSuit = gameState.trumpSuit || null;
    $: currentTrick = gameState.currentTrick;

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

        if (!card.suit) {
            return '/rcs/cards-optimized/card_back.webp';
        }

        const suitName = card.suit?.toLowerCase() || 'unknown';
        let rankName: string;

        if (typeof card.rank === 'number') {
            const rankNames = [
                '', 'one', 'two', 'three', 'four', 'five', 'six', 
                'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'
            ];
            rankName = rankNames[card.rank] || card.rank.toString();
        } else {
            rankName = String(card.rank).toLowerCase();
        }

        return `/rcs/cards-optimized/${suitName}_${rankName}.webp`;
    }

    function getCardDisplay(card: Card): string {
        if (card.rank === 'Zoro') return 'Wizard';
        if (card.rank === 'Fool') return 'Jester';
        return `${card.rank} of ${card.suit || 'Unknown'}`;
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

    function isCardPlayable(card: Card, index: number): boolean {
        return true;
    }

    function handleCardClick(cardIndex: number) {
        const card = hand[cardIndex];
        if (isCardPlayable(card, cardIndex)) {
            onCardPlay(cardIndex);
        }
    }

    function getLeadSuit(): string | null {
        if (currentTrick.length === 0) return null;
        const leadCard = currentTrick[0].card;
        return leadCard.type === 'regular' ? (leadCard.suit || null) : null;
    }

    function isTrumpCard(card: Card): boolean {
        return card.suit === trumpSuit;
    }

    function isSpecialCard(card: Card): boolean {
        return card.type === 'wizard' || card.type === 'jester';
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
            <div class="relative mx-auto w-full max-w-sm rounded-2xl border-4 border-green-500 bg-white p-4 shadow-2xl sm:max-w-md sm:p-6">
                <!-- Mobile content -->
                <div class="space-y-4">
                    <!-- Header -->
                    <div class="text-center">
                        <h3 class="truncate text-lg font-bold text-gray-800">
                            {currentPlayer?.name || 'Unknown'}'s Turn
                        </h3>
                        <p class="mt-1 text-sm text-gray-600">
                            Trump: <span class="font-semibold {trumpSuitColorClass} capitalize">
                                {trumpSuitDisplay}
                            </span>
                        </p>
                        <div class="mt-1 text-xs text-gray-500">
                            Round {gameState.currentRound} • Play a card
                        </div>
                    </div>

                    <!-- Game info section -->
                    <div class="rounded-lg bg-green-50 p-3">
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="text-center">
                                <div class="font-semibold text-gray-700">Cards Played</div>
                                <div class="text-green-600 font-bold">{currentTrick.length} / {gameState.players.length}</div>
                            </div>
                            <div class="text-center">
                                <div class="font-semibold text-gray-700">Lead Suit</div>
                                <div class="text-green-600 font-bold capitalize">{getLeadSuit() || 'None'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Current trick display -->
                    {#if currentTrick.length > 0}
                        <div>
                            <p class="mb-2 text-sm font-medium text-gray-700">Cards played this trick:</p>
                            <div class="flex flex-wrap justify-center gap-2">
                                {#each currentTrick as trickPlay}
                                    <div class="relative h-12 w-8">
                                        <CardImage
                                            src={getCardImagePath(trickPlay.card)}
                                            alt={getCardDisplay(trickPlay.card)}
                                            className="h-full w-full rounded-lg border object-cover"
                                        />
                                        <div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                                            {gameState.players[trickPlay.playerId]?.name || 'Unknown'}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}
                    
                    <!-- Hand display -->
                    <div>
                        <p class="mb-2 text-sm font-medium text-gray-700">Your hand - Click a card to play:</p>
                        <div class="flex flex-wrap justify-center gap-2">
                            {#each hand as card, index (getCardKey(card, index))}
                                <button
                                    class="group relative cursor-pointer h-16 w-12 {isCardPlayable(card, index) ? '' : 'opacity-50 cursor-not-allowed'}"
                                    on:click={() => handleCardClick(index)}
                                    disabled={!isCardPlayable(card, index)}
                                >
                                    <CardImage
                                        src={getCardImagePath(card)}
                                        alt={getCardDisplay(card)}
                                        className="h-full w-full rounded-lg border-2 object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-0"
                                    />
                                    <div
                                        class="absolute inset-0 flex items-center justify-center rounded-lg font-bold text-white opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 {getCardColor(card)} text-sm"
                                    >
                                        {card.rank === 'Zoro' ? 'W' : card.rank === 'Fool' ? 'J' : card.rank}
                                    </div>
                                    
                                    <!-- Special card indicators -->
                                    {#if isTrumpCard(card)}
                                        <div class="absolute top-0 right-0 bg-yellow-500 text-black text-xs px-1 rounded">
                                            T
                                        </div>
                                    {/if}
                                    
                                    {#if isSpecialCard(card)}
                                        <div class="absolute top-0 left-0 bg-purple-500 text-white text-xs px-1 rounded">
                                            {card.type === 'wizard' ? 'W' : 'J'}
                                        </div>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    </div>

                    <!-- Rules reminder -->
                    <div class="text-xs text-gray-600 text-center bg-gray-50 rounded-lg p-2">
                        <p>
                            {#if trumpSuit}
                                <span class="font-semibold {trumpSuitColorClass} capitalize">{trumpSuit}</span> is trump • 
                            {/if}
                            Wizards beat all • Jesters lose to all
                            {#if getLeadSuit()}
                                • Follow <span class="font-semibold capitalize">{getLeadSuit()}</span> if possible
                            {/if}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <!-- Desktop: Movable window -->
        <div class="fixed inset-0 z-50 pointer-events-none">
            <div 
                bind:this={interfaceElement}
                class="absolute pointer-events-auto w-96 rounded-2xl border-4 border-green-500 bg-white shadow-2xl transition-transform duration-200 {isDragging ? 'cursor-grabbing' : ''}"
                style="left: {windowX}px; top: {windowY}px; transform: {isDragging ? 'scale(1.02)' : 'scale(1)'};"
                on:mousedown={handleMouseDown}
                role="dialog"
                tabindex="-1"
            >
                <!-- Draggable Header -->
                <div class="drag-handle cursor-grab bg-green-500 text-white px-4 py-2 rounded-t-xl flex items-center justify-between {isDragging ? 'cursor-grabbing' : 'cursor-grab'}">
                    <h3 class="font-bold text-lg">
                        {currentPlayer?.name || 'Unknown'}'s Turn
                    </h3>
                    <div class="flex items-center gap-2">
                        <span class="text-sm">🃏</span>
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
                            Round {gameState.currentRound} • Play a card
                        </div>
                    </div>

                    <!-- Game info section -->
                    <div class="rounded-lg bg-green-50 p-3">
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="text-center">
                                <div class="font-semibold text-gray-700">Cards Played</div>
                                <div class="text-green-600 font-bold">{currentTrick.length} / {gameState.players.length}</div>
                            </div>
                            <div class="text-center">
                                <div class="font-semibold text-gray-700">Lead Suit</div>
                                <div class="text-green-600 font-bold capitalize">{getLeadSuit() || 'None'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Current trick display -->
                    {#if currentTrick.length > 0}
                        <div>
                            <p class="mb-2 text-sm font-medium text-gray-700">Cards played this trick:</p>
                            <div class="flex flex-wrap justify-center gap-2">
                                {#each currentTrick as trickPlay}
                                    <div class="relative h-16 w-12">
                                        <CardImage
                                            src={getCardImagePath(trickPlay.card)}
                                            alt={getCardDisplay(trickPlay.card)}
                                            className="h-full w-full rounded-lg border object-cover"
                                        />
                                        <div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                                            {gameState.players[trickPlay.playerId]?.name || 'Unknown'}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Hand display -->
                    <div>
                        <p class="mb-2 text-sm font-medium text-gray-700">Your hand - Click a card to play:</p>
                        <div class="flex flex-wrap justify-center gap-2 max-h-32 overflow-y-auto">
                            {#each hand as card, index (getCardKey(card, index))}
                                <button
                                    class="group relative cursor-pointer h-20 w-14 {isCardPlayable(card, index) ? '' : 'opacity-50 cursor-not-allowed'}"
                                    on:click={() => handleCardClick(index)}
                                    disabled={!isCardPlayable(card, index)}
                                >
                                    <CardImage
                                        src={getCardImagePath(card)}
                                        alt={getCardDisplay(card)}
                                        className="h-full w-full rounded-lg border-2 object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-0"
                                    />
                                    <div
                                        class="absolute inset-0 flex items-center justify-center rounded-lg font-bold text-white opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 {getCardColor(card)} text-base"
                                    >
                                        {card.rank === 'Zoro' ? 'W' : card.rank === 'Fool' ? 'J' : card.rank}
                                    </div>
                                    
                                    <!-- Special card indicators -->
                                    {#if isTrumpCard(card)}
                                        <div class="absolute top-0 right-0 bg-yellow-500 text-black text-xs px-1 rounded">
                                            T
                                        </div>
                                    {/if}
                                    
                                    {#if isSpecialCard(card)}
                                        <div class="absolute top-0 left-0 bg-purple-500 text-white text-xs px-1 rounded">
                                            {card.type === 'wizard' ? 'W' : 'J'}
                                        </div>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    </div>

                    <!-- Rules reminder -->
                    <div class="text-xs text-gray-600 text-center bg-gray-50 rounded-lg p-2">
                        <p>
                            {#if trumpSuit}
                                <span class="font-semibold {trumpSuitColorClass} capitalize">{trumpSuit}</span> is trump • 
                            {/if}
                            Wizards beat all • Jesters lose to all
                            {#if getLeadSuit()}
                                • Follow <span class="font-semibold capitalize">{getLeadSuit()}</span> if possible
                            {/if}
                        </p>
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