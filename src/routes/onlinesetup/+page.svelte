<script lang="ts">
	import { lobby, type LobbyInfo } from '$lib/stores/lobby';
	import { userStore } from '$lib/stores/user';
	import { goto } from '$app/navigation';
	import { io, type Socket } from 'socket.io-client';
	import Popup from '$lib/components/Popup.svelte';

	let username = '';
	let lobbyCode = '';
	let inputLobbyCode = '';
	let error = '';
	let showPopup = false;
	let popupMessage = '';
	let isCreating = false;
	let isJoining = false;

	const SOCKET_URL = 'http://10.244.144.199:3001';

	function generateLobbyCode() {
		return Math.random().toString(36).substring(2, 8).toUpperCase();
	}

	async function createLobby() {
		if (!username.trim()) {
			error = 'Bitte gib einen Benutzernamen ein.';
			return;
		}

		if (isCreating) return;
		isCreating = true;
		error = '';

		try {
			lobbyCode = generateLobbyCode();

			const lobbyInfo: LobbyInfo = {
				lobbyCode: lobbyCode,
				username: username.trim(),
				isAdmin: true
			};

			// Save to stores and localStorage
			lobby.set(lobbyInfo);
			userStore.set({ username: username.trim() });

			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('lobby', JSON.stringify(lobbyInfo));
			}

			// Navigate to lobby page - the lobby page will handle socket connection and lobby creation
			goto(`/lobby/${lobbyCode}`);
		} catch (err) {
			console.error('Error creating lobby:', err);
			error = 'Fehler beim Erstellen der Lobby. Bitte versuche es erneut.';
		} finally {
			isCreating = false;
		}
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

		if (isJoining) return;
		isJoining = true;
		error = '';

		const targetLobbyCode = inputLobbyCode.trim().toUpperCase();

		try {
			// Test connection to see if lobby exists and username is available
			const socket = io(SOCKET_URL, {
				timeout: 5000,
				forceNew: true,
				autoConnect: true
			});

			const joinResult = await new Promise((resolve, reject) => {
				let hasResponse = false;

				const cleanup = () => {
					if (socket) {
						socket.removeAllListeners();
						socket.disconnect();
					}
				};

				const handleTimeout = setTimeout(() => {
					if (!hasResponse) {
						hasResponse = true;
						cleanup();
						reject(new Error('Verbindung zum Server fehlgeschlagen (Timeout)'));
					}
				}, 10000);

				socket.on('connect', () => {
					console.log('Connected to server for lobby validation');
					socket.emit('join lobby', {
						lobbyCode: targetLobbyCode,
						user: username.trim()
					});
				});

				socket.on('lobby users', (data) => {
					if (!hasResponse) {
						hasResponse = true;
						clearTimeout(handleTimeout);

						// Check if lobby is full
						if (data.users && data.users.length >= 6) {
							cleanup();
							reject(new Error('Die Lobby ist voll (maximal 6 Spieler).'));
							return;
						}

						// Success - lobby exists and we can join
						cleanup();
						resolve(data);
					}
				});

				socket.on('error', (errorMessage) => {
					if (!hasResponse) {
						hasResponse = true;
						clearTimeout(handleTimeout);
						cleanup();

						let message = 'Unbekannter Fehler';
						if (typeof errorMessage === 'string') {
							if (errorMessage.includes('already taken')) {
								message = 'Benutzername bereits vergeben in dieser Lobby.';
							} else if (
								errorMessage.includes('not found') ||
								errorMessage.includes('Lobby not found')
							) {
								message = 'Lobby nicht gefunden.';
							} else if (errorMessage.includes('full')) {
								message = 'Die Lobby ist voll.';
							} else {
								message = errorMessage;
							}
						}
						reject(new Error(message));
					}
				});

				socket.on('connect_error', (err) => {
					if (!hasResponse) {
						hasResponse = true;
						clearTimeout(handleTimeout);
						cleanup();
						reject(new Error('Verbindung zum Server fehlgeschlagen.'));
					}
				});

				socket.on('disconnect', (reason) => {
					if (!hasResponse && reason !== 'io client disconnect') {
						hasResponse = true;
						clearTimeout(handleTimeout);
						cleanup();
						reject(new Error('Verbindung zum Server verloren.'));
					}
				});
			});

			// If we get here, validation was successful
			const lobbyInfo: LobbyInfo = {
				lobbyCode: targetLobbyCode,
				username: username.trim(),
				isAdmin: false
			};

			// Save to stores and localStorage
			lobby.set(lobbyInfo);
			userStore.set({ username: username.trim() });

			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('lobby', JSON.stringify(lobbyInfo));
			}

			// Navigate to lobby page
			goto(`/lobby/${targetLobbyCode}`);
		} catch (err: any) {
			console.error('Error joining lobby:', err);
			popupMessage = err.message || 'Fehler beim Beitreten zur Lobby.';
			showPopup = true;
		} finally {
			isJoining = false;
		}
	}

	function clearError() {
		error = '';
	}
</script>

<svelte:head>
	<title>Online Lobby Setup - Wizard Game</title>
</svelte:head>

<div class="mx-auto mt-10 max-w-md rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg">
	<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Online Wizard Game</h2>

	<!-- Username Input -->
	<div class="mb-6">
		<label for="username" class="mb-2 block text-sm font-semibold text-gray-700">
			Benutzername *
		</label>
		<input
			id="username"
			type="text"
			bind:value={username}
			placeholder="Dein Benutzername"
			class="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
			maxlength="20"
			disabled={isCreating || isJoining}
		/>
		<p class="mt-1 text-xs text-gray-500">Maximal 20 Zeichen</p>
	</div>

	<!-- Create Lobby Section -->
	<div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
		<h3 class="mb-3 font-semibold text-blue-800">Neue Lobby erstellen</h3>
		<button
			on:click={createLobby}
			class="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={!username.trim() || isCreating || isJoining}
		>
			{#if isCreating}
				<span class="flex items-center justify-center">
					<svg
						class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Erstelle Lobby...
				</span>
			{:else}
				Lobby erstellen
			{/if}
		</button>
		<p class="mt-2 text-xs text-blue-600">Du wirst automatisch Admin der neuen Lobby</p>
	</div>

	<!-- Join Lobby Section -->
	<div class="rounded-lg border border-green-200 bg-green-50 p-4">
		<h3 class="mb-3 font-semibold text-green-800">Lobby beitreten</h3>
		<div class="space-y-3">
			<input
				type="text"
				bind:value={inputLobbyCode}
				placeholder="Lobby-Code (z.B. ABC123)"
				class="w-full rounded-lg border border-gray-300 p-3 uppercase focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
				maxlength="6"
				disabled={isCreating || isJoining}
			/>
			<button
				on:click={joinWithCode}
				class="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!username.trim() || !inputLobbyCode.trim() || isCreating || isJoining}
			>
				{#if isJoining}
					<span class="flex items-center justify-center">
						<svg
							class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Trete bei...
					</span>
				{:else}
					Lobby beitreten
				{/if}
			</button>
		</div>
		<p class="mt-2 text-xs text-green-600">Gib den 6-stelligen Code der Lobby ein</p>
	</div>

	<!-- Error Display -->
	{#if error}
		<div class="mt-4 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700">
			<div class="flex items-center justify-between">
				<span class="text-sm">{error}</span>
				<button on:click={clearError} class="text-lg font-bold text-red-700 hover:text-red-900"
					>&times;</button
				>
			</div>
		</div>
	{/if}

	<!-- Info Section -->
	<div class="mt-6 border-t border-gray-200 pt-4">
		<h4 class="mb-2 font-semibold text-gray-700">Spielregeln:</h4>
		<ul class="space-y-1 text-sm text-gray-600">
			<li>• 3-6 Spieler pro Lobby</li>
			<li>• Nur der Admin kann das Spiel starten</li>
			<li>• Alle Spieler müssen verbunden bleiben</li>
		</ul>
	</div>
</div>

{#if showPopup}
	<Popup message={popupMessage} onClose={() => (showPopup = false)} />
{/if}
