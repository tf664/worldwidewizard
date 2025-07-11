<script>
	let count = $state(0);
</script>

<h1 class="text-3xl font-bold mb-4">Welcome to Wizard</h1>
<p class="text-gray-700">This is a simple card game app built with SvelteKit and Tailwind CSS.</p>

<button
	onclick={() => count++}
	class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
>
	clicks: {count}
</button>
