<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { lobby, type LobbyInfo } from '$lib/stores/lobby';
    import { userStore } from '$lib/stores/user';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { io, type Socket } from 'socket.io-client';
    import { get } from 'svelte/store';
    import Popup from '$lib/components/Popup.svelte';
    import { browser } from '$app/environment';

    let socket: Socket | null = null;
    let users: string[] = [];
    let admin: string | null = null;
    let messages: { user: string; text: string }[] = [];
    let message = '';
    let error = '';
    let showPopup = false;
    let popupMessage = '';
    let popupOnClose: () => void = () => { showPopup = false; };
    let gameStarted = false;
    let isNavigating = false;
    let componentMounted = false;
    let connectionInitialized = false;
    let socketConnecting = false;


    const MAX_PLAYERS = 6;
    const MIN_PLAYERS = 3;
    const SOCKET_URL = 'http://10.244.144.199:3001';

    let lobbyInfo: LobbyInfo | null = get(lobby);

    // Debug logging
    function debugLog(message: string, data?: any) {
        const timestamp = new Date().toISOString();
        if (data) {
            console.log(`[LOBBY ${timestamp}] ${message}:`, data);
        } else {
            console.log(`[LOBBY ${timestamp}] ${message}`);
        }
    }

    // Load lobby info from storage if not in store
    if (typeof window !== 'undefined' && !lobbyInfo) {
        const stored = localStorage.getItem('lobby');
        if (stored) {
            try {
                lobbyInfo = JSON.parse(stored);
                lobby.set(lobbyInfo);
                debugLog('Loaded lobby info from localStorage', lobbyInfo);
            } catch (e) {
                debugLog('Failed to parse stored lobby info', e);
            }
        }
    }

    // Sync username with user store
    $: if (lobbyInfo?.username) {
        userStore.set({ username: lobbyInfo.username });
    }

    // Redirect if lobby info is invalid
    $: if (!lobbyInfo || $page.params.code !== lobbyInfo.lobbyCode) {
        if (browser && !isNavigating && componentMounted) {
            debugLog('Invalid lobby info, redirecting to setup', { 
                lobbyInfo, 
                pageCode: $page.params.code 
            });
            isNavigating = true;
            goto('/onlinesetup');
        }
    }

    onMount(() => {
        if (componentMounted) {
            debugLog('Component already mounted, skipping initialization');
            return;
        }
        
        componentMounted = true;
        debugLog('Lobby component mounted', { lobbyInfo });

        if (!lobbyInfo) {
            debugLog('No lobby info available');
            return;
        }

        initializeSocket();
    });

    function initializeSocket() {
    if (connectionInitialized || !lobbyInfo) {
      debugLog('Socket already initialized or no lobby info');
      return;
    }

    socketConnecting = true;
    connectionInitialized = true;
    debugLog('Initializing socket connection', { lobbyCode: lobbyInfo.lobbyCode });

    if (socket) {
      debugLog('Cleaning up existing socket');
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    // ADDED: Small delay to ensure cleanup is complete
    setTimeout(() => {
      createNewSocket();
    }, 200);
  }

  // ADDED: Separate function for socket creation
  function createNewSocket() {
    if (!lobbyInfo) {
      socketConnecting = false;
      return;
    }

    try {
      socket = io(SOCKET_URL, {
        forceNew: true,
        timeout: 5000,
        reconnection: false
      });

      socket.on('connect', () => {
        debugLog('Connected to server', { socketId: socket?.id });
        socketConnecting = false; // ADDED: Clear connecting flag
        
        // Join lobby after a short delay
        setTimeout(() => {
          if (lobbyInfo && !gameStarted && !isNavigating && socket?.connected) {
            debugLog('Joining lobby', { 
              lobbyCode: lobbyInfo.lobbyCode, 
              username: lobbyInfo.username 
            });
            socket.emit('join lobby', { 
              lobbyCode: lobbyInfo.lobbyCode, 
              user: lobbyInfo.username 
            });
          }
        }, 100);
      });

      socket.on('connect_error', (err) => {
        debugLog('Connection error', err);
        socketConnecting = false;
        error = 'Failed to connect to server. Please try again.';
      });

      socket.on('disconnect', (reason) => {
        debugLog('Disconnected from server', { reason });
        if (reason !== 'io client disconnect') {
          error = 'Connection lost. Please refresh the page or try again.';
        }
      });

      // ADDED: All the missing event handlers
      socket.on('game started', (gameState) => {
        debugLog('Game started event received', { 
          gameId: gameState?.id, 
          gameStarted, 
          isNavigating 
        });
        
        if (gameStarted || isNavigating) {
          debugLog('Game already started or navigation in progress, ignoring');
          return;
        }
        
        gameStarted = true;
        isNavigating = true;
        
        debugLog('Navigating to game page');
        if (browser && lobbyInfo) {
          goto(`/onlinegame/${lobbyInfo.lobbyCode}`);
        }
      });
          
      // ADDED: Lobby event handlers
      socket.on('lobby users', ({ users: userList, admin: adminUser }) => {
        debugLog('Lobby users updated', { users: userList, admin: adminUser });
        users = userList;
        admin = adminUser;
      });

      socket.on('lobby message', (msg) => {
        debugLog('Lobby message received', msg);
        messages = [...messages, msg];
      });

      socket.on('removed from lobby', ({ message: removeMessage }) => {
        debugLog('Removed from lobby', { message: removeMessage });
        
        popupMessage = removeMessage;
        showPopup = true;

        popupOnClose = () => {
          showPopup = false;
          isNavigating = true;
          if (browser) {
            goto('/onlinesetup');
          }
        };
      });

      socket.on('error', (errorMessage) => {
        debugLog('Server error', errorMessage);
        error = typeof errorMessage === 'string' ? errorMessage : 'An error occurred';
      });

    } catch (err) {
      debugLog('Failed to initialize socket', err);
      socketConnecting = false; // ADDED: Clear connecting flag
      error = 'Failed to initialize connection';
    }
  }

    function send() {
        if (message.trim() && socket && lobbyInfo && socket.connected) {
            debugLog('Sending message', { message, user: lobbyInfo.username });
            socket.emit('lobby message', { 
                lobbyCode: lobbyInfo.lobbyCode, 
                user: lobbyInfo.username, 
                text: message 
            });
            message = '';
        }
    }

    function removeUser(user: string) {
        if (socket && lobbyInfo && socket.connected) {
            debugLog('Removing user', { user });
            socket.emit('remove user', { 
                lobbyCode: lobbyInfo.lobbyCode, 
                user 
            });
        }
    }

    function startGame() {
        if (!socket || !lobbyInfo || !socket.connected) {
            debugLog('Cannot start game: not connected');
            error = 'Not connected to server';
            return;
        }

        if (users.length < MIN_PLAYERS) {
            debugLog('Cannot start game: not enough players', { 
                current: users.length, 
                required: MIN_PLAYERS 
            });
            error = `Need at least ${MIN_PLAYERS} players to start`;
            return;
        }

        debugLog('Starting game', { 
            lobbyCode: lobbyInfo.lobbyCode, 
            username: lobbyInfo.username 
        });
        
        socket.emit('start game', { 
            lobbyCode: lobbyInfo.lobbyCode,
            username: lobbyInfo.username 
        });
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    function clearError() {
        error = '';
    }

    onDestroy(() => {
        debugLog('Lobby component destroying', { 
            gameStarted, 
            isNavigating,
            hasSocket: !!socket 
        });
        
        componentMounted = false;
        connectionInitialized = false;
        
        // Only emit leave lobby if we're not navigating to game and game hasn't started
        if (socket && lobbyInfo && !gameStarted && !isNavigating) {
            debugLog('Leaving lobby on destroy');
            socket.emit('leave lobby', { 
                lobbyCode: lobbyInfo.lobbyCode, 
                user: lobbyInfo.username 
            });
        }
        
        if (socket) {
            debugLog('Disconnecting socket');
            socket.removeAllListeners();
            socket.disconnect();
            socket = null;
        }
    });
</script>

<svelte:head>
    <title>Lobby {lobbyInfo?.lobbyCode || ''} - Wizard Game</title>
</svelte:head>

{#if error}
    <div class="max-w-md mx-auto mt-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <div class="flex justify-between items-center">
            <span>{error}</span>
            <button on:click={clearError} class="text-red-700 hover:text-red-900">×</button>
        </div>
    </div>
{/if}

{#if lobbyInfo}
    <div class="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg border-2 border-gray-200">
        <!-- Lobby Header -->
        <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                Lobby: <span class="text-blue-600">{lobbyInfo.lobbyCode}</span>
            </h2>
            <p class="text-gray-600">Share this code with friends to join!</p>
        </div>

        <!-- Connection Status -->
        <div class="mb-4 text-center">
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {socket?.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                <div class="w-2 h-2 rounded-full mr-2 {socket?.connected ? 'bg-green-400' : 'bg-red-400'}"></div>
                {socket?.connected ? 'Connected' : 'Disconnected'}
            </div>
        </div>
        
        <!-- Players List -->
        <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-3">
                Players ({users.length}/{MAX_PLAYERS}):
            </h3>
            <div class="space-y-2">
                {#each users as user, i}
                    <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div class="flex items-center">
                            <span class="text-sm font-medium text-gray-600 mr-2">#{i + 1}</span>
                            <span class="font-semibold text-gray-800">{user}</span>
                            {#if admin === user}
                                <span class="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                    Admin
                                </span>
                            {/if}
                        </div>
                        
                        {#if admin === lobbyInfo.username && user !== lobbyInfo.username}
                            <button 
                                on:click={() => removeUser(user)} 
                                class="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                                disabled={!socket?.connected}
                            >
                                Remove
                            </button>
                        {/if}
                    </div>
                {/each}
                
                {#if users.length === 0}
                    <div class="text-center text-gray-500 py-4">
                        <p>Waiting for players to join...</p>
                    </div>
                {/if}
            </div>
        </div>
        
        <!-- Start Game Button (Admin Only) -->
        {#if admin === lobbyInfo.username}
            <div class="mb-6">
                <button 
                    on:click={startGame} 
                    class="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={users.length < MIN_PLAYERS || !socket?.connected || gameStarted}
                >
                    {#if gameStarted}
                        Starting Game...
                    {:else if users.length < MIN_PLAYERS}
                        Need {MIN_PLAYERS - users.length} more player{MIN_PLAYERS - users.length !== 1 ? 's' : ''}
                    {:else}
                        Start Game
                    {/if}
                </button>
            </div>
        {:else}
            <div class="mb-6 text-center">
                <p class="text-gray-600">Waiting for <strong>{admin}</strong> to start the game...</p>
            </div>
        {/if}
        
        <!-- Chat Section -->
        <div class="border-t pt-4">
            <h3 class="font-semibold text-gray-700 mb-3">Chat</h3>
            
            <!-- Messages -->
            <div class="bg-gray-100 h-48 rounded-lg p-4 mb-4 overflow-y-auto text-left space-y-2">
                {#each messages as msg}
                    <div class="break-words">
                        <span class="font-semibold text-blue-600">{msg.user}:</span>
                        <span class="text-gray-800">{msg.text}</span>
                    </div>
                {/each}
                
                {#if messages.length === 0}
                    <div class="text-center text-gray-500 h-full flex items-center justify-center">
                        <p class="italic">No messages yet. Start the conversation!</p>
                    </div>
                {/if}
            </div>
            
            <!-- Message Input -->
            <div class="flex gap-2">
                <input
                    type="text"
                    class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder={socket?.connected ? "Type a message..." : "Connecting..."}
                    bind:value={message}
                    on:keydown={handleKeydown}
                    disabled={!socket?.connected}
                />
                <button 
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                    on:click={send} 
                    disabled={!message.trim() || !socket?.connected}
                >
                    Send
                </button>
            </div>
        </div>

        <!-- Footer Info -->
        <div class="mt-4 pt-4 border-t text-center text-sm text-gray-500">
            <p>Your username: <strong>{lobbyInfo.username}</strong></p>
        </div>
    </div>
{:else}
    <div class="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Loading Lobby...</h2>
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
    </div>
{/if}

{#if showPopup}
    <Popup message={popupMessage} onClose={popupOnClose} />
{/if}

<style>
    /* Custom scrollbar for chat */
    .overflow-y-auto::-webkit-scrollbar {
        width: 4px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
    }
</style>