<script lang="ts">
    import type { GameState, Card, Player } from '$lib/stores/socket';
    import CardImage from '$lib/components/CardImage.svelte';

    export let gameState: GameState;
    export let currentPlayer: Player | null;

    let windowWidth = 0;
    let windowHeight = 0;
    let playerElements: HTMLElement[] = [];

    $: responsiveConfig = getResponsiveConfig(windowWidth, windowHeight);
    $: isMobile = responsiveConfig.breakpoint === 'mobile';

    // FIXED: Use gameState.trumpCard directly from server
    $: trumpCard = gameState?.trumpCard || null;
    $: hasTrumpCard = trumpCard !== null;
    $: trumpSuitDisplay = getTrumpSuitDisplay(gameState?.trumpSuit);

    // FIXED: Helper function for consistent trump suit display
    function getTrumpSuitDisplay(trumpSuit: string | null): string {
        if (!trumpSuit) return 'No Trump';
        return trumpSuit.charAt(0).toUpperCase() + trumpSuit.slice(1);
    }

    // FIXED: Helper function for trump suit color
    function getTrumpSuitColor(trumpSuit: string | null): string {
        if (!trumpSuit) return 'text-gray-600';
        
        switch (trumpSuit.toLowerCase()) {
            case 'red': return 'text-red-600';
            case 'blue': return 'text-blue-600';
            case 'green': return 'text-green-600';
            case 'yellow': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    }

    // Initialize array with correct length
    $: if (gameState && playerElements.length !== gameState.players.length) {
        playerElements = new Array(gameState.players.length);
    }

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

    function isCurrentPlayer(player: Player): boolean {
        const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];
        return currentTurnPlayer?.id === player.id;
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

    function getResponsiveConfig(width: number, height: number) {
        const breakpoint = width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
        
        const availableWidth = width - 100;
        const availableHeight = height - 100;
        const minDimension = Math.min(availableWidth, availableHeight);
        
        const configs = {
            mobile: {
                breakpoint: 'mobile',
                radius: minDimension * 0.28,
                cardSize: { width: 'w-6', height: 'h-10' },
                playerCardSize: { width: 'min-w-24', padding: 'p-2' },
                centralSize: 'h-32 w-32',
                textSize: { header: 'text-sm', body: 'text-xs', score: 'text-sm' }
            },
            tablet: {
                breakpoint: 'tablet',
                radius: minDimension * 0.32,
                cardSize: { width: 'w-8', height: 'h-12' },
                playerCardSize: { width: 'min-w-28', padding: 'p-2' },
                centralSize: 'h-40 w-40',
                textSize: { header: 'text-base', body: 'text-xs', score: 'text-base' }
            },
            desktop: {
                breakpoint: 'desktop',
                radius: minDimension * 0.35,
                cardSize: { width: 'w-10', height: 'h-14' },
                playerCardSize: { width: 'min-w-32', padding: 'p-3' },
                centralSize: 'h-48 w-48',
                textSize: { header: 'text-lg', body: 'text-sm', score: 'text-lg' }
            }
        };

        return configs[breakpoint];
    }

    function getPlayerCircularPosition(
        index: number,
        totalPlayers: number,
        windowWidth: number,
        windowHeight: number,
        config: any
    ): { x: number; y: number; position: string } {
        const angleStep = (2 * Math.PI) / totalPlayers;
        const startAngle = Math.PI / 2;
        const angle = startAngle - index * angleStep;

        let x = Math.cos(angle) * config.radius;
        let y = -Math.sin(angle) * config.radius;

        const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        let position: string;

        const buffer = 80;
        const maxX = (windowWidth / 2) - buffer;
        const maxY = (windowHeight / 2) - buffer;

        if (Math.abs(x) < 120 && Math.abs(y) < 120) {
            const pushDistance = 120;
            x = x > 0 ? pushDistance : -pushDistance;
            y = y > 0 ? pushDistance : -pushDistance;
        }

        x = Math.max(-maxX, Math.min(maxX, x));
        y = Math.max(-maxY, Math.min(maxY, y));

        if (normalizedAngle >= (7 * Math.PI) / 4 || normalizedAngle < Math.PI / 4) {
            position = 'right';
        } else if (normalizedAngle >= Math.PI / 4 && normalizedAngle < (3 * Math.PI) / 4) {
            position = 'top';
        } else if (normalizedAngle >= (3 * Math.PI) / 4 && normalizedAngle < (5 * Math.PI) / 4) {
            position = 'left';
        } else {
            position = 'bottom';
        }

        return { x, y, position };
    }
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<div class="game-table-container">
    <!-- Player Areas with improved positioning -->
    {#each gameState.players as player, index}
        {@const totalPlayers = gameState.players.length}
        {@const circularPos = getPlayerCircularPosition(
            index,
            totalPlayers,
            windowWidth,
            windowHeight,
            responsiveConfig
        )}
        {@const isCurrent = isCurrentPlayer(player)}
        {@const isMe = isCurrentUser(player)}

        <div
            bind:this={playerElements[index]}
            id="player-{index}"
            class="player-card {isCurrent ? 'current-turn' : ''} {isMe ? 'current-user' : ''}"
            class:mobile={isMobile}
            style="left: 50%; top: 50%; 
                   transform: translate(calc(-50% + {circularPos.x}px), calc(-50% + {circularPos.y}px));"
        >
            <div class="player-content">
                <h3 class="player-name {responsiveConfig.textSize.header}" title={player.name}>
                    {isMobile ? player.name.substring(0, 8) : player.name}
                    {#if isMe}<span class="user-indicator">(You)</span>{/if}
                </h3>
                
                <div class="player-stats">
                    <div class="stat-item">
                        <div class="stat-label">Score</div>
                        <div class="stat-value score">{player.score}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Pred</div>
                        <div class="stat-value prediction">
                            {player.prediction !== null ? player.prediction : '?'}
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Won</div>
                        <div class="stat-value tricks">{player.tricksWon}</div>
                    </div>
                </div>

                <div class="card-count">
                    Cards: {player.hand.length}
                </div>

                {#if isCurrent && (gameState.phase === 'prediction' || gameState.phase === 'playing')}
                    <div class="turn-indicator">
                        {gameState.phase === 'prediction' ? 'Predicting' : 'Playing'}
                    </div>
                {/if}
            </div>
        </div>
    {/each}

    <!-- Improved Central Game Area -->
    <div class="central-area h-80 w-80">
        <!-- Game Info -->
        <div class="game-info">
            <div class="text-lg font-bold">Round {gameState.currentRound}</div>
            <!-- FIXED: Use proper trump suit display with correct colors -->
            <div class="text-sm">
                Trump: <span class="{getTrumpSuitColor(gameState.trumpSuit)} font-bold">
                    {trumpSuitDisplay}
                </span>
            </div>
            <div class="text-sm">Phase: {gameState.phase}</div>
        </div>

        <!-- Current Trick -->
        <div class="current-trick">
            <h3 class="trick-title {isMobile ? 'text-xs' : 'text-sm'}">Current Trick</h3>
            <div class="trick-cards">
                {#if gameState.currentTrick.length > 0}
                    {#each gameState.currentTrick as trickPlay}
                        <div class="trick-card {responsiveConfig.cardSize.width} {responsiveConfig.cardSize.height}">
                            {#key `trick-${trickPlay.card.suit}-${trickPlay.card.rank}-${trickPlay.playerId}`}
                                <CardImage
                                    src={getCardImagePath(trickPlay.card)}
                                    alt={getCardDisplay(trickPlay.card)}
                                    className="w-full h-full object-cover"
                                />
                            {/key}
                            <div class="card-player-name">
                                {gameState.players[trickPlay.playerId]?.name || 'Unknown'}
                            </div>
                        </div>
                    {/each}
                {:else}
                    <p class="no-cards {isMobile ? 'text-xs' : 'text-sm'}">No cards played</p>
                {/if}
            </div>
        </div>

        <!-- FIXED: Trump Card Display using gameState.trumpCard -->
        {#if hasTrumpCard && trumpCard}
            <div class="trump-card">
                <div class="trump-card-container {isMobile ? 'w-10 h-16' : 'w-24 h-36'}">
                    {#key `trump-${trumpCard.suit}-${trumpCard.rank}-${gameState.currentRound}`}
                        <CardImage
                            src={getCardImagePath(trumpCard)}
                            alt={getCardDisplay(trumpCard)}
                            className="card-image"
                        />
                    {/key}
                    <div class="trump-label">Trump</div>
                </div>
            </div>
        {/if}

        <!-- Deck Count -->
        <div class="deck-count">
            Deck: {gameState.deck.length}
        </div>

        <!-- Phase indicator -->
        {#if gameState.phase === 'prediction'}
            <div class="phase-indicator prediction-phase">
                Prediction Phase
            </div>
        {:else if gameState.phase === 'playing'}
            <div class="phase-indicator playing-phase">
                Playing Phase
            </div>
        {/if}
    </div>
</div>

<!-- Keep existing styles -->
<style>
    .game-table-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #065f46, #047857, #059669);
        border-radius: 1rem;
        overflow: hidden;
        padding: 1rem;
    }

    .player-card {
        position: absolute;
        background: linear-gradient(135deg, #1f2937, #374151);
        color: white;
        border-radius: 0.75rem;
        padding: 0.75rem;
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        border: 2px solid transparent;
        min-width: 120px;
        z-index: 10;
    }

    .player-card.mobile {
        padding: 0.5rem;
        min-width: 100px;
    }

    .player-card.current-turn {
        border-color: #fbbf24;
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        transform: scale(1.05);
        z-index: 20;
        animation: glow 2s infinite alternate;
    }

    .player-card.current-user {
        background: linear-gradient(135deg, #1e40af, #3b82f6);
        border-color: #60a5fa;
    }

    .player-content {
        text-align: center;
    }

    .player-name {
        font-weight: 700;
        margin-bottom: 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-indicator {
        color: #fbbf24;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .player-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .stat-item {
        text-align: center;
    }

    .stat-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #d1d5db;
        margin-bottom: 0.125rem;
    }

    .stat-value {
        font-size: 1rem;
        font-weight: 700;
    }

    .stat-value.score {
        color: #34d399;
    }

    .stat-value.prediction {
        color: #60a5fa;
    }

    .stat-value.tricks {
        color: #f472b6;
    }

    .card-count {
        font-size: 0.75rem;
        color: #d1d5db;
        margin-bottom: 0.25rem;
    }

    .turn-indicator {
        background: #fbbf24;
        color: #1f2937;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 700;
        animation: pulse 2s infinite;
    }

    .central-area {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #047857, #059669);
        border: 4px solid #34d399;
        border-radius: 50%;
        color: white;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
        z-index: 5;
        padding: 1rem;
    }

    .game-info {
        text-align: center;
        margin-bottom: 0.75rem;
    }

    .round-title {
        font-weight: 700;
        margin-bottom: 0.25rem;
    }

    .phase-description {
        margin-bottom: 0.25rem;
        opacity: 0.9;
    }

    .trump-info {
        opacity: 0.8;
    }

    .trump-suit {
        font-weight: 700;
        color: #fbbf24;
        text-transform: capitalize;
    }

    .current-trick {
        text-align: center;
    }

    .trick-title {
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .trick-cards {
        display: flex;
        gap: 0.25rem;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        min-height: 3rem;
    }

    .trick-card {
        position: relative;
        border-radius: 0.375rem;
        border: 2px solid white;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }

    .card-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .card-player-name {
        position: absolute;
        bottom: -1.5rem;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        font-size: 0.625rem;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
        white-space: nowrap;
        font-weight: 500;
    }

    .no-cards {
        opacity: 0.7;
        font-style: italic;
    }

    .trump-card {
        position: absolute;
        bottom: -0.5rem;
        right: -0.5rem;
    }

    .trump-card-container {
        position: relative;
        border-radius: 0.375rem;
        border: 2px solid white;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }

    .trump-label {
        position: absolute;
        bottom: -1.25rem;
        left: 50%;
        transform: translateX(-50%);
        background: #fbbf24;
        color: #1f2937;
        font-size: 0.625rem;
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-weight: 700;
    }

    .deck-count {
        position: absolute;
        top: -0.5rem;
        left: -0.5rem;
        background: #1e40af;
        color: white;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-weight: 600;
    }

    .phase-indicator {
        position: absolute;
        top: -2rem;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
    }

    .prediction-phase {
        background: #3b82f6;
        color: white;
    }

    .playing-phase {
        background: #10b981;
        color: white;
    }

    @keyframes glow {
        0% {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        }
        100% {
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.8);
        }
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }

    /* Mobile specific adjustments */
    @media (max-width: 768px) {
        .game-table-container {
            padding: 0.5rem;
        }

        .player-card {
            min-width: 90px;
        }

        .player-stats {
            gap: 0.25rem;
        }

        .stat-value {
            font-size: 0.875rem;
        }

        .central-area {
            padding: 0.5rem;
        }

        .trick-cards {
            gap: 0.125rem;
        }
    }
</style>