<script>
	let count = $state(0);

	let start = () => {
		window.location.href = '/setup';
	};
</script>

<h1 class="text-3xl font-bold mb-4">Welcome to Wizard</h1>
<p class="text-gray-700">This is a simple card game app built with SvelteKit and Tailwind CSS.</p>

<div class="mb-10 flex justify-center">
	<button
		on:click={() => count++}
		class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
	>
		clicks: {count}
	</button>
</div>

<div class="h-screen flex flex-col justify-center items-center bg-indigo-100">
	<h1 class="text-5xl font-bold text-indigo-700 mb-6">Wizard</h1>
	<button
		on:click={start}
		class="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
	>
		Start Game
	</button>
</div>
