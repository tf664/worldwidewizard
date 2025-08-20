<script lang="ts">
    import type { GameState, Player, Card } from '$lib/stores/socket';
    import CardImage from '$lib/components/CardImage.svelte';

    export let gameState: GameState;
    export let currentPlayer: Player | null;
    export let onPrediction: (prediction: number) => void;

    let selectedPrediction = 0;
    let showInterface = false;

    $: if (gameState && currentPlayer) {
        const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
        const isMyTurn = currentTurnPlayer?.id === currentPlayer.id;
        const isInPredictionPhase = gameState.phase === 'prediction';
        const haventMadePrediction = currentPlayer.prediction === null;
        
        // Show interface only if ALL conditions are met
        showInterface = !!(
            currentPlayer && 
            isInPredictionPhase && 
            isMyTurn && 
            haventMadePrediction &&
            currentTurnPlayer // Ensure current turn player exists
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

    function isTrumpCard(card: Card): boolean {
        return card.suit === gameState.trumpSuit;
    }

    function isSpecialCard(card: Card): boolean {
        return card.type === 'wizard' || card.type === 'jester';
    }

    function handleSubmit() {
        if (selectedPrediction >= 0 && selectedPrediction <= maxBid) {
            onPrediction(selectedPrediction);
        }
    }

    function isValidPrediction(pred: number): boolean {
        return pred >= 0 && pred <= maxBid;
    }

    function getPredictionStatus(): string {
        const madePredictions = gameState.players.filter(p => p.prediction !== null).length;
        const totalPlayers = gameState.players.length;
        return `${madePredictions} / ${totalPlayers} predictions made`;
    }
</script>

<!-- FIXED: Only show overlay when it's specifically this player's turn -->
{#if showInterface}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white rounded-lg shadow-2xl p-6 border-4 border-blue-500 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 class="text-2xl font-bold mb-6 text-center text-blue-800">Your Turn - Make Prediction</h3>
            <p class="text-gray-600 mb-6 text-center">
                Round {gameState.currentRound}: Predict how many tricks you will win
            </p>
            
            <!-- Show predictions made so far -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 class="font-semibold mb-3 text-center">Predictions Made ({getPredictionStatus()})</h4>
                <div class="grid grid-cols-2 gap-2">
                    {#each gameState.players as player}
                        <div class="flex justify-between items-center p-2 rounded 
                                    {player.prediction !== null ? 'bg-green-100' : 'bg-gray-100'}
                                    {player.id === currentPlayer?.id ? 'border-2 border-blue-500' : ''}">
                            <span class="font-medium">
                                {player.name}
                                {#if player.id === currentPlayer?.id} (You){/if}
                            </span>
                            <span class="font-bold">
                                {player.prediction !== null ? player.prediction : '?'}
                            </span>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Current player info with cards -->
            <div class="bg-blue-100 rounded-lg p-4 mb-6 border-2 border-blue-300">
                <p class="text-center text-lg font-bold text-blue-800 mb-4">
                    Make your prediction!
                </p>
                <p class="text-sm text-gray-600 text-center mb-4">
                    You have {currentPlayer?.hand.length || 0} cards
                </p>

                <!-- Show player's cards -->
                {#if currentPlayer?.hand && currentPlayer.hand.length > 0}
                    <div class="bg-white rounded-lg p-3">
                        <h5 class="text-sm font-semibold mb-2 text-center text-gray-700">Your Cards</h5>
                        <div class="flex gap-2 justify-center flex-wrap">
                            {#each currentPlayer.hand as card, index}
                                <div class="relative w-16 h-24 rounded border-2 border-gray-300 overflow-hidden">
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
                                </div>
                            {/each}
                        </div>
                        
                        <!-- Trump suit reminder -->
                        <div class="text-center mt-2 text-xs text-gray-600">
                            {#if gameState.trumpSuit}
                                Trump: <span class="font-semibold capitalize text-yellow-600">{gameState.trumpSuit}</span>
                            {:else}
                                No Trump this round
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Prediction input -->
            <div class="flex items-center gap-4 mb-6 justify-center">
                <label for="prediction" class="font-medium text-gray-700">Prediction:</label>
                <input
                    id="prediction"
                    type="number"
                    min="0"
                    max={maxBid}
                    bind:value={selectedPrediction}
                    class="border-2 rounded-lg px-4 py-2 w-24 text-center text-xl font-bold
                           {isValidPrediction(selectedPrediction) ? 'border-green-500' : 'border-red-500'}"
                />
                <span class="text-gray-500">/ {maxBid}</span>
            </div>

            <!-- Quick select buttons -->
            <div class="grid grid-cols-4 gap-2 mb-6 max-w-md mx-auto">
                {#each Array(Math.min(maxBid + 1, 12)) as _, i}
                    <button
                        class="px-3 py-2 rounded-lg border-2 font-medium transition-all
                               {selectedPrediction === i
                                   ? 'bg-blue-500 text-white border-blue-500 scale-105'
                                   : 'bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-blue-300'}"
                        on:click={() => (selectedPrediction = i)}
                    >
                        {i}
                    </button>
                {/each}
            </div>

            {#if maxBid > 11}
                <p class="text-sm text-gray-500 text-center mb-4">
                    Use the input field above for predictions higher than 11
                </p>
            {/if}

            <!-- Submit button -->
            <button
                class="w-full max-w-md mx-auto block py-3 px-6 rounded-lg font-bold text-lg transition-all
                       {isValidPrediction(selectedPrediction)
                           ? 'bg-green-500 hover:bg-green-600 text-white'
                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'}"
                on:click={handleSubmit}
                disabled={!isValidPrediction(selectedPrediction)}
            >
                Submit Prediction: {selectedPrediction}
            </button>
        </div>
    </div>
{/if}