<script lang="ts">
	import CardImage from './CardImage.svelte';
	import { onMount } from 'svelte';

	export const cardsBlue = [
		{ id: 1, name: 'Blue One', description: 'Die Diebin', image: '/rcs/cards/blue_one.jpg' },
		{ id: 2, name: 'Blue Two', description: '', image: '/rcs/cards/blue_two.jpg' },
		{ id: 3, name: 'Blue Three', description: '', image: '/rcs/cards/blue_three.jpg' },
		{ id: 4, name: 'Blue Four', description: 'Der Bauer', image: '/rcs/cards/blue_four.jpg' },
		{ id: 5, name: 'Blue Five', description: '', image: '/rcs/cards/blue_five.jpg' },
		{ id: 6, name: 'Blue Six', description: '', image: '/rcs/cards/blue_six.jpg' },
		{
			id: 7,
			name: 'Blue Seven',
			description: 'Die Priesterin',
			image: '/rcs/cards/blue_seven.jpg'
		},
		{ id: 8, name: 'Blue Eight', description: '', image: '/rcs/cards/blue_eight.jpg' },
		{ id: 9, name: 'Blue Nine', description: '', image: '/rcs/cards/blue_nine.jpg' },
		{ id: 10, name: 'Blue Ten', description: '', image: '/rcs/cards/blue_ten.jpg' },
		{ id: 11, name: 'Blue Eleven', description: '', image: '/rcs/cards/blue_eleven.jpg' },
		{ id: 12, name: 'Blue Twelve', description: 'Der König', image: '/rcs/cards/blue_twelve.jpg' },
		{
			id: 13,
			name: 'Blue Thirteen',
			description: 'Die Standarte',
			image: '/rcs/cards/blue_thirteen.jpg'
		}
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	export const cardsRed = [
		{ id: 1, name: 'Red One', description: '', image: '/rcs/cards/red_one.jpg' },
		{ id: 2, name: 'Red Two', description: '', image: '/rcs/cards/red_two.jpg' },
		{ id: 3, name: 'Red Three', description: '', image: '/rcs/cards/red_three.jpg' },
		{ id: 4, name: 'Red Four', description: '', image: '/rcs/cards/red_four.jpg' },
		{ id: 5, name: 'Red Five', description: 'Der Schmied', image: '/rcs/cards/red_five.jpg' },
		{ id: 6, name: 'Red Six', description: '', image: '/rcs/cards/red_six.jpg' },
		{ id: 7, name: 'Red Seven', description: '', image: '/rcs/cards/red_seven.jpg' },
		{ id: 8, name: 'Red Eight', description: 'Die Kriegerin', image: '/rcs/cards/red_eight.jpg' },
		{ id: 9, name: 'Red Nine', description: '', image: '/rcs/cards/red_nine.jpg' },
		{
			id: 10,
			name: 'Red Ten',
			description: 'Die Schatzmeisterin',
			image: '/rcs/cards/red_ten.jpg'
		},
		{ id: 11, name: 'Red Eleven', description: '', image: '/rcs/cards/red_eleven.jpg' },
		{ id: 12, name: 'Red Twelve', description: '', image: '/rcs/cards/red_twelve.jpg' },
		{
			id: 13,
			name: 'Red Thirteen',
			description: 'Die Standarte',
			image: '/rcs/cards/red_thirteen.jpg'
		}
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	export const cardsGreen = [
		{ id: 1, name: 'Green One', description: '', image: '/rcs/cards/green_one.jpg' },
		{ id: 2, name: 'Green Two', description: '', image: '/rcs/cards/green_two.jpg' },
		{ id: 3, name: 'Green Three', description: 'Der Fischer', image: '/rcs/cards/green_three.jpg' },
		{ id: 4, name: 'Green Four', description: 'Die Bäuerin', image: '/rcs/cards/green_four.jpg' },
		{ id: 5, name: 'Green Five', description: '', image: '/rcs/cards/green_five.jpg' },
		{ id: 6, name: 'Green Six', description: '', image: '/rcs/cards/green_six.jpg' },
		{ id: 7, name: 'Green Seven', description: '', image: '/rcs/cards/green_seven.jpg' },
		{
			id: 8,
			name: 'Green Eight',
			description: 'Die Kriegerin',
			image: '/rcs/cards/green_eight.jpg'
		},
		{ id: 9, name: 'Green Nine', description: 'Der Feldherr', image: '/rcs/cards/green_nine.jpg' },
		{ id: 10, name: 'Green Ten', description: 'Die Standarte', image: '/rcs/cards/green_ten.jpg' },
		{
			id: 11,
			name: 'Green Eleven',
			description: 'Der Prinz',
			image: '/rcs/cards/green_eleven.jpg'
		},
		{ id: 12, name: 'Green Twelve', description: '', image: '/rcs/cards/green_twelve.jpg' },
		{ id: 13, name: 'Green Thirteen', description: '', image: '/rcs/cards/green_thirteen.jpg' }
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	export const cardsYellow = [
		{ id: 1, name: 'Yellow One', description: 'Die Diebin', image: '/rcs/cards/yellow_one.jpg' },
		{ id: 2, name: 'Yellow Two', description: 'Der Knecht', image: '/rcs/cards/yellow_two.jpg' },
		{ id: 3, name: 'Yellow Three', description: '', image: '/rcs/cards/yellow_three.jpg' },
		{ id: 4, name: 'Yellow Four', description: '', image: '/rcs/cards/yellow_four.jpg' },
		{ id: 5, name: 'Yellow Five', description: '', image: '/rcs/cards/yellow_five.jpg' },
		{ id: 6, name: 'Yellow Six', description: 'Der Händler', image: '/rcs/cards/yellow_six.jpg' },
		{ id: 7, name: 'Yellow Seven', description: '', image: '/rcs/cards/yellow_seven.jpg' },
		{
			id: 8,
			name: 'Yellow Eight',
			description: 'Der Krieger',
			image: '/rcs/cards/yellow_eight.jpg'
		},
		{ id: 9, name: 'Yellow Nine', description: '', image: '/rcs/cards/yellow_nine.jpg' },
		{ id: 10, name: 'Yellow Ten', description: '', image: '/rcs/cards/yellow_ten.jpg' },
		{
			id: 11,
			name: 'Yellow Eleven',
			description: 'Die Prinzessin',
			image: '/rcs/cards/yellow_eleven.jpg'
		},
		{ id: 12, name: 'Yellow Twelve', description: '', image: '/rcs/cards/yellow_twelve.jpg' },
		{
			id: 13,
			name: 'Yellow Thirteen',
			description: 'Die Standarte',
			image: '/rcs/cards/yellow_thirteen.jpg'
		}
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	export const zoro = [
		{ id: 1, name: 'Zoro One', description: 'Der Zauberer', image: '/rcs/cards/zoro_one.jpg' },
		{ id: 2, name: 'Zoro Two', description: '', image: '/rcs/cards/zoro_two.jpg' },
		{ id: 3, name: 'Zoro Three', description: 'Die Zauberin', image: '/rcs/cards/zoro_three.jpg' },
		{ id: 4, name: 'Zoro Four', description: '', image: '/rcs/cards/zoro_four.jpg' }
	].map((card) => ({
		...card,
		image: toWebp(`/rcs/cards/${card.name.toLowerCase().replace(/ /g, '_')}.jpg`)
	}));

	export const fool = [
		{ id: 1, name: 'Fool One Blue', description: '', image: '/rcs/cards/fool_one.jpg' },
		{ id: 2, name: 'Fool Two Red', description: 'Der Narr', image: '/rcs/cards/fool_two.jpg' },
		{ id: 3, name: 'Fool Three Green', description: '', image: '/rcs/cards/fool_three.jpg' },
		{ id: 4, name: 'Fool Four Yellow', description: '', image: '/rcs/cards/fool_four.jpg' }
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
		<h1 class="text-4xl font-extrabold text-indigo-700 tracking-wide drop-shadow-md">
			Card Section
		</h1>
	</header>

	<main class="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
		<!-- Card group: Blue -->
		<section class="mb-10">
			<h2 class="text-3xl font-semibold text-indigo-800 mb-6 border-b-2 border-indigo-300 pb-2">
				Blue Cards
			</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each cardsBlue as card}
					<div
						class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center
         				group cursor-pointer transition-transform transform hover:scale-105"
					>
						<CardImage src={card.image} alt={card.name} className="w-32 h-auto mb-3 rounded-md" />

						<!-- Text container: fixed height to avoid layout shift -->
						<div class="relative h-6 w-full">
							<!-- Name: visible normally -->
							<p
								class="text-lg font-medium text-indigo-900 absolute inset-0 flex items-center justify-center
               					transition-opacity duration-300 group-hover:opacity-0"
							>
								{card.name}
							</p>

							<!-- Description: hidden normally, visible on hover -->
							<p
								class="text-lg font-semibold text-indigo-600 absolute inset-0 flex items-center justify-center
              				 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							>
								{card.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Card group: Red -->
		<section class="mb-10">
			<h2 class="text-3xl font-semibold text-red-700 mb-6 border-b-2 border-red-300 pb-2">
				Red Cards
			</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each cardsRed as card}
					<div
						class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center
         				group cursor-pointer transition-transform transform hover:scale-105"
					>
						<CardImage src={card.image} alt={card.name} className="w-32 h-auto mb-3 rounded-md" />

						<!-- Text container: fixed height to avoid layout shift -->
						<div class="relative h-6 w-full">
							<!-- Name: visible normally -->
							<p
								class="text-lg font-medium text-indigo-900 absolute inset-0 flex items-center justify-center
               					transition-opacity duration-300 group-hover:opacity-0"
							>
								{card.name}
							</p>

							<!-- Description: hidden normally, visible on hover -->
							<p
								class="text-lg font-semibold text-indigo-600 absolute inset-0 flex items-center justify-center
              				 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							>
								{card.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Card group: Green -->
		<section class="mb-10">
			<h2 class="text-3xl font-semibold text-green-700 mb-6 border-b-2 border-green-300 pb-2">
				Green Cards
			</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each cardsGreen as card}
					<div
						class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center
         				group cursor-pointer transition-transform transform hover:scale-105"
					>
						<CardImage src={card.image} alt={card.name} className="w-32 h-auto mb-3 rounded-md" />

						<!-- Text container: fixed height to avoid layout shift -->
						<div class="relative h-6 w-full">
							<!-- Name: visible normally -->
							<p
								class="text-lg font-medium text-indigo-900 absolute inset-0 flex items-center justify-center
               					transition-opacity duration-300 group-hover:opacity-0"
							>
								{card.name}
							</p>

							<!-- Description: hidden normally, visible on hover -->
							<p
								class="text-lg font-semibold text-indigo-600 absolute inset-0 flex items-center justify-center
              				 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							>
								{card.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Card group: Yellow -->
		<section class="mb-10">
			<h2 class="text-3xl font-semibold text-yellow-600 mb-6 border-b-2 border-yellow-300 pb-2">
				Yellow Cards
			</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{#each cardsYellow as card}
					<div
						class="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center
         				group cursor-pointer transition-transform transform hover:scale-105"
					>
						<CardImage src={card.image} alt={card.name} className="w-32 h-auto mb-3 rounded-md" />

						<!-- Text container: fixed height to avoid layout shift -->
						<div class="relative h-6 w-full">
							<!-- Name: visible normally -->
							<p
								class="text-lg font-medium text-indigo-900 absolute inset-0 flex items-center justify-center
               					transition-opacity duration-300 group-hover:opacity-0"
							>
								{card.name}
							</p>

							<!-- Description: hidden normally, visible on hover -->
							<p
								class="text-lg font-semibold text-indigo-600 absolute inset-0 flex items-center justify-center
              				 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							>
								{card.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</main>
</div>
