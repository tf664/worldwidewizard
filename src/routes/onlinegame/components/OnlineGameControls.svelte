<script lang="ts">
    import { socketService } from '$lib/stores/socket';
    import type { GameState } from '$lib/stores/socket';
    import OnlineConfirmDialog from './OnlineConfirmDialog.svelte';

    export let gameState: GameState;
    export let lobbyCode: string;
    export let currentUsername: string;
    export let isAdmin: boolean = false;
    export let onReturnToLobby: (() => void) | null = null;

    let showPauseDialog = false;
    let showRestartDialog = false;
    let showReturnDialog = false;
    let showEndDialog = false;
    let isPaused = false;


    // Game status helpers - Fixed type checking
    $: gamePhaseDisplay = {
        'prediction': 'Making Predictions',
        'playing': 'Playing Tricks',
        'scoring': 'Calculating Scores',
        'finished': 'Game Complete'
    }[gameState.phase] || 'Unknown Phase';

    $: currentPlayerName = gameState.players?.[gameState.currentPlayerIndex]?.name || 'Unknown';
    $: isMyTurn = gameState.players?.[gameState.currentPlayerIndex]?.id === currentUsername;
    $: isGameFinished = gameState.phase === 'finished';

    function handlePauseGame() {
        if (!isAdmin || isGameFinished) return;
        showPauseDialog = true;
    }

    function confirmPause() {
        showPauseDialog = false;
        isPaused = !isPaused;
        
        // Use the dedicated method instead of getSocket()
        socketService.pauseGame(lobbyCode, isPaused);
    }

    function handleRestartGame() {
        if (!isAdmin || isGameFinished) return;
        showRestartDialog = true;
    }

    function confirmRestart() {
        showRestartDialog = false;
        
        // Use the dedicated method instead of getSocket()
        socketService.restartGame(lobbyCode);
    }

    function handleReturnToLobby() {
        showReturnDialog = true;
    }

    function confirmReturn() {
        showReturnDialog = false;
        
        if (onReturnToLobby) {
            onReturnToLobby();
        } else {
            // Default behavior - navigate to lobby
            window.location.href = `/lobby/${lobbyCode}`;
        }
    }

    function handleEndGame() {
        if (!isAdmin) return;
        showEndDialog = true;
    }

    function confirmEndGame() {
        showEndDialog = false;
        
        // Use the dedicated method instead of getSocket()
        socketService.endGame(lobbyCode);
    }

    function cancelDialog() {
        showPauseDialog = false;
        showRestartDialog = false;
        showReturnDialog = false;
        showEndDialog = false;
    }
</script>

<div class="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-gray-800">Game Controls</h3>
        {#if isAdmin}
            <span class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Admin
            </span>
        {/if}
    </div>

    <!-- Game Status Section -->
    <div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
        <h4 class="font-semibold text-gray-700 mb-3">Game Status</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="flex justify-between">
                <span class="text-gray-600">Phase:</span>
                <span class="font-semibold text-blue-600 capitalize">
                    {gamePhaseDisplay}
                </span>
            </div>
            
            <div class="flex justify-between">
                <span class="text-gray-600">Round:</span>
                <span class="font-semibold">
                    {gameState.currentRound} / {gameState.maxRounds}
                </span>
            </div>
            
            <div class="flex justify-between">
                <span class="text-gray-600">Current Turn:</span>
                <span class="font-semibold {isMyTurn ? 'text-green-600' : ''}">
                    {currentPlayerName}
                    {#if isMyTurn}
                        <span class="text-xs">(Your turn!)</span>
                    {/if}
                </span>
            </div>

            {#if gameState.trumpSuit}
                <div class="flex justify-between">
                    <span class="text-gray-600">Trump:</span>
                    <span class="font-semibold text-red-600 capitalize">
                        {gameState.trumpSuit}
                    </span>
                </div>
            {/if}
        </div>

        {#if isPaused}
            <div class="flex items-center justify-center bg-yellow-100 border border-yellow-300 rounded-lg p-2 mt-3">
                <span class="text-yellow-800 font-semibold">
                    ⏸️ Game Paused
                </span>
            </div>
        {/if}
    </div>

    <!-- Admin Controls -->
    {#if isAdmin && !isGameFinished}
        <div class="mb-6">
            <h4 class="font-semibold text-gray-700 mb-3">Admin Controls</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                    class="btn-secondary flex items-center justify-center gap-2"
                    on:click={handlePauseGame}
                    disabled={isGameFinished}
                >
                    {isPaused ? '▶️ Resume' : '⏸️ Pause'} Game
                </button>
                
                <button 
                    class="btn-danger flex items-center justify-center gap-2"
                    on:click={handleRestartGame}
                    disabled={isGameFinished}
                >
                    🔄 Restart Game
                </button>
            </div>
        </div>
    {/if}

    <!-- General Controls -->
    <div>
        <h4 class="font-semibold text-gray-700 mb-3">General Controls</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
                class="btn-primary flex items-center justify-center gap-2"
                on:click={handleReturnToLobby}
            >
                🏠 Return to Lobby
            </button>
            
            {#if isGameFinished}
                <button 
                    class="btn-success flex items-center justify-center gap-2"
                    on:click={handleEndGame}
                >
                    🏁 End Game
                </button>
            {/if}
        </div>
    </div>
</div>

<!-- Confirmation Dialogs -->
{#if showPauseDialog}
    <OnlineConfirmDialog
        message={isPaused ? 'Resume the game?' : 'Pause the game for all players?'}
        confirmText={isPaused ? 'Resume' : 'Pause'}
        cancelText="Cancel"
        confirmClass="secondary"
        onConfirm={confirmPause}
        onCancel={cancelDialog}
    />
{/if}

{#if showRestartDialog}
    <OnlineConfirmDialog
        message="Restart the game? This will reset all progress and start over."
        confirmText="Restart"
        cancelText="Cancel"
        confirmClass="danger"
        onConfirm={confirmRestart}
        onCancel={cancelDialog}
    />
{/if}

{#if showReturnDialog}
    <OnlineConfirmDialog
        message="Return to lobby? You can rejoin the game later."
        confirmText="Return"
        cancelText="Stay"
        confirmClass="primary"
        onConfirm={confirmReturn}
        onCancel={cancelDialog}
    />
{/if}

{#if showEndDialog}
    <OnlineConfirmDialog
        message="End the game permanently? This cannot be undone."
        confirmText="End Game"
        cancelText="Cancel"
        confirmClass="danger"
        onConfirm={confirmEndGame}
        onCancel={cancelDialog}
    />
{/if}

<style>
    .btn-primary {
        background: #3b82f6;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-primary:hover:not(:disabled) {
        background: #2563eb;
        transform: translateY(-1px);
    }

    .btn-secondary {
        background: #6b7280;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-secondary:hover:not(:disabled) {
        background: #4b5563;
        transform: translateY(-1px);
    }

    .btn-danger {
        background: #ef4444;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-danger:hover:not(:disabled) {
        background: #dc2626;
        transform: translateY(-1px);
    }

    .btn-success {
        background: #10b981;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-success:hover:not(:disabled) {
        background: #059669;
        transform: translateY(-1px);
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
    }
</style>