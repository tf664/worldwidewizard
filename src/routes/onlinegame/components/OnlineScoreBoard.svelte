<script lang="ts">
    import type { Player } from '$lib/stores/socket';

    export let players: Player[];
    export let currentPlayer: Player | null;

    function isCurrentUser(player: Player): boolean {
        return currentPlayer?.id === player.id;
    }
</script>

<div class="bg-white rounded-lg shadow-lg p-4 mb-4">
    <h3 class="text-lg font-bold mb-4 text-center">Scoreboard</h3>
    
    <div class="overflow-x-auto">
        <table class="w-full text-sm">
            <thead>
                <tr class="border-b">
                    <th class="text-left p-2">Player</th>
                    <th class="text-center p-2">Score</th>
                    <th class="text-center p-2">Predicted</th>
                    <th class="text-center p-2">Won</th>
                    <th class="text-center p-2">Cards</th>
                </tr>
            </thead>
            <tbody>
                {#each players as player}
                    <tr class="border-b {isCurrentUser(player) ? 'bg-blue-50' : ''}">
                        <td class="p-2 font-medium">
                            {player.name}
                            {#if isCurrentUser(player)}
                                <span class="text-blue-600 text-xs">(You)</span>
                            {/if}
                        </td>
                        <td class="text-center p-2 font-bold">{player.score}</td>
                        <td class="text-center p-2">{player.prediction !== null ? player.prediction : '?'}</td>
                        <td class="text-center p-2">{player.tricksWon}</td>
                        <td class="text-center p-2">{player.hand.length}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>