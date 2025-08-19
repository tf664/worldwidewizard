<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { io, type Socket } from 'socket.io-client';

    export let lobbyCode: string;
    export let username: string;

    let socket: Socket | null = null;
    let messages: { user: string; text: string }[] = [];
    let message = '';
    let chatContainer: HTMLDivElement;

    onMount(() => {
        socket = io('http://localhost:3001');
        socket.emit('join lobby', { lobbyCode, user: username });

        socket.on('lobby message', (msg) => {
            messages = [...messages, msg];
            // Auto-scroll to bottom
            setTimeout(() => {
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }, 100);
        });
    });

    onDestroy(() => {
        if (socket) {
            socket.disconnect();
        }
    });

    function send() {
        if (message.trim() && socket) {
            socket.emit('lobby message', { lobbyCode, user: username, text: message });
            message = '';
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }
</script>

<div class="bg-white rounded-lg shadow-lg p-4 h-96 flex flex-col">
    <h3 class="text-lg font-bold mb-4 text-center">Game Chat</h3>
    
    <!-- Chat Messages -->
    <div 
        bind:this={chatContainer}
        class="bg-gray-100 flex-1 rounded p-3 mb-4 overflow-y-auto text-left"
    >
        {#each messages as m}
            <p class="mb-1">
                <strong class="text-blue-600">{m.user}:</strong> 
                <span>{m.text}</span>
            </p>
        {/each}
        {#if messages.length === 0}
            <p class="text-gray-700 italic">No messages yet. Start the conversation!</p>
        {/if}
    </div>
    
    <!-- Message Input -->
    <div class="flex gap-2">
        <input
            type="text"
            class="flex-1 border rounded p-2"
            placeholder="Type a message..."
            bind:value={message}
            on:keydown={handleKeydown}
        />
        <button 
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" 
            on:click={send} 
            disabled={!message.trim()}
        >
            Send
        </button>
    </div>
</div>