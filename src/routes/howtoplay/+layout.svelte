<script>
	import '../../app.css';
	export let data;
</script>

<div class="min-h-screen bg-indigo-50 p-8">
	<header class="mb-6">
		<h1 class="text-4xl font-bold text-indigo-700">How to play</h1>
	</header>

	<main class="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
		<slot />
	</main>
</div>
