<script lang="ts">
	import '../app.css';
	export let data;
</script>

<header class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
	<nav class="max-w-4xl mx-auto flex items-center justify-between p-4">
		<h1 class="font-extrabold text-xl tracking-wide">Wizard Game</h1>
		<div class="space-x-6 text-sm font-semibold uppercase">
			<a href="/" class="hover:underline hover:text-yellow-300">Home</a>
			<a href="/about" class="hover:underline hover:text-yellow-300">About</a>
			<a href="/cards" class="hover:underline hover:text-yellow-300">Cards</a>
		</div>
	</nav>
</header>

<main class="max-w-4xl mx-auto mt-8 px-6">
	<slot />
</main>

<footer class="max-w-4xl mx-auto mt-16 px-6 py-4 border-t text-center text-gray-500 text-xs">
	<br> <br>
	&copy; 2025 Wizard Game. All rights reserved.
</footer>
