<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { 
    socketService, 
    gameState, 
    connectionStatus, 
    error,
    type Player 
  } from '$lib/stores/socket';
  import { userStore } from '$lib/stores/user';
  import { lobby } from '$lib/stores/lobby';
  import { goto } from '$app/navigation';
  import OnlineGameTable from '../components/OnlineGameTable.svelte';
  import OnlineBiddingInterface from '../components/OnlineBiddingInterface.svelte';
  import OnlineCardPlayInterface from '../components/OnlineCardPlayInterface.svelte';
  import OnlineScoringInterface from '../components/OnlineScoringInterface.svelte';
  import OnlineScoreBoard from '../components/OnlineScoreBoard.svelte';
  import OnlineGameChat from '../components/OnlineGameChat.svelte';

  const lobbyCode = $page.params.code ?? '';
  let currentPlayer: Player | null = null;

  $: username = $userStore?.username || $lobby?.username;

  $: if ($gameState && username) {
    currentPlayer = $gameState.players.find(p => p.id === username) || null;
  }

  onMount(() => {
    if (!username) {
      goto('/onlinesetup');
      return;
    }

    socketService.connect();
    
    setTimeout(() => {
      socketService.joinLobby(lobbyCode, username);
      socketService.joinGame(lobbyCode);
    }, 500);
  });

  onDestroy(() => {
    socketService.disconnect();
  });

  function handlePrediction(prediction: number) {
    socketService.makePrediction(lobbyCode, prediction);
  }

  function handleCardPlay(cardIndex: number) {
    socketService.playCard(lobbyCode, cardIndex);
  }

  function handleNextRound() {
    socketService.nextRound(lobbyCode);
  }

  function startGame() {
    socketService.startGame(lobbyCode);
  }
</script>

{#if !username}
  <div class="waiting">
    <h2>No username found</h2>
    <button on:click={() => goto('/onlinesetup')}>Go to Setup</button>
  </div>
{:else if $connectionStatus !== 'connected'}
  <div class="waiting">
    <h2>Connecting to server...</h2>
  </div>
{:else if $error}
  <div class="error">
    <h2>Error: {$error}</h2>
    <button on:click={() => error.set(null)}>Dismiss</button>
    <button on:click={() => goto(`/lobby/${lobbyCode}`)}>Return to Lobby</button>
  </div>
{:else if !$gameState}
  <div class="waiting">
    <h2>Waiting for game...</h2>
    <p>Lobby: {lobbyCode}</p>
    <p>Username: {username}</p>
    <button on:click={startGame}>Start Game</button>
    <button on:click={() => goto(`/lobby/${lobbyCode}`)}>Return to Lobby</button>
  </div>
{:else}
  <div class="game-container">
    <OnlineScoreBoard players={$gameState.players} {currentPlayer} />
    <OnlineGameTable gameState={$gameState} {currentPlayer} />
    <OnlineGameChat {lobbyCode} {username} />
  </div>

  <!-- Game Interfaces -->
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
{/if}

<style>
  .game-container {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 1rem;
    height: 100vh;
    padding: 1rem;
  }
  
  .waiting, .error {
    text-align: center;
    padding: 2rem;
  }

  .error {
    color: red;
  }
</style>