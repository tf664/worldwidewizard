<script lang="ts">
    import { socketService } from '$lib/stores/socket';
    import type { GameState } from '$lib/stores/socket';
    import OnlineConfirmDialog from '../OnlineConfirmDialog.svelte';

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

    // Game status helpers
    $: gamePhaseDisplay = {
        'prediction': 'Making Predictions',
        'playing': 'Playing Tricks',
        'scoring': 'Calculating Scores',
        'finished': 'Game Complete'
    }[gameState.phase] || 'Unknown Phase';

    $: currentPlayerName = gameState.players?.[gameState.currentPlayerIndex]?.name || 'Unknown';
    $: isMyTurn = gameState.players?.[gameState.currentPlayerIndex]?.id === currentUsername;
    $: isGameFinished = gameState.phase === 'finished';

    // Admin action handlers
    function handlePauseGame() {
        if (!isAdmin || isGameFinished) return;
        showPauseDialog = true;
    }

    function confirmPause() {
        showPauseDialog = false;
        isPaused = !isPaused;
        socketService.pauseGame(lobbyCode, isPaused);
    }

    function handleRestartGame() {
        if (!isAdmin || isGameFinished) return;
        showRestartDialog = true;
    }

    function confirmRestart() {
        showRestartDialog = false;
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
            window.location.href = `/lobby/${lobbyCode}`;
        }
    }

    function handleEndGame() {
        if (!isAdmin) return;
        showEndDialog = true;
    }

    function confirmEndGame() {
        showEndDialog = false;
        socketService.endGame(lobbyCode);
    }

    function cancelDialog() {
        showPauseDialog = false;
        showRestartDialog = false;
        showReturnDialog = false;
        showEndDialog = false;
    }
</script>

<div class="controls-container">
    <!-- Header with Admin Badge -->
    <div class="controls-header">
        <div class="header-title">
            <span class="game-icon">🎮</span>
            <h3 class="title">Game Controls</h3>
        </div>
        {#if isAdmin}
            <div class="admin-badge">
                <span class="admin-icon">👑</span>
                <span class="admin-text">Admin</span>
            </div>
        {/if}
    </div>

    <!-- Game Status Section -->
    <div class="status-section">
        <h4 class="section-title">
            <span class="status-icon">📊</span>
            Game Status
        </h4>
        
        <div class="status-grid">
            <div class="status-item">
                <span class="status-label">Phase</span>
                <span class="status-value phase-value">
                    {gamePhaseDisplay}
                </span>
            </div>
            
            <div class="status-item">
                <span class="status-label">Round</span>
                <span class="status-value round-value">
                    {gameState.currentRound} / {gameState.maxRounds}
                </span>
            </div>
            
            <div class="status-item turn-item">
                <span class="status-label">Current Turn</span>
                <span class="status-value turn-value {isMyTurn ? 'my-turn' : ''}">
                    {currentPlayerName}
                    {#if isMyTurn}
                        <span class="turn-indicator">🎯</span>
                    {/if}
                </span>
            </div>

            {#if gameState.trumpSuit}
                <div class="status-item">
                    <span class="status-label">Trump</span>
                    <span class="status-value trump-value">
                        {gameState.trumpSuit}
                    </span>
                </div>
            {/if}
        </div>

        {#if isPaused}
            <div class="pause-notice">
                <span class="pause-icon">⏸️</span>
                <span class="pause-text">Game is Paused</span>
            </div>
        {/if}
    </div>

    <!-- Admin Controls -->
    {#if isAdmin && !isGameFinished}
        <div class="admin-section">
            <h4 class="section-title">
                <span class="admin-control-icon">⚙️</span>
                Admin Controls
            </h4>
            
            <div class="button-grid">
                <button 
                    class="control-btn pause-btn"
                    on:click={handlePauseGame}
                    disabled={isGameFinished}
                >
                    <span class="btn-icon">{isPaused ? '▶️' : '⏸️'}</span>
                    <span class="btn-text">{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                
                <button 
                    class="control-btn restart-btn"
                    on:click={handleRestartGame}
                    disabled={isGameFinished}
                >
                    <span class="btn-icon">🔄</span>
                    <span class="btn-text">Restart</span>
                </button>
            </div>
        </div>
    {/if}

    <!-- General Controls -->
    <div class="general-section">
        <h4 class="section-title">
            <span class="general-icon">🏠</span>
            Navigation
        </h4>
        
        <div class="button-grid">
            <button 
                class="control-btn return-btn"
                on:click={handleReturnToLobby}
            >
                <span class="btn-icon">🏠</span>
                <span class="btn-text">Return to Lobby</span>
            </button>
            
            {#if isGameFinished}
                <button 
                    class="control-btn end-btn"
                    on:click={handleEndGame}
                >
                    <span class="btn-icon">🏁</span>
                    <span class="btn-text">End Game</span>
                </button>
            {/if}
        </div>
    </div>
</div>

<!-- Confirmation Dialogs -->
{#if showPauseDialog}
    <OnlineConfirmDialog
        message={isPaused ? 'Resume the game for all players?' : 'Pause the game for all players?'}
        confirmText={isPaused ? 'Resume Game' : 'Pause Game'}
        cancelText="Cancel"
        confirmClass="confirm"
        onConfirm={confirmPause}
        onCancel={cancelDialog}
    />
{/if}

{#if showRestartDialog}
    <OnlineConfirmDialog
        message="Restart the game? This will reset all progress and start over."
        confirmText="Restart Game"
        cancelText="Cancel"
        confirmClass="restart"
        onConfirm={confirmRestart}
        onCancel={cancelDialog}
    />
{/if}

{#if showReturnDialog}
    <OnlineConfirmDialog
        message="Return to lobby? You can rejoin the game later."
        confirmText="Return to Lobby"
        cancelText="Stay in Game"
        confirmClass="confirm"
        onConfirm={confirmReturn}
        onCancel={cancelDialog}
    />
{/if}

{#if showEndDialog}
    <OnlineConfirmDialog
        message="End the game permanently? This cannot be undone."
        confirmText="End Game"
        cancelText="Cancel"
        confirmClass="restart"
        onConfirm={confirmEndGame}
        onCancel={cancelDialog}
    />
{/if}

<style>
    .controls-container {
        background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        border-radius: 1rem;
        padding: 1.5rem;
        border: 2px solid rgba(99, 102, 241, 0.1);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
    }

    .controls-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e2e8f0;
    }

    .header-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .game-icon {
        font-size: 1.5rem;
    }

    .title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
    }

    .admin-badge {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: #1f2937;
        padding: 0.5rem 0.75rem;
        border-radius: 0.75rem;
        font-weight: 700;
        font-size: 0.875rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .admin-icon {
        font-size: 1rem;
    }

    .status-section,
    .admin-section,
    .general-section {
        margin-bottom: 1.5rem;
        background: white;
        border-radius: 0.75rem;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
    }

    .section-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        font-weight: 700;
        color: #374151;
        margin: 0 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .status-icon,
    .admin-control-icon,
    .general-icon {
        font-size: 1.125rem;
    }

    .status-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    .status-item {
        text-align: center;
        padding: 0.75rem;
        background: #f9fafb;
        border-radius: 0.5rem;
        border: 1px solid #f3f4f6;
    }

    .turn-item.my-turn {
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        border-color: #3b82f6;
    }

    .status-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .status-value {
        display: block;
        font-size: 0.875rem;
        font-weight: 700;
        color: #1f2937;
    }

    .phase-value {
        color: #3b82f6;
    }

    .round-value {
        color: #059669;
    }

    .turn-value {
        color: #374151;
    }

    .turn-value.my-turn {
        color: #1d4ed8;
    }

    .trump-value {
        color: #dc2626;
        text-transform: capitalize;
    }

    .turn-indicator {
        margin-left: 0.25rem;
        font-size: 0.75rem;
    }

    .pause-notice {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border: 2px solid #f59e0b;
        color: #92400e;
        padding: 0.75rem;
        border-radius: 0.5rem;
        font-weight: 700;
        margin-top: 1rem;
        animation: pulse-slow 2s infinite;
    }

    .pause-icon {
        font-size: 1.125rem;
    }

    .button-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    .control-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.375rem;
        padding: 1rem 0.75rem;
        border: none;
        border-radius: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
    }

    .control-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.2);
    }

    .control-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
    }

    .pause-btn {
        background: linear-gradient(135deg, #6b7280, #4b5563);
        color: white;
    }

    .restart-btn {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
    }

    .return-btn {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
    }

    .end-btn {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
    }

    .btn-icon {
        font-size: 1.25rem;
    }

    .btn-text {
        font-size: 0.875rem;
    }

    /* Single column layout for smaller controls */
    .button-grid.single-column {
        grid-template-columns: 1fr;
    }

    /* Animations */
    @keyframes pulse-slow {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.8;
        }
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .controls-container {
            padding: 1rem;
        }

        .controls-header {
            margin-bottom: 1rem;
        }

        .status-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
        }

        .button-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
        }

        .control-btn {
            padding: 0.75rem;
        }

        .section-title {
            font-size: 0.875rem;
        }
    }
</style>