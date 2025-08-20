<script lang="ts">
    import type { Card, TrickPlay, GameState, Player } from '$lib/stores/socket';
    import CardImage from '$lib/components/CardImage.svelte';

    export let gameState: GameState;
    export let currentPlayer: Player | null;
    export let onCardPlay: (cardIndex: number) => void;

    let showInterface = false;

    $: if (gameState && currentPlayer) {
        const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
        const isMyTurn = currentTurnPlayer?.id === currentPlayer.id;
        const isInPlayingPhase = gameState.phase === 'playing';
        
        showInterface = !!(
            currentPlayer && 
            isInPlayingPhase && 
            isMyTurn &&
            currentTurnPlayer // Ensure current turn player exists
        );

        console.log('Card play interface visibility detailed check:', {
            hasCurrentPlayer: !!currentPlayer,
            currentPlayerName: currentPlayer?.name,
            currentPlayerId: currentPlayer?.id,
            gamePhase: gameState?.phase,
            currentTurnPlayerIndex: gameState?.currentPlayerIndex,
            currentTurnPlayerName: currentTurnPlayer?.name,
            currentTurnPlayerId: currentTurnPlayer?.id,
            isMyTurn,
            isInPlayingPhase,
            showInterface
        });
    } else {
        showInterface = false;
        console.log('Card play interface - missing required data:', {
            hasGameState: !!gameState,
            hasCurrentPlayer: !!currentPlayer
        });
    }

    $: hand = currentPlayer?.hand || [];
    $: trumpSuit = gameState.trumpSuit || null;
    $: currentTrick = gameState.currentTrick;

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
            console.warn('Card missing suit:', card);
            return '/rcs/cards-optimized/card_back.webp'; // Fallback image
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

        const imagePath = `/rcs/cards-optimized/${suitName}_${rankName}.webp`;
        console.log('Generated image path:', imagePath, 'for card:', card); // Debug log
        

        return imagePath;}

    function getCardDisplay(card: Card): string {
        if (card.rank === 'Zoro') return 'Wizard';
        if (card.rank === 'Fool') return 'Jester';
        return `${card.rank} of ${card.suit || 'Unknown'}`;
    }

    function isCardPlayable(card: Card, index: number): boolean {
        // Basic validation - could add more complex suit following rules here
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
</script>

{#if showInterface}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-2xl p-6 border-4 border-green-500 max-w-4xl w-full mx-4">
            <h3 class="text-2xl font-bold mb-4 text-center text-green-800">Your Turn - Play a Card</h3>
            
            <!-- Game info -->
            <div class="bg-green-50 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="text-center">
                        <div class="font-semibold">Current Player</div>
                        <div>{currentPlayer?.name || 'Unknown'}</div>
                    </div>
                    <div class="text-center">
                        <div class="font-semibold">Cards Played</div>
                        <div>{currentTrick.length} / {gameState.players.length}</div>
                    </div>
                    <div class="text-center">
                        <div class="font-semibold">Trump Suit</div>
                        <div class="capitalize">{trumpSuit || 'None'}</div>
                    </div>
                    <div class="text-center">
                        <div class="font-semibold">Lead Suit</div>
                        <div class="capitalize">{getLeadSuit() || 'None'}</div>
                    </div>
                </div>
            </div>

            <!-- Current trick display -->
            {#if currentTrick.length > 0}
                <div class="mb-6">
                    <h4 class="font-semibold mb-2 text-center">Cards Played This Trick</h4>
                    <div class="flex gap-2 justify-center">
                        {#each currentTrick as trickPlay}
                            <div class="relative">
                                <div class="w-16 h-24 rounded border-2 border-gray-300 overflow-hidden">
                                    <CardImage
                                        src={getCardImagePath(trickPlay.card)}
                                        alt={getCardDisplay(trickPlay.card)}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    {gameState.players[trickPlay.playerId]?.name || 'Unknown'}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
            
            <!-- Hand display -->
            <div class="mb-6">
                <h4 class="font-semibold mb-3 text-center">Your Hand - Click a card to play it</h4>
                <div class="flex gap-2 justify-center flex-wrap max-h-40 overflow-y-auto">
                    {#each hand as card, index}
                        <button
                            class="relative w-20 h-28 rounded border-2 transition-all duration-200 overflow-hidden
                                   {isCardPlayable(card, index)
                                       ? 'border-gray-300 hover:border-blue-500 hover:scale-105 cursor-pointer'
                                       : 'border-red-300 opacity-50 cursor-not-allowed'}"
                            on:click={() => handleCardClick(index)}
                            title={getCardDisplay(card)}
                            disabled={!isCardPlayable(card, index)}
                        >
                            <CardImage
                                src={getCardImagePath(card)}
                                alt={getCardDisplay(card)}
                                className="w-full h-full object-cover"
                            />
                            
                            <!-- Special card indicators -->
                            {#if isTrumpCard(card)}
                                <div class="absolute top-1 right-1 bg-yellow-500 text-black text-xs px-1 rounded">
                                    T
                                </div>
                            {/if}
                            
                            {#if isSpecialCard(card)}
                                <div class="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 rounded">
                                    {card.type === 'wizard' ? 'W' : 'J'}
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Game rules reminder -->
            <div class="text-sm text-gray-600 text-center">
                <p>
                    {#if trumpSuit}
                        Trump: <span class="font-semibold capitalize">{trumpSuit}</span> • 
                    {/if}
                    Wizards beat all • Jesters lose to all
                    {#if getLeadSuit()}
                        • Follow suit: <span class="font-semibold capitalize">{getLeadSuit()}</span>
                    {/if}
                </p>
            </div>
        </div>
    </div>
{/if}