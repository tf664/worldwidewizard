<script lang="ts">
	import '../app.css';
</script>

<header class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
	<nav class="max-w-4xl mx-auto flex items-center justify-between p-4">
		<a href="/" class="font-extrabold text-xl tracking-wide flex items-center space-x-2">
			<img src="/favicon.svg" alt="Wizard" class="w-12 h-12" />
			<span>Wizard Game</span>
		</a>
		<div class="space-x-6 text-sm font-semibold uppercase">
			<a href="/" class="hover:underline hover:text-yellow-300">Home</a>
			<a href="/howtoplay" class="hover:underline hover:text-yellow-300">How to play</a>
			<a href="/about" class="hover:underline hover:text-yellow-300">About</a>
			<a href="/cards" class="hover:underline hover:text-yellow-300">Cards</a>
		</div>
	</nav>
</header>

<main class="w-full max-w-screen-xl mx-auto mt-6 px-4">
	<slot />
</main>

<div>
	<footer class="max-w-4xl mx-auto mt-16 px-6 py-4 border-t text-center text-gray-500 text-xs">
		&copy; 2025 Wizard Game. All rights reserved.
	</footer>
</div>
