<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { socketService, gameState, connectionStatus, error, isReconnecting, unreadMessageCount, type Player } from '$lib/stores/socket';
  import { userStore } from '$lib/stores/user';
  import { lobby } from '$lib/stores/lobby';
  import { goto } from '$app/navigation';
  import OnlineGameTable from '../components/OnlineGameTable.svelte';
  import OnlineBiddingInterface from '../components/Interface/OnlineBiddingInterface.svelte';
  import OnlineCardPlayInterface from '../components/Interface/OnlineCardPlayInterface.svelte';
  import OnlineScoringInterface from '../components/Interface/OnlineScoringInterface.svelte';
  import OnlineScoreBoard from '../components/GameFeatures/OnlineScoreBoard.svelte';
  import OnlineGameChat from '../components/GameFeatures/OnlineGameChat.svelte';
  import OnlineGameControls from '../components/GameFeatures/OnlineGameControls.svelte';
  import OnlineGameTimer from '../components/GameFeatures/OnlineGameTimer.svelte';

  // ========================================
  // COMPONENT STATE
  // ========================================
  const lobbyCode = $page.params.code ?? '';
  let currentPlayer: Player | null = null;
  let savedGameData: any = null;
  let actualUsername: string = '';
  let showChat = false;
  let componentMounted = false;
  let initializationInProgress = false;
  let initializationComplete = false;
  let hasJoinedThisSession = false;
  let isPaused = false;
  let isAdmin = false;
  let showDebugInfo = false;

  let windowWidth = 0;
  $: isMobile = windowWidth < 768;
  

  // ========================================
  // DEBUG LOGGING
  // ========================================
  function debugLog(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[GAME ${timestamp}] ${message}:`, data);
    } else {
      console.log(`[GAME ${timestamp}] ${message}`);
    }
  }

  // ========================================
  // USERNAME RESOLUTION
  // ========================================
  function resolveUsername(): string {
    if (!savedGameData) {
      savedGameData = socketService.initializeWithSavedData();
    }

    const storedUsername = $userStore?.username;
    const lobbyUsername = $lobby?.username;
    const savedUsername = savedGameData?.username;
    const socketUsername = socketService.getCurrentUserInfo()?.username;
    
    const resolved = storedUsername || lobbyUsername || savedUsername || socketUsername || '';
    
    debugLog('Username resolution', {
      storedUsername,
      lobbyUsername,
      savedUsername,
      socketUsername,
      resolved
    });
    
    return resolved;
  }

  // ========================================
  // REACTIVE STATEMENTS
  // ========================================
  
  // Admin check
  $: {
    isAdmin = $gameState?.players?.[0]?.id === actualUsername;
  }

  // Pause state from game
  $: {
    isPaused = $gameState?.isPaused || false;
  }

  // Username resolution - reactive to store changes
  $: if (initializationComplete) {
    const newUsername = resolveUsername();
    if (newUsername && newUsername !== actualUsername) {
      actualUsername = newUsername;
      debugLog('Username updated', { newUsername: actualUsername });
    }
  }

  // Current player resolution
  $: if ($gameState && actualUsername) {
    const foundPlayer = $gameState.players.find(p => p.id === actualUsername);
    if (foundPlayer !== currentPlayer) {
      currentPlayer = foundPlayer || null;
      debugLog('Current player updated', {
        playerName: currentPlayer?.name,
        playerId: currentPlayer?.id,
        gamePhase: $gameState.phase
      });
    }
  }

  // Error logging
  $: if ($error) {
    debugLog('Error occurred', $error);
  }

  // ========================================
  // INITIALIZATION
  // ========================================
  onMount(async () => {
    if (componentMounted || initializationInProgress) {
      debugLog('Component already mounted or initialization in progress, skipping');
      return;
    }
    
    componentMounted = true;
    initializationInProgress = true;

    debugLog('Component initializing', { lobbyCode });

    try {
      // Step 1: Load saved data
      savedGameData = socketService.initializeWithSavedData();
      debugLog('Saved data loaded', savedGameData);

      // FIXED: Longer wait for stores to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Resolve username
      actualUsername = resolveUsername();
      debugLog('Initial username resolved', { actualUsername });

      // Step 4: Mark initialization as complete
      initializationComplete = true;

      // Step 5: Validate username
      if (!actualUsername) {
        debugLog('No username found, redirecting to setup');
        goto('/onlinesetup');
        return;
      }

      // Step 6: Check for reconnection scenario
      if (savedGameData?.gameState && savedGameData.lobbyCode === lobbyCode) {
        debugLog('Reconnection scenario detected');
        isReconnecting.set(true);
      }

      // FIXED: Better connection handling
      debugLog('Initiating socket connection', { lobbyCode, actualUsername });
      
      // Always reset first, but wait for it to complete
      socketService.reset();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Connect with retry logic
      let connectAttempts = 0;
      const maxConnectAttempts = 3;
      
      while (connectAttempts < maxConnectAttempts) {
        try {
          await socketService.connect(lobbyCode, actualUsername);
          break; // Success, exit retry loop
        } catch (err) {
          connectAttempts++;
          debugLog(`Connection attempt ${connectAttempts} failed`, err);
          if (connectAttempts >= maxConnectAttempts) {
            throw err;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Step 8: Join lobby and game
      if (socketService.isConnected()) {
        debugLog('Connected, now joining lobby and game', { lobbyCode, actualUsername });
        
        socketService.joinLobby(lobbyCode, actualUsername);
        
        // FIXED: Better timing for joining game
        setTimeout(() => {
          if (socketService.isConnected()) {
            socketService.joinGame(lobbyCode);
            socketService.saveSession(lobbyCode, actualUsername);
            debugLog('Joined lobby and game');
            
            // Initialize chat
            setTimeout(() => {
              socketService.initializeChatData(lobbyCode);
            }, 500);
          }
        }, 1500); // Increased delay
      }

    } catch (err) {
      debugLog('Initialization error', err);
      error.set('Failed to initialize connection. Please refresh the page.');
    } finally {
      initializationInProgress = false;
    }
  });

  onDestroy(() => {
    debugLog('Component destroying');
    componentMounted = false;
    initializationInProgress = false;
    hasJoinedThisSession = false;
    socketService.disconnect();
  });

  // ========================================
  // EVENT HANDLERS
  // ========================================
  function handlePrediction(prediction: number) {
    debugLog('Making prediction', { prediction, username: actualUsername });
    socketService.makePrediction(lobbyCode, prediction);
  }

  function handleCardPlay(cardIndex: number) {
    debugLog('Playing card', { cardIndex, username: actualUsername });
    socketService.playCard(lobbyCode, cardIndex);
  }

  function handleNextRound() {
    debugLog('Starting next round', { username: actualUsername });
    socketService.nextRound(lobbyCode);
  }

  function handleGameEnd() {
    debugLog('Ending game');
    socketService.clearSession();
    goto('/');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      showDebugInfo = !showDebugInfo;
      console.log('Debug info visibility toggled:', showDebugInfo);
    }
  }

  function startGame() {
    debugLog('Start game requested', { 
      lobbyCode,
      actualUsername,
      connectionStatus: $connectionStatus
    });
    
    if (!actualUsername) {
      error.set('Username not found. Please refresh the page.');
      return;
    }
    
    if ($connectionStatus !== 'connected') {
      error.set('Not connected to server. Please wait...');
      return;
    }
    
    socketService.startGame(lobbyCode);
  }

  function toggleChat() {
    showChat = !showChat;
    
    if (showChat) {
      setTimeout(() => {
        socketService.markMessagesAsRead(lobbyCode);
      }, 500);
    }
  }

  function handleReturnToLobby() {
    goto(`/lobby/${lobbyCode}`);
  }

  function handleGoToSetup() {
    goto('/onlinesetup');
  }

  function handleDismissError() {
    error.set(null);
  }
</script>

<svelte:window bind:innerWidth={windowWidth} on:keydown={handleKeydown} />



<!-- ========================================
     LOADING STATES
     ======================================== -->
{#if !initializationComplete}
  <div class="state-screen">
    <h2>Loading...</h2>
    <div class="spinner"></div>
    <p>Initializing game...</p>
  </div>

{:else if !actualUsername}
  <div class="state-screen">
    <h2>No Username Found</h2>
    <p>Please set up your username to continue</p>
    <button class="btn btn-primary" on:click={handleGoToSetup}>
      Go to Setup
    </button>
  </div>

{:else if $connectionStatus !== 'connected'}
  <div class="state-screen">
    {#if $isReconnecting}
      <h2>Reconnecting...</h2>
      <div class="spinner"></div>
      <p>Restoring session for: <strong>{actualUsername}</strong></p>
    {:else}
      <h2>Connecting...</h2>
      <div class="spinner"></div>
      <p>Username: <strong>{actualUsername}</strong></p>
    {/if}
  </div>

{:else if $error}
  <div class="state-screen error-screen">
    <h2>Error</h2>
    <p class="error-message">{$error}</p>
    <div class="button-group">
      <button class="btn btn-secondary" on:click={handleDismissError}>
        Dismiss
      </button>
      <button class="btn btn-primary" on:click={handleReturnToLobby}>
        Return to Lobby
      </button>
    </div>
  </div>

{:else if !$gameState}
  <div class="state-screen">
    {#if savedGameData?.gameState && savedGameData.lobbyCode === lobbyCode}
      <h2>Reconnecting to Game...</h2>
      <div class="spinner"></div>
      <p>Restoring session for: <strong>{actualUsername}</strong></p>
    {:else}
      <h2>Waiting for Game</h2>
      <div class="game-info">
        <p><strong>Lobby:</strong> {lobbyCode}</p>
        <p><strong>Username:</strong> {actualUsername}</p>
      </div>
      <div class="button-group">
        <button class="btn btn-primary" on:click={startGame}>
          Start Game
        </button>
        <button class="btn btn-secondary" on:click={handleReturnToLobby}>
          Return to Lobby
        </button>
      </div>
    {/if}
  </div>

<!-- ========================================
     MAIN GAME INTERFACE
     ======================================== -->
{:else}
  <!-- FIXED: Apply show-chat class conditionally -->
  <div class="game-container" class:show-chat={showChat}>
    <!-- Game Table Area -->
    <div class="game-area">
      <OnlineGameTable gameState={$gameState} {currentPlayer} />
    </div>

    <!-- Fixed Chat Panel (Desktop) -->
    {#if showChat && !isMobile}
      <div class="chat-area">
        <OnlineGameChat {lobbyCode} username={actualUsername} isVisible={showChat} />
      </div>
    {/if}

    <!-- Control Panel -->
    <div class="control-panel">
      <!-- Timer and Game Controls with Offline Styling -->
      <div class="controls-section">
        <OnlineGameTimer gameState={$gameState} {isPaused} />
        <OnlineGameControls 
          gameState={$gameState}
          {lobbyCode}
          currentUsername={actualUsername}
          {isAdmin}
          onReturnToLobby={handleReturnToLobby}
        />
      </div>

      <!-- Chat Toggle -->
      <button class="btn-chat" on:click={toggleChat}>
        <span class="chat-icon">💬</span>
        {showChat ? 'Hide Chat' : 'Show Chat'}
        
        {#if !showChat && $unreadMessageCount > 0}
          <span class="chat-badge">
            {$unreadMessageCount > 9 ? '9+' : $unreadMessageCount}
          </span>
        {/if}
      </button>

      <!-- Mini Scoreboard -->
      <div class="mini-scoreboard">
        <h4>Round {$gameState.currentRound} Scores</h4>
        <div class="scoreboard-content">
          {#each $gameState.players as player}
            <div class="score-row {currentPlayer?.id === player.id ? 'current-player' : ''}">
              <span class="player-name">{player.name}</span>
              <div class="score-details">
                <span class="score">{player.score}</span>
                <span class="prediction">{player.prediction !== null ? player.prediction : '?'}/{player.tricksWon}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Chat Panel -->
  {#if showChat && isMobile}
    <div class="mobile-chat-area">
      <OnlineGameChat {lobbyCode} username={actualUsername} isVisible={showChat} />
    </div>
  {/if}

  <!-- Debug Information -->
  {#if showDebugInfo}
    <div class="debug-info">
      <div class="debug-header">
        <strong>🐛 Debug Info</strong>
        <span class="debug-toggle-hint">(Press Tab to toggle)</span>
      </div>
      <div class="debug-section">
        <strong>Username Sources:</strong>
        <div class="debug-grid">
          <span>Stored: {$userStore?.username || 'null'}</span>
          <span>Lobby: {$lobby?.username || 'null'}</span>
          <span>Saved: {savedGameData?.username || 'null'}</span>
          <span>Socket: {socketService.getCurrentUserInfo()?.username || 'null'}</span>
        </div>
      </div>
      <div class="debug-section">
        <strong>State:</strong>
        <div class="debug-grid">
          <span>Actual Username: {actualUsername}</span>
          <span>Connection: {$connectionStatus}</span>
          <span>Phase: {$gameState?.phase || 'null'}</span>
          <span>My Player: {currentPlayer?.id || 'null'}</span>
          <span>Is My Turn: {$gameState?.players?.[$gameState?.currentPlayerIndex]?.id === actualUsername ? 'YES' : 'NO'}</span>
          <span>Is Admin: {isAdmin ? 'YES' : 'NO'}</span>
          <span>Is Paused: {isPaused ? 'YES' : 'NO'}</span>
          <span>Show Chat: {showChat ? 'YES' : 'NO'}</span>
          <span>Is Mobile: {isMobile ? 'YES' : 'NO'}</span>
        </div>
      </div>
      <div class="debug-section">
        <strong>Game Data:</strong>
        <div class="debug-grid">
          <span>Game ID: {$gameState?.id || 'null'}</span>
          <span>Round: {$gameState?.currentRound || 'null'}/{$gameState?.maxRounds || 'null'}</span>
          <span>Current Trick: {$gameState?.currentTrick?.length || 0} cards</span>
          <span>Trump: {$gameState?.trumpSuit || 'none'}</span>
          <span>Players: {$gameState?.players?.length || 0}</span>
          <span>Deck: {$gameState?.deck?.length || 0} cards</span>
        </div>
      </div>
    </div>
  {:else}
    <!-- ADDED: Hidden debug indicator -->
    <div class="debug-indicator">
      <span class="debug-hint">Press Tab for debug info</span>
    </div>
  {/if}

  <!-- Game Phase Interfaces -->
  {#if $gameState.phase === 'prediction'}
    <OnlineBiddingInterface 
      gameState={$gameState}
      {currentPlayer}
      onPrediction={handlePrediction}
    />
  {/if}

  {#if $gameState.phase === 'playing'}
    <OnlineCardPlayInterface 
      gameState={$gameState}
      {currentPlayer}
      onCardPlay={handleCardPlay}
    />
  {/if}

  {#if $gameState.phase === 'scoring'}
    <OnlineScoringInterface 
      gameState={$gameState}
      onNextRound={handleNextRound}
    />
  {/if}

  {#if $gameState.phase === 'finished'}
    <OnlineScoringInterface 
      gameState={$gameState}
      onNextRound={handleGameEnd}
    />
  {/if}
{/if}

<style>
  .game-container {
    display: grid;
    height: 100vh;
    gap: 1rem;
    padding: 1rem;
    transition: grid-template-columns 0.3s ease;
  }

  /* Desktop Layout */
  @media (min-width: 1024px) {
    .game-container {
      grid-template-columns: 1fr 300px; /* Default: game | controls */
      grid-template-areas: "game control";
    }

    /* FIXED: When chat is shown, add chat column */
    .game-container.show-chat {
      grid-template-columns: 1fr 300px 250px; /* game | controls | chat */
      grid-template-areas: "game control chat";
    }
  }

  /* Tablet Layout */
  @media (min-width: 768px) and (max-width: 1023px) {
    .game-container {
      grid-template-columns: 1fr 280px;
      grid-template-areas: "game control";
    }
  }

  /* Mobile Layout */
  @media (max-width: 767px) {
    .game-container {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
      grid-template-areas: 
        "game"
        "control";
      height: auto;
      min-height: 100vh;
    }
  }

  .game-area {
    grid-area: game;
    position: relative;
    min-height: 500px;
    overflow: hidden;
    background: linear-gradient(135deg, #065f46, #047857, #059669);
    border-radius: 1rem;
  }

  .chat-area {
    grid-area: chat;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .control-panel {
    grid-area: control;
    background: linear-gradient(135deg, #f8fafc, #e2e8f0);
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }

  .controls-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .btn-chat {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    border-radius: 0.75rem;
    padding: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .btn-chat:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.2);
  }

  .chat-icon {
    font-size: 1.25rem;
  }

  .chat-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ef4444;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    min-width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
  }

  .mini-scoreboard {
    background: white;
    border-radius: 0.75rem;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .mini-scoreboard h4 {
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.75rem 0;
    text-align: center;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .scoreboard-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .score-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .score-row:hover {
    background: #f3f4f6;
  }

  .score-row.current-player {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    border: 2px solid #3b82f6;
    font-weight: 600;
  }

  .player-name {
    flex: 1;
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
  }

  .score-details {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
  }

  .score {
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
  }

  .prediction {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .mobile-chat-area {
    margin: 1rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    max-height: 400px;
    overflow: hidden;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .control-panel {
      max-height: none;
      padding: 0.75rem;
    }
    
    .controls-section {
      gap: 0.75rem;
    }
    
    .mini-scoreboard {
      padding: 0.75rem;
    }
    
    .scoreboard-content {
      max-height: 150px;
    }
  }

  /* Animations */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Debug info styling update */
  .debug-info {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.95);
    color: white;
    padding: 1rem;
    border-radius: 0.75rem;
    font-size: 0.75rem;
    max-width: 400px;
    z-index: 1000;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(59, 130, 246, 0.3);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    animation: debugSlideIn 0.3s ease-out;
  }

  .debug-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(59, 130, 246, 0.3);
    font-size: 0.875rem;
  }

  .debug-toggle-hint {
    font-size: 0.625rem;
    color: #93c5fd;
    font-weight: normal;
  }

  .debug-section {
    margin-bottom: 0.75rem;
  }

  .debug-section:last-child {
    margin-bottom: 0;
  }

  .debug-section strong {
    color: #60a5fa;
    font-size: 0.8125rem;
  }

  .debug-grid {
    display: grid;
    gap: 0.375rem;
    margin-top: 0.375rem;
    font-size: 0.6875rem;
    opacity: 0.9;
    line-height: 1.3;
  }

  .debug-grid span {
    background: rgba(59, 130, 246, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  /* ADDED: Debug indicator when hidden */
  .debug-indicator {
    position: fixed;
    bottom: 10px;
    left: 10px;
    z-index: 1000;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  .debug-indicator:hover {
    opacity: 1;
  }

  .debug-hint {
    background: rgba(0, 0, 0, 0.8);
    color: #93c5fd;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  /* ADDED: Debug slide-in animation */
  @keyframes debugSlideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Loading screen styles */
  .state-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
  }

  .state-screen h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #1f2937;
  }

  .state-screen p {
    font-size: 1.125rem;
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 1rem auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-screen {
    background: #fef2f2;
  }

  .error-message {
    color: #dc2626 !important;
    font-weight: 600;
  }

  .game-info {
    background: #f8fafc;
    border-radius: 0.5rem;
    padding: 1rem;
    margin: 1rem 0;
  }

  .game-info p {
    margin: 0.5rem 0;
    color: #374151;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-block;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-secondary:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }
</style>