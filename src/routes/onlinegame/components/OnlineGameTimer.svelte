<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { GameState } from '$lib/stores/socket';
    import {PauseSolid,
		    ClockOutline,

			ClockSolid

	} from 'flowbite-svelte-icons';


    export let gameState: GameState;
    export let isPaused: boolean = false;

    // FIXED: Use simple elapsed time like offline timer
    let startTime: number = 0;
    let elapsed = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let hasStarted = false;

    // FIXED: Initialize timer when game state first becomes available
    $: if (gameState && !hasStarted) {
        console.log('Starting timer for new game');
        startTimer();
        hasStarted = true;
    }

    // FIXED: Handle pause state like offline timer
    $: if (gameState && hasStarted) {
        if (isPaused && intervalId) {
            // Pause: stop the interval
            clearInterval(intervalId);
            intervalId = null;
            console.log('Timer paused');
        } else if (!isPaused && !intervalId) {
            // Resume: restart the interval but adjust start time to account for elapsed time
            startTime = Date.now() - elapsed * 1000;
            intervalId = setInterval(() => {
                elapsed = Math.floor((Date.now() - startTime) / 1000);
            }, 1000);
            console.log('Timer resumed');
        }
    }

    function startTimer() {
        if (intervalId) {
            clearInterval(intervalId);
        }
        
        startTime = Date.now();
        elapsed = 0;
        
        if (!isPaused) {
            intervalId = setInterval(() => {
                elapsed = Math.floor((Date.now() - startTime) / 1000);
            }, 1000);
        }
        
        console.log('Timer started:', { startTime, isPaused });
    }

    function formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    onMount(() => {
        console.log('OnlineGameTimer mounted');
        if (gameState && !hasStarted) {
            startTimer();
            hasStarted = true;
        }
    });

    onDestroy(() => {
        console.log('OnlineGameTimer destroyed');
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    });
</script>

<!-- Use exact same styling as offline timer -->
<div class="fixed top-24 left-4 z-50 flex items-center gap-4 rounded-xl bg-gray-800 px-4 py-2 font-mono text-2xl text-white shadow">
    {#if isPaused}
		<PauseSolid class="h-6 w-6 shrink-0" />
	{:else}
		<ClockOutline class="h-6 w-6 shrink-0" />
	{/if}
    <span>{formatTime(elapsed)}</span>
</div>