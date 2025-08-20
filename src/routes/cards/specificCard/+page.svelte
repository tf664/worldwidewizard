<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import RotatingCard from './specificCard.svelte';

	// Card data from URL parameters
	let cardData = {
		name: '',
		description: '',
		image: '',
		suit: '',
		id: ''
	};

	// Get card back image based on suit
	function getCardBackImage(suit: string): string {
		return '/rcs/cards-optimized/card_back.webp';
	}

	// Extract card data from URL params
	onMount(() => {
		const urlParams = $page.url.searchParams;
		cardData = {
			name: urlParams.get('name') || 'Unknown Card',
			description: urlParams.get('description') || 'No description',
			image: urlParams.get('image') || '/rcs/cards-optimized/_placeholder_.webp',
			suit: urlParams.get('suit') || 'unknown',
			id: urlParams.get('id') || '0'
		};
	});

	$: rulesVisible = cardData.suit === 'zoro' || cardData.suit === 'fool';

	function goBack() {
		goto('/cards');
	}
</script>

<!-- Tab Metadata -->
<svelte:head>
	<title>{cardData.name} - World Wide Wizard</title>
	<meta name="description" content="Detailed view of {cardData.name}: {cardData.description}" />
</svelte:head>

<div
	class="mx-auto max-w-6xl rounded-lg bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 px-4 pb-32 shadow-md"
>
	<!-- Header with Back Button -->
	<div class="mb-8 flex items-center justify-between">
		<button
			on:click={goBack}
			class="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10
				       px-4 py-2 text-white backdrop-blur-sm transition-all
				       duration-300 hover:border-white/30 hover:bg-white/20"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back to Cards
		</button>

		<div class="text-center">
			<h1 class="mb-2 text-4xl font-bold text-white">{cardData.name}</h1>
			<p class="text-xl text-white/80 capitalize">{cardData.suit} Suit</p>
		</div>

		<div class="w-24"></div>
		<!-- Spacer for center alignment -->
	</div>

	<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
		<!-- 3D Rotating Card -->
		<div class="flex justify-center">
			<RotatingCard
				frontImage={cardData.image}
				backImage={getCardBackImage(cardData.suit)}
				cardName={cardData.name}
				suit={cardData.suit}
			/>
		</div>

		<!-- Card Information -->
		<div class="space-y-2 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-lg">
			<div class="space-y-4">
				<div>
					<label for="description" class="mb-2 block text-sm font-medium text-white/70">Description</label>
					<p id="description" class="text-lg text-white/90">{cardData.description}</p>
				</div>
				<div>
					<label for="card-id" class="mb-2 block text-sm font-medium text-white/70">Card ID</label>
					<p id="card-id" class="text-white/80">#{cardData.id}</p>
				</div>
			</div>

			<!-- Game Rules for this card type -->
			{#if rulesVisible}
				<br />
				<div class="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
					<h3 class="mb-4 text-xl font-bold text-white">Special card</h3>
					<div class="space-y-2 text-white/80">
						{#if cardData.suit === 'zoro'}
							<p><strong>Wizard cards</strong> always win tricks, regardless of the trump suit.</p>
						{:else if cardData.suit === 'fool'}
							<p><strong>Fool cards</strong> always lose tricks, cannot win any trick.</p>
						{/if}
						<p class="mt-4 text-sm text-white/60">
							Make sure to keep track of the special traits when planning your moves!
						</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
