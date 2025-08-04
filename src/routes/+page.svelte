<<<<<<< HEAD
<script>
	let count = $state(0);
=======
<script lang="ts">
	import { user } from '$lib/stores/user';

	let count = 0;
	let name = '';
	let username = '';
	let savedMessage = '';
>>>>>>> TomTest

	let start = () => {
		window.location.href = '/setup';
	};
</script>

<h1 class="text-3xl font-bold mb-4">Welcome to Wizard</h1>
<p class="text-gray-700">Stiche raten</p>

<div class="mb-10 flex justify-center">
	<button
		onclick={() => count++}
		class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
	>
		clicks: {count}
	</button>
</div>

<div class="h-screen flex flex-col justify-center items-center bg-indigo-100">
	<h1 class="text-5xl font-bold text-indigo-700 mb-6">Wizard</h1>
	<button
		onclick={start}
		class="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition"
	>
		Start Game
	</button>
</div>
