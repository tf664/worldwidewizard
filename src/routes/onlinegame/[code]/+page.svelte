<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { socketService, gameState, connectionStatus, error, isReconnecting, unreadMessageCount, type Player } from '$lib/stores/socket';
  import { userStore } from '$lib/stores/user';
  import { lobby } from '$lib/stores/lobby';
  import { goto } from '$app/navigation';
  import OnlineGameTable from '../components/OnlineGameTable.svelte';
  import OnlineBiddingInterface from '../components/OnlineBiddingInterface.svelte';
  import OnlineCardPlayInterface from '../components/OnlineCardPlayInterface.svelte';
  import OnlineScoringInterface from '../components/OnlineScoringInterface.svelte';
  import OnlineScoreBoard from '../components/OnlineScoreBoard.svelte';
  import OnlineGameChat from '../components/OnlineGameChat.svelte';
  import OnlineGameControls from '../components/OnlineGameControls.svelte';
  import OnlineGameTimer from '../components/OnlineGameTimer.svelte';

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

      // Step 2: Wait for stores to settle
      await new Promise(resolve => setTimeout(resolve, 300));

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

      // Step 7: Reset and connect
      debugLog('Initiating socket connection', { lobbyCode, actualUsername });
      socketService.reset();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await socketService.connect(lobbyCode, actualUsername);
      
      // Step 8: Join lobby and game
      if (socketService.isConnected()) {
        debugLog('Connected, now joining lobby and game', { lobbyCode, actualUsername });
        
        socketService.joinLobby(lobbyCode, actualUsername);
        
        setTimeout(() => {
          socketService.joinGame(lobbyCode);
          socketService.saveSession(lobbyCode, actualUsername);
          debugLog('Joined lobby and game');
          
          // Initialize chat
          setTimeout(() => {
            socketService.initializeChatData(lobbyCode);
          }, 500);
        }, 1000);
      }

    } catch (err) {
      debugLog('Initialization error', err);
      error.set('Failed to initialize connection');
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
  <!-- Game Container -->
  <div class="game-container">
    <!-- Scoreboard -->
    <div class="scoreboard-section">
      <OnlineScoreBoard players={$gameState.players} {currentPlayer} />
    </div>
    
    <!-- Game Table -->
    <div class="game-area">
      <OnlineGameTable gameState={$gameState} {currentPlayer} />
    </div>

    <!-- Control Panel -->
    <div class="control-panel">
      <!-- Timer -->
      <OnlineGameTimer gameState={$gameState} {isPaused} />
      
      <!-- Game Controls -->
      <OnlineGameControls 
        gameState={$gameState}
        {lobbyCode}
        currentUsername={actualUsername}
        {isAdmin}
        onReturnToLobby={handleReturnToLobby}
      />

      <!-- Chat Toggle -->
      <button class="btn btn-chat relative" on:click={toggleChat}>
        {showChat ? 'Hide' : 'Show'} Chat
        
        {#if !showChat && $unreadMessageCount > 0}
          <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            {$unreadMessageCount > 9 ? '9+' : $unreadMessageCount}
          </span>
        {/if}
      </button>
    </div>
  </div>

  <!-- Floating Chat Panel -->
  {#if showChat}
    <div class="chat-panel">
      <OnlineGameChat {lobbyCode} username={actualUsername} isVisible={showChat} />
    </div>
  {/if}

  <!-- Debug Information -->
  <div class="debug-info">
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
        <span>Phase: {$gameState.phase}</span>
        <span>My Player: {currentPlayer?.id || 'null'}</span>
        <span>Is My Turn: {$gameState.players[$gameState.currentPlayerIndex]?.id === actualUsername ? 'YES' : 'NO'}</span>
        <span>Is Admin: {isAdmin ? 'YES' : 'NO'}</span>
        <span>Is Paused: {isPaused ? 'YES' : 'NO'}</span>
      </div>
    </div>
  </div>

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
    grid-template-columns: 1fr 300px;
    grid-template-rows: auto 1fr;
    grid-template-areas: 
      "scoreboard control"
      "game control";
    height: calc(100vh - 120px);
    gap: 1rem;
    padding: 1rem;
  }

  .scoreboard-section {
    grid-area: scoreboard;
  }

  .game-area {
    grid-area: game;
    position: relative;
    min-height: 600px;
  }

  .control-panel {
    grid-area: control;
    background: #f8fafc;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .state-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    margin: 2rem auto;
    max-width: 500px;
  }

  .error-screen {
    background: #fef2f2;
    border: 2px solid #fca5a5;
    border-radius: 0.5rem;
  }

  .error-message {
    color: #dc2626;
    font-weight: 600;
    margin: 1rem 0;
  }

  .game-info {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
    border: 1px solid #e2e8f0;
  }

  .game-info p {
    margin: 0.5rem 0;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-size: 1rem;
  }

  .btn-primary {
    background-color: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background-color: #2563eb;
  }

  .btn-secondary {
    background-color: #6b7280;
    color: white;
  }

  .btn-secondary:hover {
    background-color: #4b5563;
  }

  .btn-chat {
    background-color: #3b82f6;
    color: white;
    position: relative;
  }

  .btn-chat:hover {
    background-color: #2563eb;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .chat-panel {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    height: 500px;
    z-index: 40;
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 1rem auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .debug-info {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    max-width: 350px;
    z-index: 1000;
  }

  .debug-section {
    margin-bottom: 0.5rem;
  }

  .debug-section:last-child {
    margin-bottom: 0;
  }

  .debug-grid {
    display: grid;
    gap: 0.25rem;
    margin-top: 0.25rem;
    font-size: 0.625rem;
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    .game-container {
      grid-template-columns: 1fr;
      grid-template-areas: 
        "scoreboard"
        "control"
        "game";
      height: auto;
      min-height: calc(100vh - 120px);
    }
    
    .chat-panel {
      position: fixed;
      bottom: 10px;
      right: 10px;
      left: 10px;
      width: auto;
      height: 300px;
    }

    .button-group {
      flex-direction: column;
    }

    .debug-info {
      position: relative;
      margin: 1rem 0;
      max-width: none;
    }
  }
</style>