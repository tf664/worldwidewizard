<script lang="ts">
	import Card from '$lib/components/Card.svelte';

	const cards = [
		{ name: 'Magier', description: 'Kann die Zukunft voraussagen.' },
		{ name: 'Narr', description: 'Bringt Chaos ins Spiel.' },
		{ name: 'Seherin', description: 'Weiß, wer gewinnt.' }
	];
</script>

<h1 class="text-2xl font-semibold mb-4">Card Overview</h1>

<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
	{#each cards as card}
		<Card name={card.name} description={card.description} />
	{/each}
</div>
