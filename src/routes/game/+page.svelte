<script lang="ts">
    import type { GameState } from './gameLogic.js';
    import { initializeGame, dealCards, determineTrumpSuit } from './gameLogic.js';
    import PlayerPanel from './PlayerPanel.svelte';
    import PlayArea from './PlayArea.svelte';
    import ScoreBoard from './ScoreBoard.svelte';
    
    // Initialize game state directly instead of expecting it as a prop
    let gameState: GameState = initializeGame(['Alice', 'Bob', 'Charlie']);
    dealCards(gameState);
    determineTrumpSuit(gameState);
</script>

<div class="grid grid-cols-12 grid-rows-12 h-screen bg-green-800">
    <!-- Player positions around the table -->
    <div class="col-span-12 row-span-3">
        <PlayerPanel player={gameState.players[0]} position="top" />
    </div>
    
    <div class="col-span-3 row-span-6">
        <PlayerPanel player={gameState.players[1]} position="left" />
    </div>
    
    <div class="col-span-6 row-span-6 flex items-center justify-center">
        <PlayArea {gameState} />
    </div>
    
    <div class="col-span-3 row-span-6">
        <PlayerPanel player={gameState.players[2]} position="right" />
    </div>
    
    <!-- Add bottom player if you have 4 players -->
    {#if gameState.players[3]}
        <div class="col-span-12 row-span-3">
            <PlayerPanel player={gameState.players[3]} position="bottom" />
        </div>
    {/if}
    
    <div class="col-span-12 row-span-3">
        <ScoreBoard players={gameState.players} />
    </div>
</div>