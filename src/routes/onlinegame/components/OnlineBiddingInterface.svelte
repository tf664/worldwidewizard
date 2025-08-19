<script lang="ts">
    import type { GameState, Player } from '$lib/stores/socket';

    export let gameState: GameState;
    export let currentPlayer: Player | null;
    export let onPrediction: (prediction: number) => void;

    let selectedPrediction = 0;
    let showInterface = false;

    // Show interface only if it's the current player's turn and they haven't made a prediction
    $: showInterface = !!(currentPlayer && 
                      gameState.phase === 'prediction' && 
                      currentPlayer.prediction === null &&
                      gameState.players[gameState.currentPlayerIndex]?.id === currentPlayer.id);

    $: maxBid = gameState.currentRound;
    $: currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];

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

<!-- Always show prediction overlay during prediction phase -->
{#if gameState.phase === 'prediction'}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-2xl p-8 border-4 border-blue-500 max-w-lg w-full mx-4">
            <h3 class="text-2xl font-bold mb-6 text-center text-blue-800">Prediction Phase</h3>
            <p class="text-gray-600 mb-6 text-center">
                Round {gameState.currentRound}: Players predict how many tricks they will win
            </p>
            
            <!-- Current turn indicator -->
            <div class="bg-blue-50 rounded-lg p-4 mb-6">
                <p class="text-center text-lg font-semibold">
                    Current Turn: <span class="text-blue-600">{currentTurnPlayer?.name}</span>
                </p>
                <p class="text-center text-sm text-gray-600 mt-1">
                    {getPredictionStatus()}
                </p>
            </div>

            <!-- Show predictions made so far -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 class="font-semibold mb-3 text-center">Predictions Made</h4>
                <div class="grid grid-cols-2 gap-2">
                    {#each gameState.players as player}
                        <div class="flex justify-between items-center p-2 rounded 
                                    {player.prediction !== null ? 'bg-green-100' : 'bg-gray-100'}">
                            <span class="font-medium">{player.name}</span>
                            <span class="font-bold">
                                {player.prediction !== null ? player.prediction : '?'}
                            </span>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Only show input controls if it's current player's turn -->
            {#if showInterface}
                <!-- Current player info -->
                <div class="bg-blue-100 rounded-lg p-4 mb-6 border-2 border-blue-300">
                    <p class="text-center text-lg font-bold text-blue-800">
                        Your Turn! Make your prediction
                    </p>
                    <p class="text-sm text-gray-600 text-center mt-1">
                        You have {currentPlayer?.hand.length || 0} cards
                    </p>
                </div>

                <!-- Prediction input -->
                <div class="flex items-center gap-4 mb-6">
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
                <div class="grid grid-cols-4 gap-2 mb-6">
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
                    class="w-full py-3 px-6 rounded-lg font-bold text-lg transition-all
                           {isValidPrediction(selectedPrediction)
                               ? 'bg-green-500 hover:bg-green-600 text-white'
                               : 'bg-gray-300 text-gray-500 cursor-not-allowed'}"
                    on:click={handleSubmit}
                    disabled={!isValidPrediction(selectedPrediction)}
                >
                    Submit Prediction: {selectedPrediction}
                </button>
            {:else}
                <!-- Show waiting message for other players -->
                <div class="bg-yellow-50 rounded-lg p-4 text-center">
                    <p class="text-yellow-800 font-medium">
                        Waiting for {currentTurnPlayer?.name} to make their prediction...
                    </p>
                    {#if currentPlayer?.prediction !== null}
                        <p class="text-sm text-green-600 mt-2">
                            ✓ You predicted: {currentPlayer?.prediction}
                        </p>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}