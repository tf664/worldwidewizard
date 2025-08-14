<script lang="ts">
	import { user } from '$lib/stores/user';
	import { goto } from '$app/navigation';

	let count = 0;
	let name = '';
	let username = '';
	let savedMessage = '';

	let start = () => {
		//window.location.href = '/setup';
		goto('/setup');
	};

	let startOnline = () => {
		//window.location.href = '/setup';
		goto('/onlinesetup');
	};
</script>

<svelte:head>
	<title>World Wide Wizard</title>
	<meta name="description" content="Play World Wide Wizard with your friends and foes" />
</svelte:head>

<div class="mb-10 flex justify-center">
	<button
		onclick={() => count++}
		class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
	>
		clicks: {count}
	</button>
</div>

<div class="py-70 flex flex-col justify-center items-center bg-gradient-to-b from-indigo-100 to-indigo-200 rounded-xl shadow-lg max-w-lg mx-auto mt-20">
	<h1 class="text-6xl font-extrabold text-indigo-800 mb-8 tracking-wide drop-shadow-lg animate-hue">
		Wizard
	</h1>
	<div class="flex gap-6 py-10">
		<button
			onclick={start}
			class="bg-indigo-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-transform duration-200"
		>
			Start Game
		</button>
		<button
			onclick={startOnline}
			class="bg-indigo-500 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-transform duration-200"
		>
			Play Online
		</button>
	</div>
</div>

<style>
	@keyframes hue-shift {
		0% {
			filter: hue-rotate(0deg);
		}
		50% {
			filter: hue-rotate(30deg);
		}
		100% {
			filter: hue-rotate(0deg);
		}
	}
	.animate-hue {
		display: inline-block;
		animation: hue-shift 3s infinite linear;
	}
</style>
