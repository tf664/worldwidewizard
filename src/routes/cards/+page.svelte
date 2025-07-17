<script lang="ts">
	import CardImage from './CardImage.svelte';
	import { onMount } from 'svelte';

	export const cardsBlue = [
		{ id: 1, name: 'Blue One', image: '/rcs/cards/blue_one.jpg' },
		{ id: 2, name: 'Blue Two', image: '/rcs/cards/blue_two.jpg' },
		{ id: 3, name: 'Blue Three', image: '/rcs/cards/blue_three.jpg' },
		{ id: 4, name: 'Blue Four', image: '/rcs/cards/blue_four.jpg' },
		{ id: 5, name: 'Blue Five', image: '/rcs/cards/blue_five.jpg' },
		{ id: 6, name: 'Blue Six', image: '/rcs/cards/blue_six.jpg' },
		{ id: 7, name: 'Blue Seven', image: '/rcs/cards/blue_seven.jpg' },
		{ id: 8, name: 'Blue Eight', image: '/rcs/cards/blue_eight.jpg' },
		{ id: 9, name: 'Blue Nine', image: '/rcs/cards/blue_nine.jpg' },
		{ id: 10, name: 'Blue Ten', image: '/rcs/cards/blue_ten.jpg' },
		{ id: 11, name: 'Blue Eleven', image: '/rcs/cards/blue_eleven.jpg' },
		{ id: 12, name: 'Blue Twelve', image: '/rcs/cards/blue_twelve.jpg' },
		{ id: 13, name: 'Blue Thirteen', image: '/rcs/cards/blue_thirteen.jpg' }
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	export const cardsRed = [
		{ id: 1, name: 'Red One', image: '/rcs/cards/red_one.jpg' },
		{ id: 2, name: 'Red Two', image: '/rcs/cards/red_two.jpg' },
		{ id: 3, name: 'Red Three', image: '/rcs/cards/red_three.jpg' },
		{ id: 4, name: 'Red Four', image: '/rcs/cards/red_four.jpg' },
		{ id: 5, name: 'Red Five', image: '/rcs/cards/red_five.jpg' },
		{ id: 6, name: 'Red Six', image: '/rcs/cards/red_six.jpg' },
		{ id: 7, name: 'Red Seven', image: '/rcs/cards/red_seven.jpg' },
		{ id: 8, name: 'Red Eight', image: '/rcs/cards/red_eight.jpg' },
		{ id: 9, name: 'Red Nine', image: '/rcs/cards/red_nine.jpg' },
		{ id: 10, name: 'Red Ten', image: '/rcs/cards/red_ten.jpg' },
		{ id: 11, name: 'Red Eleven', image: '/rcs/cards/red_eleven.jpg' },
		{ id: 12, name: 'Red Twelve', image: '/rcs/cards/red_twelve.jpg' },
		{ id: 13, name: 'Red Thirteen', image: '/rcs/cards/red_thirteen.jpg' }
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	export const cardsGreen = [
		{ id: 1, name: 'Green One', image: '/rcs/cards/green_one.jpg' },
		{ id: 2, name: 'Green Two', image: '/rcs/cards/green_two.jpg' },
		{ id: 3, name: 'Green Three', image: '/rcs/cards/green_three.jpg' },
		{ id: 4, name: 'Green Four', image: '/rcs/cards/green_four.jpg' },
		{ id: 5, name: 'Green Five', image: '/rcs/cards/green_five.jpg' },
		{ id: 6, name: 'Green Six', image: '/rcs/cards/green_six.jpg' },
		{ id: 7, name: 'Green Seven', image: '/rcs/cards/green_seven.jpg' },
		{ id: 8, name: 'Green Eight', image: '/rcs/cards/green_eight.jpg' },
		{ id: 9, name: 'Green Nine', image: '/rcs/cards/green_nine.jpg' },
		{ id: 10, name: 'Green Ten', image: '/rcs/cards/green_ten.jpg' },
		{ id: 11, name: 'Green Eleven', image: '/rcs/cards/green_eleven.jpg' },
		{ id: 12, name: 'Green Twelve', image: '/rcs/cards/green_twelve.jpg' },
		{ id: 13, name: 'Green Thirteen', image: '/rcs/cards/green_thirteen.jpg' }
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	export const cardsYellow = [
		{ id: 1, name: 'Yellow One', image: '/rcs/cards/yellow_one.jpg' },
		{ id: 2, name: 'Yellow Two', image: '/rcs/cards/yellow_two.jpg' },
		{ id: 3, name: 'Yellow Three', image: '/rcs/cards/yellow_three.jpg' },
		{ id: 4, name: 'Yellow Four', image: '/rcs/cards/yellow_four.jpg' },
		{ id: 5, name: 'Yellow Five', image: '/rcs/cards/yellow_five.jpg' },
		{ id: 6, name: 'Yellow Six', image: '/rcs/cards/yellow_six.jpg' },
		{ id: 7, name: 'Yellow Seven', image: '/rcs/cards/yellow_seven.jpg' },
		{ id: 8, name: 'Yellow Eight', image: '/rcs/cards/yellow_eight.jpg' },
		{ id: 9, name: 'Yellow Nine', image: '/rcs/cards/yellow_nine.jpg' },
		{ id: 10, name: 'Yellow Ten', image: '/rcs/cards/yellow_ten.jpg' },
		{ id: 11, name: 'Yellow Eleven', image: '/rcs/cards/yellow_eleven.jpg' },
		{ id: 12, name: 'Yellow Twelve', image: '/rcs/cards/yellow_twelve.jpg' },
		{ id: 13, name: 'Yellow Thirteen', image: '/rcs/cards/yellow_thirteen.jpg' }
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	export const zoro = [
		{ id: 1, name: 'Zoro One', image: '/rcs/cards/zoro_one.jpg' },
		{ id: 2, name: 'Zoro Two', image: '/rcs/cards/zoro_two.jpg' },
		{ id: 3, name: 'Zoro Three', image: '/rcs/cards/zoro_three.jpg' },
		{ id: 4, name: 'Zoro Four', image: '/rcs/cards/zoro_four.jpg' }
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	export const fool = [
		{ id: 1, name: 'Fool One', image: '/rcs/cards/fool_one.jpg' },
		{ id: 2, name: 'Fool Two', image: '/rcs/cards/fool_two.jpg' },
		{ id: 3, name: 'Fool Three', image: '/rcs/cards/fool_three.jpg' },
		{ id: 4, name: 'Fool Four', image: '/rcs/cards/fool_four.jpg' }
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	function toWebp(imagePath: string): string {
		return imagePath
			.replace('/rcs/cards/', '/rcs/cards-optimized/')
			.replace(/\.(jpg|jpeg|png)$/i, '.webp');
	}

	function preloadImages(urls: string[]) {
		urls.forEach((url) => {
			const img = new Image();
			img.src = url;
		});
	}

	const allCardImages = [
		...cardsBlue.map((c) => toWebp(c.image)),
		...cardsRed.map((c) => toWebp(c.image)),
		...cardsGreen.map((c) => toWebp(c.image)),
		...cardsYellow.map((c) => c.image),
		...zoro.map((c) => c.image),
		...fool.map((c) => c.image)
	];

	onMount(() => {
		preloadImages(allCardImages);
	});
</script>

<h1 class="text-2xl font-semibold mb-4">Card Overview</h1>
<div class="min-h-screen bg-indigo-50 p-8">
	<header class="mb-8">
		<h1 class="text-4xl font-extrabold text-indigo-700 tracking-wide drop-shadow-md">Card Section</h1>
	</header>

	<main class="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
		<!-- Card group: Blue -->
		<section class="mb-10">
			<h2 class="text-3xl font-semibold text-indigo-800 mb-6 border-b-2 border-indigo-300 pb-2">Blue Cards</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each cardsBlue as card}
					<div
						class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-xl"
						title={card.name}
					>
						<CardImage src={card.image} alt={card.name} className="w-32 h-auto mb-3 rounded-md" />
						<p class="text-lg font-medium text-indigo-900">{card.name}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Card group: Red -->
		<section class="mb-10">
			<h2 class="text-3xl font-semibold text-red-700 mb-6 border-b-2 border-red-300 pb-2">Red Cards</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each cardsRed as card}
					<div
						class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-xl"
						title={card.name}
					>
						<CardImage src={card.image} alt={card.name} className="w-32 h-auto mb-3 rounded-md" />
						<p class="text-lg font-medium text-red-900">{card.name}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Card group: Green -->
		<section class="mb-10">
			<h2 class="text-3xl font-semibold text-green-700 mb-6 border-b-2 border-green-300 pb-2">Green Cards</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each cardsGreen as card}
					<div
						class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-xl"
						title={card.name}
					>
						<CardImage src={card.image} alt={card.name} className="w-32 h-auto mb-3 rounded-md" />
						<p class="text-lg font-medium text-green-900">{card.name}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Card group: Yellow -->
		<section class="mb-10">
			<h2 class="text-3xl font-semibold text-yellow-600 mb-6 border-b-2 border-yellow-300 pb-2">Yellow Cards</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each cardsYellow as card}
					<div
						class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-xl"
						title={card.name}
					>
						<CardImage src={card.image} alt={card.name} className="w-32 h-auto mb-3 rounded-md" />
						<p class="text-lg font-medium text-yellow-900">{card.name}</p>
					</div>
				{/each}
			</div>
		</section>
	</main>
</div>