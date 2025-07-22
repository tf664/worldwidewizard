<script lang="ts">
    import type { Player } from './player.js';
    import type { Card } from './cards.js';
    
    export let player: Player;
    export let position: 'top' | 'left' | 'right';
    
    function getCardDisplay(card: Card): string {
        if (card.rank === 'Wizard') return 'W';
        if (card.rank === 'Fool') return 'F';
        return card.rank.toString();
    }
    
    function getCardColor(card: Card): string {
        if (!card.suit) return 'bg-purple-600';
        
        switch (card.suit) {
            case 'red': return 'bg-red-500';
            case 'blue': return 'bg-blue-500';
            case 'green': return 'bg-green-500';
            case 'yellow': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    }
</script>

<div class="h-full flex flex-col items-center justify-center bg-green-700 m-2 rounded-lg p-4">
    <div class="text-white text-center mb-4">
        <h3 class="font-bold text-lg">{player.name}</h3>
        <div class="text-sm space-y-1">
            <p>Score: <span class="font-semibold">{player.score}</span></p>
            <p>Prediction: <span class="font-semibold">{player.prediction}</span></p>
            <p>Tricks Won: <span class="font-semibold">{player.tricksWon}</span></p>
        </div>
    </div>
    
    <!-- Player's hand (only show card count for other players) -->
    <div class="flex flex-wrap gap-1 justify-center">
        {#if position === 'bottom'}
            <!-- Show actual cards for bottom player (current player) -->
            {#each player.hand as card}
                <div class="w-8 h-12 {getCardColor(card)} rounded border border-white flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
                    {getCardDisplay(card)}
                </div>
            {/each}
        {:else}
            <!-- Show card backs for other players -->
            {#each Array(player.hand.length) as _}
                <div class="w-8 h-12 bg-blue-900 rounded border border-white flex items-center justify-center text-white text-xs">
                    ?
                </div>
            {/each}
        {/if}
    </div>
</div>