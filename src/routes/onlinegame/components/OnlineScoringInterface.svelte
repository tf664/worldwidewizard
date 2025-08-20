<script lang="ts">
    import type { GameState } from '$lib/stores/socket';

    export let gameState: GameState;
    export let onNextRound: () => void;

    // Dragging state
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let windowX = 0;
    let windowY = 0;
    let interfaceElement: HTMLElement;
    let hasInitializedPosition = false;

    // Window size tracking
    let windowWidth = 0;
    let windowHeight = 0;
    $: isMobile = windowWidth < 768;
    $: isGameFinished = gameState.phase === 'finished';
    $: sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    $: if (!hasInitializedPosition && !isMobile && windowWidth > 0 && windowHeight > 0) {
        setTimeout(() => {
            if (interfaceElement) {
                const rect = interfaceElement.getBoundingClientRect();
                if (rect) {
                    windowX = Math.max(50, (windowWidth - rect.width) / 2);
                    windowY = Math.max(50, (windowHeight - rect.height) / 2);
                    hasInitializedPosition = true;
                }
            }
        }, 50);
    }

    // Dragging functions
    function handleMouseDown(event: MouseEvent) {
        if (isMobile) return;
        
        const target = event.target as HTMLElement;
        if (!target.classList.contains('drag-handle') && !target.closest('.drag-handle')) {
            return;
        }
        
        isDragging = true;
        dragStartX = event.clientX - windowX;
        dragStartY = event.clientY - windowY;
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        event.preventDefault();
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isDragging) return;
        
        const newX = event.clientX - dragStartX;
        const newY = event.clientY - dragStartY;
        
        const minVisible = 50;
        const maxX = windowWidth - minVisible;
        const maxY = windowHeight - minVisible;
        const minX = -(500 - minVisible);
        const minY = -minVisible;
        
        windowX = Math.max(minX, Math.min(maxX, newX));
        windowY = Math.max(minY, Math.min(maxY, newY));
    }

    $: if (!isDragging && windowWidth > 0 && windowHeight > 0) {
        if (!isMobile && interfaceElement) {
            const rect = interfaceElement.getBoundingClientRect();
            if (rect && windowX === 0 && windowY === 0) {
                windowX = Math.max(0, (windowWidth - rect.width) / 2);
                windowY = Math.max(0, (windowHeight - rect.height) / 2);
            }
        }
    }

    function handleMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        console.log('Drag ended at position:', { windowX, windowY });
    }

    function calculateRoundScore(player: any): number {
        if (player.prediction === player.tricksWon) {
            return 20 + (player.prediction * 10);
        } else {
            return -10 * Math.abs(player.prediction - player.tricksWon);
        }
    }

    function getPositionEmoji(index: number): string {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return '🏅';
        }
    }

    function getRankSuffix(rank: number): string {
        if (rank === 1) return 'st';
        if (rank === 2) return 'nd';
        if (rank === 3) return 'rd';
        return 'th';
    }
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<!-- Mobile: Fixed overlay, Desktop: Movable window -->
{#if isMobile}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="relative mx-auto w-full max-w-lg rounded-2xl border-4 border-{isGameFinished ? 'yellow' : 'blue'}-500 bg-white p-4 shadow-2xl sm:max-w-xl sm:p-6">
            <!-- Mobile content -->
            <div class="space-y-4">
                <!-- Header -->
                <div class="text-center">
                    <h3 class="text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl">
                        {#if isGameFinished}
                            🎉 Game Complete! 🎉
                        {:else}
                            Round {gameState.currentRound} Complete
                        {/if}
                    </h3>
                    <p class="mt-1 text-sm text-gray-600 sm:text-base">
                        {#if isGameFinished}
                            Final Results
                        {:else}
                            Round {gameState.currentRound} of {gameState.maxRounds}
                        {/if}
                    </p>
                </div>

                <!-- Scores section -->
                <div class="rounded-lg bg-{isGameFinished ? 'yellow' : 'blue'}-50 p-4">
                    <div class="space-y-3">
                        {#each sortedPlayers as player, index}
                            {@const roundScore = calculateRoundScore(player)}
                            <div class="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm border {index === 0 && isGameFinished ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}">
                                <div class="flex items-center space-x-3">
                                    <span class="text-2xl">{getPositionEmoji(index)}</span>
                                    <div>
                                        <div class="font-bold text-gray-800 {index === 0 && isGameFinished ? 'text-yellow-700' : ''}">
                                            {player.name}
                                            {#if index === 0 && isGameFinished}
                                                <span class="ml-2 text-sm font-normal text-yellow-600">Winner!</span>
                                            {/if}
                                        </div>
                                        <div class="text-sm text-gray-600">
                                            Predicted: {player.prediction} • Won: {player.tricksWon}
                                            {#if player.prediction === player.tricksWon}
                                                <span class="text-green-600">✓ Perfect!</span>
                                            {:else}
                                                <span class="text-red-600">✗ Off by {Math.abs((player.prediction ?? 0) - (player.tricksWon ?? 0))}</span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-lg {index === 0 && isGameFinished ? 'text-yellow-700' : 'text-gray-800'}">
                                        {player.score}
                                    </div>
                                    {#if !isGameFinished}
                                        <div class="text-sm {roundScore >= 0 ? 'text-green-600' : 'text-red-600'}">
                                            {roundScore >= 0 ? '+' : ''}{roundScore}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Scoring explanation -->
                {#if !isGameFinished}
                    <div class="text-xs text-gray-600 text-center bg-gray-50 rounded-lg p-3">
                        <p class="font-semibold mb-1">Scoring:</p>
                        <p>✓ Correct prediction: 20 + 10 per trick</p>
                        <p>✗ Wrong prediction: -10 per difference</p>
                    </div>
                {/if}

                <!-- Action button -->
                <div class="text-center">
                    <button 
                        class="rounded-xl bg-{isGameFinished ? 'green' : 'blue'}-600 font-semibold text-white transition-all hover:scale-105 hover:bg-{isGameFinished ? 'green' : 'blue'}-700 px-6 py-3 text-base"
                        on:click={onNextRound}
                        disabled={gameState.isPaused}
                    >
                        {#if isGameFinished}
                            🏠 Return to Lobby
                        {:else}
                            ▶️ Next Round
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
{:else}
    <!-- Desktop: Movable window -->
    <div class="fixed inset-0 z-50 pointer-events-none">
        <div 
            bind:this={interfaceElement}
            class="absolute pointer-events-auto w-[500px] rounded-2xl border-4 border-{isGameFinished ? 'yellow' : 'blue'}-500 bg-white shadow-2xl transition-transform duration-200 {isDragging ? 'cursor-grabbing' : ''}"
            style="left: {windowX}px; top: {windowY}px; transform: {isDragging ? 'scale(1.02)' : 'scale(1)'};"
            on:mousedown={handleMouseDown}
            role="dialog"
            tabindex="-1"
        >
            <!-- Draggable Header -->
            <div class="drag-handle cursor-grab bg-{isGameFinished ? 'yellow' : 'blue'}-500 text-white px-4 py-2 rounded-t-xl flex items-center justify-between {isDragging ? 'cursor-grabbing' : 'cursor-grab'}">
                <h3 class="font-bold text-lg">
                    {#if isGameFinished}
                        🎉 Game Complete! 🎉
                    {:else}
                        Round {gameState.currentRound} Complete
                    {/if}
                </h3>
                <div class="flex items-center gap-2">
                    <span class="text-sm">{isGameFinished ? '🏆' : '📊'}</span>
                </div>
            </div>

            <!-- Window Content -->
            <div class="p-4 space-y-4">
                <!-- Header info -->
                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        {#if isGameFinished}
                            Final Results
                        {:else}
                            Round {gameState.currentRound} of {gameState.maxRounds}
                        {/if}
                    </p>
                </div>

                <!-- Scores section -->
                <div class="rounded-lg bg-{isGameFinished ? 'yellow' : 'blue'}-50 p-4 max-h-80 overflow-y-auto">
                    <div class="space-y-3">
                        {#each sortedPlayers as player, index}
                            {@const roundScore = calculateRoundScore(player)}
                            <div class="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm border {index === 0 && isGameFinished ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}">
                                <div class="flex items-center space-x-3">
                                    <span class="text-2xl">{getPositionEmoji(index)}</span>
                                    <div>
                                        <div class="font-bold text-gray-800 {index === 0 && isGameFinished ? 'text-yellow-700' : ''}">
                                            {player.name}
                                            {#if index === 0 && isGameFinished}
                                                <span class="ml-2 text-sm font-normal text-yellow-600">Winner!</span>
                                            {/if}
                                        </div>
                                        <div class="text-sm text-gray-600">
                                            Predicted: {player.prediction} • Won: {player.tricksWon}
                                            {#if player.prediction === player.tricksWon}
                                                <span class="text-green-600">✓ Perfect!</span>
                                            {:else}
                                                <span class="text-red-600">✗ Off by {Math.abs((player.prediction ?? 0) - (player.tricksWon ?? 0))}</span>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-lg {index === 0 && isGameFinished ? 'text-yellow-700' : 'text-gray-800'}">
                                        {player.score}
                                    </div>
                                    {#if !isGameFinished}
                                        <div class="text-sm {roundScore >= 0 ? 'text-green-600' : 'text-red-600'}">
                                            {roundScore >= 0 ? '+' : ''}{roundScore}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Scoring explanation -->
                {#if !isGameFinished}
                    <div class="text-xs text-gray-600 text-center bg-gray-50 rounded-lg p-3">
                        <p class="font-semibold mb-1">Scoring:</p>
                        <p>✓ Correct prediction: 20 + 10 per trick</p>
                        <p>✗ Wrong prediction: -10 per difference</p>
                    </div>
                {/if}

                <!-- Action button -->
                <div class="text-center">
                    <button 
                        class="rounded-xl bg-{isGameFinished ? 'green' : 'blue'}-600 font-semibold text-white transition-all hover:scale-105 hover:bg-{isGameFinished ? 'green' : 'blue'}-700 px-8 py-4 text-lg"
                        on:click={onNextRound}
                        disabled={gameState.isPaused}
                    >
                        {#if isGameFinished}
                            🏠 Return to Lobby
                        {:else}
                            ▶️ Next Round
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .drag-handle {
        user-select: none;
    }
    
    .drag-handle:active {
        cursor: grabbing !important;
    }
</style>