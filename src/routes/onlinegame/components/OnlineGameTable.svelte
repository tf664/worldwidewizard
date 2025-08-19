<script lang="ts">
    import type { GameState, Card, Player } from '$lib/stores/socket';
    import CardImage from '$lib/components/CardImage.svelte';

    export let gameState: GameState;
    export let currentPlayer: Player | null;

    function getCardDisplay(card: Card): string {
        if (card.rank === 'Zoro') return 'Z';
        if (card.rank === 'Fool') return 'F';
        return card.rank.toString();
    }

    function getCardImagePath(card: Card): string {
        if (card.rank === 'Zoro') {
            const zoroNumbers = ['one', 'two', 'three', 'four'];
            const randomZoro = zoroNumbers[Math.floor(Math.random() * 4)];
            return `/rcs/cards-optimized/zoro_${randomZoro}.webp`;
        }
        if (card.rank === 'Fool') {
            const foolNumbers = ['one', 'two', 'three', 'four'];
            const randomFool = foolNumbers[Math.floor(Math.random() * 4)];
            return `/rcs/cards-optimized/fool_${randomFool}.webp`;
        }

        const suitName = card.suit?.toLowerCase() || 'unknown';
        let rankName: string;
        if (typeof card.rank === 'number') {
            const rankNames = [
                '', 'one', 'two', 'three', 'four', 'five', 'six', 
                'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'
            ];
            rankName = rankNames[card.rank] || card.rank.toString();
        } else {
            rankName = String(card.rank).toLowerCase();
        }

        return `/rcs/cards-optimized/${suitName}_${rankName}.webp`;
    }

    function getPlayerPosition(index: number): string {
        const positions = ['bottom', 'left', 'top', 'right'];
        return positions[index] || 'bottom';
    }

    function isCurrentPlayer(index: number): boolean {
        return gameState.currentPlayerIndex === index;
    }

    function isCurrentUser(player: Player): boolean {
        return currentPlayer?.id === player.id;
    }

    function getPhaseDescription(): string {
        switch (gameState.phase) {
            case 'prediction': return 'Making Predictions';
            case 'playing': return 'Playing Cards';
            case 'scoring': return 'Round Complete';
            case 'finished': return 'Game Complete';
            default: return gameState.phase;
        }
    }
</script>

<div class="relative w-full h-full flex items-center justify-center">
    <!-- Player Areas arranged around the table -->
    {#each gameState.players as player, index}
        {@const position = getPlayerPosition(index)}
        {@const isCurrent = isCurrentPlayer(index)}
        {@const isMe = isCurrentUser(player)}

        <!-- Player Info Card -->
        <div
            class="absolute player-{position} {isCurrent && (gameState.phase === 'prediction' || gameState.phase === 'playing')
                ? 'ring-4 ring-yellow-400 animate-pulse'
                : ''} {isMe
                ? 'bg-blue-700'
                : 'bg-green-700'} rounded-lg p-4 text-white min-w-48"
        >
            <div class="text-center">
                <h3 class="font-bold text-lg mb-2">
                    {player.name}
                    {#if isMe}<span class="text-yellow-300">(You)</span>{/if}
                </h3>
                <div class="grid grid-cols-3 gap-2 text-sm">
                    <div>
                        <div class="font-semibold">Score</div>
                        <div class="text-xl">{player.score}</div>
                    </div>
                    <div>
                        <div class="font-semibold">Predicted</div>
                        <div class="text-xl">{player.prediction !== null ? player.prediction : '?'}</div>
                    </div>
                    <div>
                        <div class="font-semibold">Tricks</div>
                        <div class="text-xl">{player.tricksWon}</div>
                    </div>
                </div>

                <!-- Show hand count -->
                <div class="mt-3 text-xs opacity-75">
                    Cards: {player.hand.length}
                </div>

                <!-- Current player indicator -->
                {#if isCurrent && (gameState.phase === 'prediction' || gameState.phase === 'playing')}
                    <div class="mt-2 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                        {gameState.phase === 'prediction' ? 'Predicting' : 'Playing'}
                    </div>
                {/if}
            </div>
        </div>
    {/each}

    <!-- Central Game Area -->
    <div
        class="bg-green-600 rounded-full w-80 h-80 flex flex-col items-center justify-center text-white relative"
    >
        <!-- Game Info -->
        <div class="text-center mb-4">
            <h2 class="text-2xl font-bold">Round {gameState.currentRound}</h2>
            <p class="text-lg">{getPhaseDescription()}</p>
            {#if gameState.trumpSuit}
                <p class="text-sm mt-1">
                    Trump: <span class="capitalize font-semibold">{gameState.trumpSuit}</span>
                </p>
            {:else}
                <p class="text-sm mt-1">No Trump</p>
            {/if}
        </div>

        <!-- Current Trick -->
        <div class="flex flex-col items-center">
            <h3 class="text-sm font-semibold mb-2">Current Trick</h3>
            <div class="flex space-x-1 min-h-16 items-center">
                {#if gameState.currentTrick.length > 0}
                    {#each gameState.currentTrick as trickPlay}
                        <div class="relative w-10 h-14 rounded border border-white overflow-hidden">
                            <CardImage
                                src={getCardImagePath(trickPlay.card)}
                                alt={getCardDisplay(trickPlay.card)}
                                className="w-full h-full object-cover"
                            />
                            <!-- Player name -->
                            <div
                                class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-1 rounded whitespace-nowrap"
                            >
                                {gameState.players[trickPlay.playerId]?.name || 'Unknown'}
                            </div>
                        </div>
                    {/each}
                {:else}
                    <p class="text-sm opacity-75">No cards played</p>
                {/if}
            </div>
        </div>

        <!-- Trump Card Display -->
        {#if gameState.trumpCard}
            <div class="absolute -bottom-2 -right-2">
                <div class="relative w-12 h-16 rounded border border-white overflow-hidden">
                    <CardImage
                        src={getCardImagePath(gameState.trumpCard)}
                        alt={getCardDisplay(gameState.trumpCard)}
                        className="w-full h-full object-cover"
                    />
                    <div
                        class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-black text-xs px-1 rounded font-bold"
                    >
                        Trump
                    </div>
                </div>
            </div>
        {/if}

        <!-- Deck Count -->
        <div class="absolute -top-2 -left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
            Deck: {gameState.deck.length}
        </div>

        <!-- Phase transition indicator -->
        {#if gameState.phase === 'prediction'}
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                Prediction Phase
            </div>
        {:else if gameState.phase === 'playing'}
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                Playing Phase
            </div>
        {/if}
    </div>
</div>

<style>
    .player-bottom {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
    }

    .player-top {
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
    }

    .player-left {
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
    }

    .player-right {
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
    }
</style>