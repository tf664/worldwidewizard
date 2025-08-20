<script lang="ts">
    import type { GameState, Player } from '$lib/stores/socket';

    export let gameState: GameState;
    export let onNextRound: () => void;

    function calculateRoundScore(player: Player): number {
        if (player.prediction === player.tricksWon) {
            return 20 + (player.tricksWon * 10);
        } else {
            return Math.abs(player.prediction! - player.tricksWon) * -10;
        }
    }

    function getScoreColor(score: number): string {
        return score >= 0 ? 'text-green-600' : 'text-red-600';
    }

    function getTotalScoreChange(): { [playerId: string]: number } {
        const changes: { [playerId: string]: number } = {};
        gameState.players.forEach(player => {
            changes[player.id] = calculateRoundScore(player);
        });
        return changes;
    }

    function getWinners(): Player[] {
        const maxScore = Math.max(...gameState.players.map(p => p.score));
        return gameState.players.filter(p => p.score === maxScore);
    }

    $: isGameFinished = gameState.phase === 'finished';
    $: scoreChanges = getTotalScoreChange();
    $: winners = isGameFinished ? getWinners() : [];
    
    console.log('Scoring interface - Phase:', gameState.phase, 'Is finished:', isGameFinished);
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="mx-4 w-full max-w-4xl rounded-lg border-4 border-purple-500 bg-white p-8 shadow-2xl">
        {#if isGameFinished}
            <h2 class="mb-6 text-center text-3xl font-bold text-purple-800">🎉 Game Complete! 🎉</h2>
            
            {#if winners.length === 1}
                <div class="mb-6 text-center">
                    <h3 class="text-2xl font-bold text-gold-600">
                        🏆 Winner: {winners[0].name} 🏆
                    </h3>
                    <p class="text-lg text-gray-600">Final Score: {winners[0].score}</p>
                </div>
            {:else}
                <div class="mb-6 text-center">
                    <h3 class="text-2xl font-bold text-gold-600">
                        🤝 Tie Game! 🤝
                    </h3>
                    <p class="text-lg text-gray-600">
                        Winners: {winners.map(w => w.name).join(', ')}
                    </p>
                </div>
            {/if}
        {:else}
            <h2 class="mb-6 text-center text-3xl font-bold text-purple-800">
                Round {gameState.currentRound} Results
            </h2>
        {/if}

        <!-- Scoring breakdown -->
        <div class="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each gameState.players as player}
                {@const roundScore = calculateRoundScore(player)}
                <div class="rounded-lg bg-gray-100 p-6 border-2 {roundScore >= 0 ? 'border-green-300' : 'border-red-300'}">
                    <h3 class="text-xl font-bold mb-3 text-center">{player.name}</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Predicted:</span>
                            <span class="font-semibold">{player.prediction}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Actual:</span>
                            <span class="font-semibold">{player.tricksWon}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Match:</span>
                            <span class="font-semibold {player.prediction === player.tricksWon ? 'text-green-600' : 'text-red-600'}">
                                {player.prediction === player.tricksWon ? '✓ Yes' : '✗ No'}
                            </span>
                        </div>
                        <hr class="my-2">
                        <div class="flex justify-between">
                            <span>Round Score:</span>
                            <span class="font-bold text-lg {getScoreColor(roundScore)}">
                                {roundScore > 0 ? '+' : ''}{roundScore}
                            </span>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <span class="font-semibold">Total Score:</span>
                            <span class="font-bold text-xl">{player.score}</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Round summary -->
        <div class="mb-6 bg-blue-50 rounded-lg p-4">
            <h4 class="font-semibold mb-2">Round Summary</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <span class="font-medium">Round:</span> {gameState.currentRound} / {gameState.maxRounds}
                </div>
                <div>
                    <span class="font-medium">Cards Dealt:</span> {gameState.currentRound}
                </div>
                <div>
                    <span class="font-medium">Trump:</span> 
                    <span class="capitalize">{gameState.trumpSuit || 'None'}</span>
                </div>
                <div>
                    <span class="font-medium">Total Tricks:</span> {gameState.players.reduce((sum, p) => sum + p.tricksWon, 0)}
                </div>
            </div>
        </div>

        <!-- Action button -->
        <div class="text-center">
            {#if isGameFinished}
                <button
                    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
                    on:click={() => window.location.href = '/'}
                >
                    Return to Main Menu
                </button>
            {:else}
                <button
                    class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
                    on:click={onNextRound}
                >
                    Continue to Round {gameState.currentRound + 1}
                </button>
            {/if}
        </div>
    </div>
</div>