<script lang="ts">
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
	</div>
{/if}
