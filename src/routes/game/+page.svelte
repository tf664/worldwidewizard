<script lang="ts">
	import { onMount } from 'svelte';
	import { createDeck } from '$lib/game/cards';
	import { createPlayers } from '$lib/game/player';

	let players = [];
	let deck = [];

	onMount(() => {
		const names = JSON.parse(localStorage.getItem('players') || '[]');
		players = createPlayers(names);
		deck = createDeck();

		// Deal 1 card for round 1
		for (let player of players) {
			player.hand = [deck.pop()];
		}
	});
</script>

<div class="p-6">
	<h2 class="text-2xl font-bold mb-4">Round 1</h2>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		{#each players as player}
			<div class="bg-white p-4 shadow rounded">
				<h3 class="font-semibold">{player.name}</h3>
				<p>Card: {player.hand[0]?.rank} {player.hand[0]?.suit}</p>
			</div>
		{/each}
	</div>
</div>
