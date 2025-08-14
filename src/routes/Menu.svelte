<script lang="ts">
	import { goto } from '$app/navigation';
	export let open = false;

	function navigate(path: string) {
		open = false; // closes menu
		goto(path);
	}
</script>

<div
	class={`sm:hidden bg-purple-700 transition-all duration-300 ease-in-out overflow-hidden ${
		open ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
	}`}
>
	<div class="flex flex-col items-center space-y-4 text-sm font-semibold uppercase text-white">
		<a
			href="/"
			on:click|preventDefault={() => navigate('/')}
			class="hover:underline hover:text-yellow-300">Home</a
		>
		<a
			href="/howtoplay"
			on:click|preventDefault={() => navigate('/howtoplay')}
			class="hover:underline hover:text-yellow-300">How to play</a
		>
		<a
			href="/about"
			on:click|preventDefault={() => navigate('/about')}
			class="hover:underline hover:text-yellow-300">About</a
		>
		<a
			href="/cards"
			on:click|preventDefault={() => navigate('/cards')}
			class="hover:underline hover:text-yellow-300">Cards</a
		>
		<a
			href="/profile"
			on:click|preventDefault={() => navigate('/profile')}
			class="hover:underline hover:text-yellow-300">Profile</a
		>
	</div>
</div>
