<script lang="ts">
    import { lobby } from '$lib/stores/lobby';
    import { userStore } from '$lib/stores/user';
    import { goto } from '$app/navigation';
    import Popup from '$lib/components/Popup.svelte';

    let username = '';
    let lobbyCode = '';
    let inputLobbyCode = '';
    let error = '';
    let showPopup = false;
    let popupMessage = '';

    function generateLobbyCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    function createLobby() {
        if (!username.trim()) {
            error = 'Bitte gib einen Benutzernamen ein.';
            return;
        }
        lobbyCode = generateLobbyCode();
        saveAndGoto();
    }

    async function joinWithCode() {
        if (!username.trim()) {
            error = 'Bitte gib einen Benutzernamen ein.';
            return;
        }
        if (!inputLobbyCode.trim()) {
            error = 'Bitte gib einen Lobby-Code ein.';
            return;
        }

        lobbyCode = inputLobbyCode.trim().toUpperCase();

        // Überprüfe die Spieleranzahl in der Lobby
        const response = await fetch(`http://localhost:3001/lobby/${lobbyCode}`);
        if (response.ok) {
            const { users } = await response.json();
            if (users.length >= 6) {
                popupMessage = 'Die Lobby ist voll (maximal 6 Spieler).';
                showPopup = true;
                return;
            }
        } else {
            popupMessage = 'Lobby nicht gefunden.';
            showPopup = true;
            return;
        }

        // Lobby speichern und weiterleiten
        lobby.set({ lobbyCode, username });
        userStore.set({ username });

        if (typeof window !== 'undefined') {
            localStorage.setItem('lobby', JSON.stringify({ lobbyCode, username }));
        }
        goto(`/lobby/${lobbyCode}`);
    }

    function saveAndGoto() {
        lobby.set({ lobbyCode, username });
        userStore.set({ username });
        
        if (typeof window !== 'undefined') {
            localStorage.setItem('lobby', JSON.stringify({ lobbyCode, username }));
        }
        goto(`/lobby/${lobbyCode}`);
    }
</script>

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

{#if showPopup}
    <Popup message={popupMessage} onClose={() => (showPopup = false)} />
{/if}