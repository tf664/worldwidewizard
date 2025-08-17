<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { lobby, type LobbyInfo} from '$lib/stores/lobby';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { io, Socket } from 'socket.io-client';
    import { get } from 'svelte/store';
    import Popup from '$lib/components/Popup.svelte'; // Popup-Komponente importieren
    import { browser } from '$app/environment';


    let socket: Socket | null = null;
    let users: string[] = [];
    let admin: string | null = null; // Admin der Lobby
    let messages: { user: string; text: string }[] = [];
    let message = '';
    let error = '';
    let showPopup = false;
    let popupMessage = '';
    let popupOnClose: () => void; // Declare the popupOnClose variable


    const MAX_PLAYERS = 6;
    const MIN_PLAYERS = 3;
    const SOCKET_URL = 'http://localhost:3001';

    
    // Lobby-Infos aus Store oder localStorage holen
    let lobbyInfo: LobbyInfo | null = get(lobby);

    if (typeof window !== 'undefined' && !lobbyInfo) {
        const stored = localStorage.getItem('lobby');
        if (stored) {
            lobbyInfo = JSON.parse(stored);
            lobby.set(lobbyInfo);
        }
    }

    // Redirect, falls keine Lobby-Infos vorhanden oder Code nicht passt
    $: if (!lobbyInfo || $page.params.code !== lobbyInfo.lobbyCode) {
        if (browser) {
            goto('/onlinesetup');
        }
    }

    onMount(() => {

        if (!lobbyInfo) return;
        socket = io(SOCKET_URL);

        socket.emit('join lobby', { lobbyCode: lobbyInfo.lobbyCode, user: lobbyInfo.username });

        // Listen for the game started event
        socket.on('game started', (gameState) => {
            console.log('Game started:', gameState);
            goto(`/onlinegame/${lobbyInfo.lobbyCode}`); // Navigate to the game screen
        });
            
        socket.on('lobby users', ({ users: userList, admin: adminUser }) => {
            users = userList;
            admin = adminUser;
        });

        socket.on('lobby message', (msg) => {
            messages = [...messages, msg];
        });

        // Event für entfernte Spieler
            socket.on('removed from lobby', ({ message }) => {
            popupMessage = message;
            showPopup = true;

            // Warte, bis der Nutzer das Popup schließt, und leite dann weiter
            const handleClose = () => {
                showPopup = false;
                if (browser){
                    goto('/onlinesetup');
                }
                };

            // Übergib den `handleClose`-Handler an das Popup
            popupMessage = message;
            showPopup = true;
            popupOnClose = handleClose;
        });
    });


    function send() {
        if (message.trim() && socket && lobbyInfo) {
            socket.emit('lobby message', { lobbyCode: lobbyInfo.lobbyCode, user: lobbyInfo.username, text: message });
            message = '';
        }
    }

    function removeUser(user: string) {
        if (socket && lobbyInfo) {
            socket.emit('remove user', { lobbyCode: lobbyInfo.lobbyCode, user });
        }
    }

    function startGame() {
    if (socket && lobbyInfo) {
        socket.emit('start game', { lobbyCode: lobbyInfo.lobbyCode });

        // Admin wird direkt zur Spielseite weitergeleitet
        if (browser) {       
            goto(`/onlinegame/${lobbyInfo.lobbyCode}`);
        }
    }
}

    onDestroy(() => {
        if (socket && lobbyInfo) {
            socket.emit('leave lobby', { lobbyCode: lobbyInfo.lobbyCode, user: lobbyInfo.username });
            socket.disconnect();
        }
        lobby.set(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('lobby');
        }
    });
</script>

{#if lobbyInfo}
    <div class="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
        <h2 class="text-lg font-semibold mb-2">Lobby: {lobbyInfo.lobbyCode}</h2>
        <p class="mb-4">Teile diesen Code mit Freunden, damit sie beitreten können!</p>
        <!-- Nutzerliste -->
        <div class="mb-4">
            <h3 class="font-semibold mb-2">Aktuelle Nutzer ({users.length}/{MAX_PLAYERS}):</h3>
            <ul>
                {#each users as u, i}
                    <li class="flex justify-between items-center">
                        Spieler {i + 1}: {u}
                        {#if admin === lobbyInfo.username && u !== lobbyInfo.username}
                            <!-- Entfernen-Button nur für Admin sichtbar -->
                            <button on:click={() => removeUser(u)} class="text-red-600 hover:underline">
                                Entfernen
                            </button>
                        {/if}
                        {#if admin === u}
                            <span class="text-blue-600 ml-2">(Admin)</span>
                        {/if}
                    </li>
                {/each}
            </ul>
        </div>
        <!-- Admin-Buttons -->
        {#if admin === lobbyInfo.username}
            <button on:click={startGame} class="bg-green-600 text-white px-4 py-2 rounded mt-4">
                Spiel starten
            </button>
        {/if}
        <!-- Chat -->
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

{#if showPopup}
    <Popup message={popupMessage} onClose={popupOnClose} />
{/if}