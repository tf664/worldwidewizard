<script>
	import { goto } from '$app/navigation';

	let playerNames = ['', '', '', '', '', ''];
	let playerCount = 3;
	$: playerCount = Math.min(Math.max(playerCount, 3), 6);

	// Entered name validation
	$: allNamesEntered = playerNames.slice(0, playerCount).every((name) => name.trim().length > 0);

	$: allNamesUnique = (() => {
		const activeNames = playerNames.slice(0, playerCount).map((name) => name.trim().toLowerCase());
		const uniqueNames = new Set(activeNames);
		return uniqueNames.size === activeNames.length && !activeNames.includes('');
	})();

	function startGame() {
		if (!allNamesEntered || !allNamesUnique) return;

		const names = playerNames.slice(0, playerCount).map((name) => name.trim());
		localStorage.setItem('players', JSON.stringify(names));
		goto('/game');
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4">
	<div class="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
		<!-- Progress indicator -->
		<div class="mb-6">
			<div class="flex items-center justify-between text-sm text-gray-500 mb-2">
				<span>Step 1 of 2</span>
				<span>Setup Players</span>
			</div>
			<div class="w-full bg-gray-200 rounded-full h-2">
				<div class="bg-indigo-600 h-2 rounded-full w-1/2"></div>
			</div>
		</div>

		<h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">Set Up Game</h1>

		<!-- Player count section -->
		<div class="mb-8">
			<label for="player-count" class="block text-sm font-medium text-gray-700 mb-3">
				How many players?
			</label>
			<div class="space-y-3">
				<input
					id="player-count"
					type="number"
					min="3"
					max="6"
					bind:value={playerCount}
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-lg text-center font-medium"
				/>
				<div class="px-2">
					<input
						type="range"
						bind:value={playerCount}
						min="3"
						max="6"
						class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
						aria-label="Player count slider"
					/>
					<div class="flex justify-between text-xs text-gray-500 mt-1">
						<span>3</span>
						<span>4</span>
						<span>5</span>
						<span>6</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Player names section -->
		<div class="mb-8">
			<h3 class="text-lg font-medium text-gray-900 mb-4">Enter Player Names</h3>
			<div class="space-y-3">
				{#each Array(playerCount) as _, i}
					<div class="relative">
						<input
							type="text"
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pl-12"
							placeholder={`Player ${i + 1} name`}
							bind:value={playerNames[i]}
							required
							aria-label={`Player ${i + 1} name`}
						/>
						<div
							class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-medium text-indigo-600"
						>
							{i + 1}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Action button -->
		<button
			on:click={startGame}
			disabled={!allNamesUnique || !allNamesEntered}
			class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 text-lg shadow-md hover:shadow-lg"
			>{#if !allNamesEntered}
				Enter all player names to continue
			{:else if !allNamesUnique}
				Ensure all names are unique
			{:else}
				Start Game
			{/if}
		</button>

		<!-- Help text -->
		<p class="text-center text-sm text-gray-500 mt-4">You need 3 players to start the game</p>
	</div>
</div>

<style>
	.slider::-webkit-slider-thumb {
		appearance: none;
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: #4f46e5;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.slider::-moz-range-thumb {
		height: 20px;
		width: 20px;
		border-radius: 50%;
		background: #4f46e5;
		cursor: pointer;
		border: none;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
</style>
