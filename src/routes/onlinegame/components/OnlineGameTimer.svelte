<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { GameState } from '$lib/stores/socket';

    export let gameState: GameState;
    export let isPaused: boolean = false;

    let gameStartTime = Date.now();
    let currentTime = Date.now();
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let pausedTime = 0;
    let pauseStartTime: number | null = null;

    // Track when the game actually started (not just component mount)
    $: if (gameState && gameState.phase !== 'finished') {
        if (!gameStartTime || gameStartTime === 0) {
            gameStartTime = Date.now();
        }
    }

    // Handle pause state
    $: if (isPaused) {
        if (!pauseStartTime) {
            pauseStartTime = Date.now();
        }
    } else {
        if (pauseStartTime) {
            pausedTime += Date.now() - pauseStartTime;
            pauseStartTime = null;
        }
    }

    onMount(() => {
        gameStartTime = Date.now();
        startTimer();
    });

    onDestroy(() => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    });

    function startTimer() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        
        intervalId = setInterval(() => {
            if (!isPaused) {
                currentTime = Date.now();
            }
        }, 1000);
    }

    function formatTime(milliseconds: number): string {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    $: elapsedTime = isPaused && pauseStartTime 
        ? (pauseStartTime - gameStartTime - pausedTime)
        : (currentTime - gameStartTime - pausedTime);

    $: formattedTime = formatTime(Math.max(0, elapsedTime));

    function getTimerColor(): string {
        const minutes = elapsedTime / (1000 * 60);
        if (minutes < 30) return 'text-green-600';
        if (minutes < 60) return 'text-yellow-600';
        return 'text-red-600';
    }

    function getPhaseTime(): string {
        // This could be enhanced to track time per phase
        // For now, just show overall game time
        return formattedTime;
    }
</script>

<div class="timer-container">
    <div class="timer-header">
        <h4>Game Timer</h4>
        {#if isPaused}
            <span class="pause-indicator">⏸️</span>
        {/if}
    </div>

    <div class="timer-display">
        <div class="time-item">
            <span class="time-label">Total Time</span>
            <span class="time-value {getTimerColor()}">{formattedTime}</span>
        </div>

        <div class="time-item">
            <span class="time-label">Current Phase</span>
            <span class="time-value">{getPhaseTime()}</span>
        </div>

        <div class="time-item">
            <span class="time-label">Round</span>
            <span class="time-value">{gameState.currentRound} / {gameState.maxRounds}</span>
        </div>
    </div>

    <div class="timer-status">
        {#if isPaused}
            <span class="status-paused">⏸️ Paused</span>
        {:else if gameState.phase === 'finished'}
            <span class="status-finished">🏁 Completed</span>
        {:else}
            <span class="status-running">▶️ Running</span>
        {/if}
    </div>
</div>

<style>
    .timer-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 0.75rem;
        padding: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
    }

    .timer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .timer-header h4 {
        font-size: 1.125rem;
        font-weight: 700;
        margin: 0;
        color: white;
    }

    .pause-indicator {
        font-size: 1.25rem;
        animation: pulse 2s infinite;
    }

    .timer-display {
        display: grid;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .time-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .time-item:last-child {
        border-bottom: none;
    }

    .time-label {
        font-size: 0.875rem;
        opacity: 0.9;
        font-weight: 500;
    }

    .time-value {
        font-size: 1.125rem;
        font-weight: 700;
        font-family: 'Courier New', monospace;
    }

    .timer-status {
        text-align: center;
        padding: 0.5rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
    }

    .status-running {
        color: #34d399;
        font-weight: 600;
    }

    .status-paused {
        color: #fbbf24;
        font-weight: 600;
    }

    .status-finished {
        color: #a78bfa;
        font-weight: 600;
    }

    .text-green-600 {
        color: #34d399;
    }

    .text-yellow-600 {
        color: #fbbf24;
    }

    .text-red-600 {
        color: #f87171;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
</style>