<script lang="ts" >
	import { user } from '$lib/stores/user';

	let name = '';
	let username = '';
	let savedMessage = '';

	function login() {
		if (name && username) {
			const newUser = {
				name,
				username,
				profilePic: 'https://i.pravatar.cc/100?u=' + username
			};
			user.set(newUser);
			savedMessage = `Eingeloggt als ${username}`;
		}
	}

	function logout() {
		user.set(null);
		savedMessage = '';
		name = '';
		username = '';
	}

	const express = require('express');
	const { createServer } = require('node:http');
	const { join } = require('node:path');
	const { Server } = require('socket.io');

	const app = express();
	const server = createServer(app);
	const io = new Server(server);
	const socket = io();

	app.get('/', (req, res) => {
  		res.sendFile(join(__dirname, 'index.html'));
	});

	io.on('connection', (socket) => {
  		console.log('a user connected');
	});

	server.listen(3000, () => {
  		console.log('server running at http://localhost:3000');
	});
</script>

{#if !$user}
	<!-- Login-Formular -->
	<div class="mt-10 w-full max-w-sm bg-white p-6 rounded shadow">
		<h2 class="text-lg font-semibold mb-2">Login</h2>
		<input bind:value={name} placeholder="Name" class="w-full border p-2 rounded mb-2" />
		<input bind:value={username} placeholder="Benutzername" class="w-full border p-2 rounded mb-2" />
		<button onclick={login} class="w-full bg-blue-600 text-white px-4 py-2 rounded">
			Speichern
		</button>
		{#if savedMessage}
			<p class="mt-4 text-green-600 font-medium">{savedMessage}</p>
		{/if}
	</div>
{:else}
	<!-- Begrüßung und Logout -->
	<div class="mt-10 w-full max-w-sm bg-white p-6 rounded shadow text-center">
		<img src="{$user.profilePic}" alt="Profilbild" class="w-20 h-20 rounded-full mx-auto mb-4" />
		<p class="text-lg font-semibold mb-2">Eingeloggt als {$user.name}</p>
		<p class="text-sm text-gray-600 mb-4">@{$user.username}</p>
		<button onclick={logout} class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
			Logout
		</button>

		<div class="mt-8">
			<div class="bg-gray-100 h-48 rounded p-4 mb-4 overflow-y-auto text-left">
				<!-- Chatverlauf (hier könnten Nachrichten erscheinen) -->
				<p class="text-gray-700 italic">Noch keine Nachrichten.</p>
			</div>
			<div class="flex gap-2">
				<textarea
					class="flex-1 border rounded p-2 resize-none"
					rows="2"
					placeholder="Nachricht schreiben..."
				></textarea>
				<button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
					Senden
				</button>
			</div>
		</div>

	</div>
{/if}
