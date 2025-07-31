<script lang="ts">
    import type { Player } from './player.js';
    
    export let players: Player[];
    
    function getLeader(): Player {
        return players.reduce((leader, player) => 
            player.score > leader.score ? player : leader
        );
    }
</script>

<div class="h-full bg-green-700 m-2 rounded-lg p-4">
    <h2 class="text-white text-xl font-bold mb-4 text-center">Scoreboard</h2>
    
    <div class="grid gap-4" style="grid-template-columns: repeat({players.length}, minmax(0, 1fr));">
        {#each players as player}
            {@const isLeader = player === getLeader()}
            <div class="bg-green-600 rounded p-3 text-white text-center {isLeader ? 'ring-2 ring-yellow-400' : ''}">
                <div class="font-semibold text-sm">{player.name}</div>
                <div class="text-2xl font-bold">{player.score}</div>
                {#if isLeader}
                    <div class="text-xs text-yellow-400">Leader</div>
                {/if}
                <div class="text-xs mt-1">
                    <div>Prediction: {player.prediction}</div>
                    <div>Tricks: {player.tricksWon}</div>
                </div>
            </div>
        {/each}
    </div>
    
    <!-- Round summary -->
    <div class="mt-4 text-white text-center text-sm">
        <p>Current Round Predictions vs Actual</p>
        <div class="flex justify-around mt-2">
            {#each players as player}
                <div class="text-xs">
                    <div>{player.name}</div>
                    <div class="{player.prediction === player.tricksWon ? 'text-green-300' : 'text-red-300'}">
                        {player.prediction}/{player.tricksWon}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>