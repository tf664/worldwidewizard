<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { Hamburger } from 'svelte-hamburgers';
	import Menu from './Menu.svelte';

	// Initialize Vercel Analytics
	injectAnalytics();

	let open = false;
</script>

<header class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
	<nav class="max-w-4xl mx-auto flex items-center justify-between p-4">
		<a
			href="/"
			on:click|preventDefault={() => goto('/')}
			class="font-extrabold text-xl tracking-wide flex items-center space-x-2"
		>
			<img src="/favicon.svg" alt="Wizard" class="w-12 h-12" />
			<span>Wizard Game</span>
		</a>

		<!-- Desktop Nav -->
		<div class="hidden sm:flex space-x-6 text-base lg:text-lg font-semibold uppercase">
			<a
				href="/"
				on:click|preventDefault={() => goto('/')}
				class="hover:underline hover:text-yellow-300">Home</a
			>
			<a
				href="/howtoplay"
				on:click|preventDefault={() => goto('/howtoplay')}
				class="hover:underline hover:text-yellow-300">How to play</a
			>
			<a
				href="/about"
				on:click|preventDefault={() => goto('/about')}
				class="hover:underline hover:text-yellow-300">About</a
			>
			<a
				href="/cards"
				on:click|preventDefault={() => goto('/cards')}
				class="hover:underline hover:text-yellow-300">Cards</a
			>
			<a
				href="/profile"
				on:click|preventDefault={() => goto('/profile')}
				class="hover:underline hover:text-yellow-300">Profile</a
			>
		</div>

		<!-- Mobile Hamburger -->
		<div class="sm:hidden">
			<Hamburger bind:open --color="white" title="Navigation Bar Toggle" />
		</div>
	</nav>

	<!-- Mobile Menu -->
	<Menu bind:open />
</header>

<main class="w-full max-w-screen-xl mx-auto mt-6 px-4">
	<slot />
</main>

<footer class="max-w-4xl mx-auto mt-16 px-6 py-4 border-t text-center text-gray-500 text-xs">
	&copy; 2025 Wizard Game. All rights reserved.
</footer>
