<script>
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';

	let playerNames = ['', '', '', '', '', ''];
	let count = 3;

	function startGame() {
		const names = playerNames.slice(0, count).filter(Boolean);
		localStorage.setItem('players', JSON.stringify(names));
		goto('/game');
	}
</script>

<div class="p-6 max-w-xl mx-auto">
	<h2 class="text-3xl mb-4 font-bold">Setup Players</h2>
	<label>How many players?</label>
	<input type="number" min="3" max="6" bind:value={count} class="border rounded p-2 mb-4 w-full" />

	{#each Array(count) as _, i}
		<input
			type="text"
			class="border rounded p-2 mb-2 w-full"
			placeholder={`Player ${i + 1} name`}
			bind:value={playerNames[i]}
		/>
	{/each}

	<button on:click={startGame} class="bg-indigo-600 text-white px-4 py-2 rounded mt-4">
		Next
	</button>
</div>
