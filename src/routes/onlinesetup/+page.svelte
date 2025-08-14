<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { io, Socket } from 'socket.io-client';

    let username = '';
    let lobbyCode = '';
    let inputLobbyCode = '';
    let inLobby = false;
    let messages: { user: string; text: string }[] = [];
    let message = '';
    let socket: Socket | null = null;
    let error = '';

    const SOCKET_URL = 'http://localhost:3001'; // Change to your deployed URL if needed

    function generateLobbyCode() {
        // Simple random 6-letter code
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    function createLobby() {
        if (!username.trim()) {
            error = 'Bitte gib einen Benutzernamen ein.';
            return;
        }
        lobbyCode = generateLobbyCode();
        joinLobby();
    }

    function joinLobby() {
        if (!username.trim()) {
            error = 'Bitte gib einen Benutzernamen ein.';
            return;
        }
        if (!lobbyCode.trim()) {
            error = 'Bitte gib einen Lobby-Code ein.';
            return;
        }
        error = '';
        inLobby = true;
        messages = [];
        if (!socket) {
            socket = io(SOCKET_URL);
            socket.on('lobby message', (msg) => {
                messages = [...messages, msg];
            });
        }
        socket.emit('join lobby', { lobbyCode, user: username });
    }

    function joinWithCode() {
        lobbyCode = inputLobbyCode.trim().toUpperCase();
        joinLobby();
    }

    function send() {
        if (message.trim() && socket && lobbyCode) {
            socket.emit('lobby message', { lobbyCode, user: username, text: message });
            message = '';
        }
    }

    onDestroy(() => {
        socket?.disconnect();
    });
</script>

{#if !inLobby}
    <div class="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
        <h2 class="text-lg font-semibold mb-4">Online Lobby erstellen oder beitreten</h2>
        <input bind:value={username} placeholder="Benutzername" class="w-full border p-2 rounded mb-2" />
        <div class="flex gap-2 mb-4">
            <button on:click={createLobby} class="flex-1 bg-blue-600 text-white px-4 py-2 rounded">
                Lobby erstellen
            </button>
            <input bind:value={inputLobbyCode} placeholder="Lobby-Code" class="border p-2 rounded flex-1" />
            <button on:click={joinWithCode} class="bg-green-600 text-white px-4 py-2 rounded">
                Beitreten
            </button>
        </div>
        {#if error}
            <p class="text-red-600">{error}</p>
        {/if}
    </div>
{:else}
    <div class="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
        <h2 class="text-lg font-semibold mb-2">Lobby: {lobbyCode}</h2>
        <p class="mb-4">Teile diesen Code mit Freunden, damit sie beitreten können!</p>
        <div class="bg-gray-100 h-48 rounded p-4 mb-4 overflow-y-auto text-left">
            {#each messages as m}
                <p><strong>{m.user}:</strong> {m.text}</p>
            {/each}
            {#if messages.length === 0}
                <p class="text-gray-700 italic">Noch keine Nachrichten.</p>
            {/if}
        </div>
        <div class="flex gap-2">
            <textarea
                class="flex-1 border rounded p-2 resize-none"
                rows="2"
                placeholder="Nachricht schreiben..."
                bind:value={message}
                on:keydown={(e) => e.key === 'Enter' && !e.shiftKey && (send(), e.preventDefault())}
            ></textarea>
            <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" on:click={send} disabled={!message.trim()}>
                Senden
            </button>
        </div>
    </div>
{/if}