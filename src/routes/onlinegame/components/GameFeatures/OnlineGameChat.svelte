<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { socketService, chatMessages, type StoredLobbyMessage } from '$lib/stores/socket';

    export let lobbyCode: string;
    export let username: string;
    export let isVisible: boolean = true;

    let messages: StoredLobbyMessage[] = [];
    let message = '';
    let chatContainer: HTMLDivElement;
    let unsubscribe: (() => void) | null = null;

    onMount(() => {
        // Initialize chat and subscribe to messages
        socketService.initializeChatData(lobbyCode);
        
        unsubscribe = chatMessages.subscribe((newMessages) => {
            messages = newMessages;
            // Auto-scroll to bottom
            setTimeout(() => {
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }, 50);
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    // Mark messages as read when chat becomes visible
    $: if (isVisible && messages.length > 0) {
        setTimeout(() => socketService.markMessagesAsRead(lobbyCode), 500);
    }

    function send() {
        if (message.trim() && socketService.isConnected()) {
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
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    $: isConnected = socketService.isConnected();
</script>

<div class="chat-container">
    <!-- Header -->
    <div class="chat-header">
        <h3>Game Chat</h3>
        <div class="status {isConnected ? 'connected' : 'disconnected'}">
            <div class="status-dot"></div>
            {isConnected ? 'Connected' : 'Disconnected'}
        </div>
    </div>
    
    <!-- Messages -->
    <div class="messages" bind:this={chatContainer}>
        {#each messages as msg (msg.id)}
            <div class="message {msg.user === username ? 'own' : 'other'}">
                <div class="message-header">
                    <span class="user">{msg.user === username ? 'You' : msg.user}</span>
                    <span class="time">{formatTime(msg.timestamp)}</span>
                </div>
                <div class="text">{msg.text}</div>
            </div>
        {/each}
        
        {#if messages.length === 0}
            <div class="empty">No messages yet. Start the conversation!</div>
        {/if}
    </div>
    
    <!-- Input -->
    <div class="input-container">
        <input
            type="text"
            class="message-input"
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            bind:value={message}
            on:keydown={handleKeydown}
            disabled={!isConnected}
        />
        <button 
            class="send-btn" 
            on:click={send} 
            disabled={!message.trim() || !isConnected}
        >
            Send
        </button>
    </div>
</div>

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        max-height: 300px;
        background: white;
        border-radius: 1rem;
        overflow: hidden;
    }

    .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f8fafc;
        border-bottom: 1px solid #e5e7eb;
        flex-shrink: 0; /* Prevent header from shrinking */
        min-height: 60px; /* Set consistent header height */
    }

    .chat-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 700;
        color: #1f2937;
    }

    .status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .status.connected {
        color: #059669;
    }

    .status.disconnected {
        color: #dc2626;
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        animation: pulse 2s infinite;
    }

    .messages {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        background: #f9fafb;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-height: 120px; /* Reduced chat area height */
        min-height: 80px;
    }

    .message {
        display: flex;
        flex-direction: column;
        max-width: 80%;
    }

    .message.own {
        align-self: flex-end;
    }

    .message.other {
        align-self: flex-start;
    }

    .message-header {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
        font-size: 0.75rem;
        color: #6b7280;
    }

    .user {
        font-weight: 600;
    }

    .text {
        padding: 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        word-wrap: break-word;
    }

    .message.own .text {
        background: #3b82f6;
        color: white;
        border-bottom-right-radius: 0.25rem;
    }

    .message.other .text {
        background: white;
        color: #374151;
        border: 1px solid #e5e7eb;
        border-bottom-left-radius: 0.25rem;
    }

    .empty {
        text-align: center;
        color: #6b7280;
        font-style: italic;
        padding: 2rem;
    }

    .input-container {
        display: flex;
        gap: 0.75rem;
        padding: 1rem;
        background: white;
        border-top: 1px solid #e5e7eb;
        flex-shrink: 0; /* Prevent input area from shrinking */
        min-height: 60px; /* Match header height for consistency */
    }

    .message-input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        outline: none;
    }

    .message-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .message-input:disabled {
        background: #f9fafb;
        color: #9ca3af;
    }

    .send-btn {
        padding: 0.75rem 1.25rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }

    .send-btn:hover:not(:disabled) {
        background: #2563eb;
    }

    .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Scrollbar */
    .messages::-webkit-scrollbar {
        width: 4px;
    }

    .messages::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 2px;
    }

    /* Animations */
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    /* Mobile */
    @media (max-width: 768px) {
        .chat-container {
            max-height: 250px; /* ADDED: Smaller max height on mobile */
        }

        .chat-header {
            padding: 0.75rem;
            min-height: 50px; /* Smaller header on mobile */
        }

        .messages {
            max-height: 100px; /* Smaller on mobile */
            min-height: 60px;
            padding: 0.75rem;
            gap: 0.5rem;
        }

        .input-container {
            padding: 0.75rem;
            gap: 0.5rem;
            min-height: 50px; /* Match mobile header height */
        }

        .send-btn {
            padding: 0.75rem 1rem;
        }
    }
</style>