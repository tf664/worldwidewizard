<script>
	import WizardCard from '$lib/WizardCard.svelte';

	let count = $state(0);

	import { fade } from 'svelte/transition';
	let visible = true;
</script>

<h1>Digga leck mal dick Eier</h1>

<p>
	<a
		class="text-blue-600 underline hover:text-blue-800"
		href="https://youtu.be/xvFZjo5PgG0?si=q6YFLd1lnzocaw_O"
		target="_blank">Click here</a
	> to read the documentation
</p>

{#if visible}
	<p transition:fade>Hello world</p>
{/if}

<button
	onclick={() => count++}
	class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
>
	clicks: {count}
</button>

<br /> <br />
<WizardCard name="Magier" />
