<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { socketService, chatMessages, unreadMessageCount, type StoredLobbyMessage } from '$lib/stores/socket';

    export let lobbyCode: string;
    export let username: string;
    export let isVisible: boolean = true;

    let messages: StoredLobbyMessage[] = [];
    let message = '';
    let chatContainer: HTMLDivElement;
    let messageUnsubscribe: (() => void) | null = null;
    let chatUnsubscribe: (() => void) | null = null;
    let isInitialized = false;

    onMount(() => {
        console.log('Chat component mounted', { 
            lobbyCode, 
            username, 
            isConnected: socketService.isConnected(),
            isVisible
        });

        // Initialize chat data from storage FIRST
        setTimeout(() => {
            const chatState = socketService.initializeChatData(lobbyCode);
            messages = [...chatState.messages]; // Create a new array reference
            isInitialized = true;
            
            console.log('Chat initialized with messages:', {
                messageCount: messages.length,
                messages: messages.map(m => ({ user: m.user, text: m.text }))
            });
        }, 100);

        // Subscribe to chat messages store with proper handling
        chatUnsubscribe = chatMessages.subscribe((newMessages) => {
            if (isInitialized) {
                console.log('Chat store updated:', {
                    oldCount: messages.length,
                    newCount: newMessages.length,
                    newMessages: newMessages.map(m => ({ user: m.user, text: m.text }))
                });
                
                // Always update with new array reference
                messages = [...newMessages];
                
                // Auto-scroll to bottom when new messages arrive
                setTimeout(() => {
                    if (chatContainer) {
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                }, 100);
            }
        });

        // Subscribe to real-time lobby messages
        messageUnsubscribe = socketService.onLobbyMessage((msg) => {
            console.log('Received real-time chat message:', msg);
            // The socket service will handle updating the store, 
            // which will trigger the chatMessages subscription above
        });

        console.log('Chat component subscribed to messages');
    });

    onDestroy(() => {
        console.log('Chat component destroyed, cleaning up');
        if (messageUnsubscribe) {
            messageUnsubscribe();
            messageUnsubscribe = null;
        }
        if (chatUnsubscribe) {
            chatUnsubscribe();
            chatUnsubscribe = null;
        }
    });

    // Watch for visibility changes to mark messages as read
    $: if (isVisible && messages.length > 0 && isInitialized) {
        // Mark messages as read when chat becomes visible
        setTimeout(() => {
            socketService.markMessagesAsRead(lobbyCode);
        }, 500);
    }

    function send() {
        if (message.trim()) {
            console.log('Sending chat message:', { lobbyCode, username, message });
            
            if (!socketService.isConnected()) {
                console.warn('Cannot send message: socket not connected');
                return;
            }

            socketService.sendLobbyMessage(lobbyCode, username, message);
            message = '';
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    function formatTime(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Debug connection status
    $: connectionStatus = socketService.getConnectionStatus();
</script>

<div class="bg-white rounded-lg shadow-lg p-4 h-96 flex flex-col">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">Game Chat</h3>
        <div class="flex items-center gap-2">
            <div class="text-xs {connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}">
                {connectionStatus === 'connected' ? '● Connected' : '● Disconnected'}
            </div>
            {#if isInitialized}
                <div class="text-xs text-gray-500">
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                </div>
            {/if}
        </div>
    </div>
    
    <!-- Chat Messages -->
    <div 
        bind:this={chatContainer}
        class="bg-gray-100 flex-1 rounded p-3 mb-4 overflow-y-auto text-left"
    >
        {#if isInitialized}
            {#each messages as m (m.id)}
                <div class="mb-2 {m.user === username ? 'text-right' : 'text-left'}">
                    <div class="inline-block max-w-xs break-words">
                        <div class="text-xs text-gray-500 mb-1 flex items-center gap-2">
                            <span>{m.user === username ? 'You' : m.user}</span>
                            <span class="opacity-75">{formatTime(m.timestamp)}</span>
                            {#if !m.read && m.user !== username}
                                <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                            {/if}
                        </div>
                        <div class="bg-white rounded-lg px-3 py-2 shadow-sm {m.user === username ? 'bg-blue-100' : 'bg-gray-50'} {!m.read && m.user !== username ? 'ring-2 ring-blue-200' : ''}">
                            {m.text}
                        </div>
                    </div>
                </div>
            {/each}
            
            {#if messages.length === 0}
                <p class="text-gray-700 italic text-center">No messages yet. Start the conversation!</p>
            {/if}
        {:else}
            <div class="flex items-center justify-center h-full">
                <div class="text-gray-500 text-sm">Loading chat...</div>
            </div>
        {/if}
    </div>
    
    <!-- Message Input -->
    <div class="flex gap-2">
        <input
            type="text"
            class="flex-1 border rounded p-2 {connectionStatus !== 'connected' ? 'bg-gray-100' : ''}"
            placeholder={connectionStatus === 'connected' ? "Type a message..." : "Connecting..."}
            bind:value={message}
            on:keydown={handleKeydown}
            disabled={!isInitialized || connectionStatus !== 'connected'}
        />
        <button 
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" 
            on:click={send} 
            disabled={!message.trim() || !isInitialized || connectionStatus !== 'connected'}
        >
            Send
        </button>
    </div>

    <!-- Debug info (remove in production) -->
    {#if connectionStatus !== 'connected'}
        <div class="text-xs text-gray-500 mt-2 text-center">
            Status: {connectionStatus}
        </div>
    {/if}
    
    <!-- Debug message count -->
    <div class="text-xs text-gray-400 mt-1 text-center">
        Debug: {messages.length} messages loaded, initialized: {isInitialized}
    </div>
</div>