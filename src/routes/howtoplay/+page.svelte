<script lang="ts">
</script>

<div class="prose max-w-none prose-indigo">
    <!-- Hero Section -->
    <div class="mb-12 rounded-lg bg-indigo-600 p-8 text-white">
        <h1 class="mb-4 text-4xl font-bold text-white">The Legend of Wizard</h1>
        <p class="text-lg leading-relaxed text-indigo-100">
            In a time long forgotten, apprentices came from far and wide to the famous Stonehenge Academy
            of Magic. There they trained their magical abilities, including with the game of Wizard. Over
            the millennia, the deeper meaning of this game was lost, leaving behind an entertaining card
            game played by people of all walks of life across all social boundaries.
        </p>
    </div>

    <!-- Objective Section -->
    <div class="mb-10">
        <h2 class="mb-4 text-3xl font-bold text-indigo-700">The Objective</h2>
        <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
            <p class="mb-4 text-lg text-gray-700">
                In this magical card game, you apprentices predict how many tricks you will win. At the end
                of each trick round, you receive experience points for correct predictions.
            </p>
            <p class="text-lg text-gray-700">
                Play multiple rounds with increasingly more cards. Whoever collects the most experience
                points wins and may celebrate as the most talented wizard apprentice!
            </p>
        </div>
    </div>

    <!-- Game Setup -->
    <div class="mb-10">
        <h2 class="mb-4 text-3xl font-bold text-indigo-700">Game Setup</h2>
        <div class="grid gap-6 md:grid-cols-2">
            <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
                <h3 class="mb-3 text-xl font-semibold text-indigo-800">Players & Duration</h3>
                <ul class="space-y-2 text-indigo-700">
                    <li><strong>3-6 players</strong></li>
                    <li><strong>~45 minutes</strong></li>
                    <li><strong>Ages 10+</strong></li>
                </ul>
            </div>
            <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
                <h3 class="mb-3 text-xl font-semibold text-indigo-800">Game Components</h3>
                <ul class="space-y-2 text-indigo-700">
                    <li><strong>60 cards total</strong></li>
                    <li>Cards 1-13 in 4 colors</li>
                    <li>4 Wizard cards</li>
                    <li>4 Fool cards</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- How to Play -->
    <div class="mb-10">
        <h2 class="mb-6 text-3xl font-bold text-indigo-700">How to Play</h2>

        <div class="mb-8 rounded-lg border border-indigo-200 bg-indigo-50 p-6">
            <h3 class="mb-4 text-2xl font-semibold text-indigo-800">Game Structure</h3>
            <p class="mb-4 text-indigo-700">
                Each round consists of four phases, and you play with more cards each round:
            </p>
            <ul class="list-inside list-disc space-y-2 text-indigo-700">
                <li><strong>Round 1:</strong> 1 card each (1 trick)</li>
                <li><strong>Round 2:</strong> 2 cards each (2 tricks)</li>
                <li><strong>Round 3:</strong> 3 cards each (3 tricks)</li>
                <li>...and so on until all cards are dealt</li>
            </ul>
        </div>

        <!-- Four Phases -->
        <div class="space-y-8">
            <!-- Phase 1: Deal Cards -->
            <div class="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-6">
                <h3 class="mb-4 text-2xl font-semibold text-indigo-800">
                    <span
                        class="mr-2 inline-block h-8 w-8 rounded-full bg-indigo-500 text-center text-lg font-bold text-white"
                        >1</span
                    >
                    Deal the Cards
                </h3>
                <div class="space-y-4 text-gray-700">
                    <p>Deal the appropriate number of cards for the current round to each player.</p>
                    <p>Place remaining cards face-down, then flip the top card to determine trump:</p>
                    <ul class="ml-6 space-y-2">
                        <li class="flex items-center">
                            <span class="mr-2 text-red-500"></span>
                            <strong>Number card:</strong> Its color becomes trump
                        </li>
                        <li class="flex items-center">
                            <span class="mr-2 text-purple-500"></span>
                            <strong>Wizard (Zoro):</strong> Dealer chooses trump color
                        </li>
                        <li class="flex items-center">
                            <span class="mr-2 text-gray-500"></span>
                            <strong>Fool:</strong> No trump this round
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Phase 2: Predict -->
            <div class="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-6">
                <h3 class="mb-4 text-2xl font-semibold text-indigo-800">
                    <span
                        class="mr-2 inline-block h-8 w-8 rounded-full bg-indigo-500 text-center text-lg font-bold text-white"
                        >2</span
                    >
                    Make Predictions
                </h3>
                <div class="space-y-4 text-gray-700">
                    <p>Look at your cards and predict how many tricks you'll win this round.</p>
                    <p>
                        Starting with the player left of the dealer, each player announces their prediction.
                    </p>
                    <div class="mt-4 rounded bg-indigo-100 p-4">
                        <p class="text-sm text-indigo-800">
                            <strong>Tip:</strong> The total predictions don't have to equal the number of tricks available!
                        </p>
                    </div>
                </div>
            </div>

            <!-- Phase 3: Play Tricks -->
            <div class="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-6">
                <h3 class="mb-4 text-2xl font-semibold text-indigo-800">
                    <span
                        class="mr-2 inline-block h-8 w-8 rounded-full bg-indigo-500 text-center text-lg font-bold text-white"
                        >3</span
                    >
                    Play the Tricks
                </h3>
                <div class="space-y-4 text-gray-700">
                    <h4 class="text-lg font-semibold text-indigo-800">Playing Rules:</h4>
                    <ul class="space-y-3">
                        <li><strong>Lead player:</strong> Can play any card</li>
                        <li><strong>Following players:</strong> Must follow suit if possible</li>
                        <li><strong>No matching suit?</strong> Play any card (including trump)</li>
                        <li><strong>Wizards & Fools:</strong> Can always be played, regardless of suit</li>
                    </ul>

                    <h4 class="mt-6 text-lg font-semibold text-indigo-800">Who Wins the Trick:</h4>
                    <ol class="space-y-2">
                        <li>
                            <span class="font-semibold text-indigo-600">1st priority:</span> First Wizard played
                        </li>
                        <li>
                            <span class="font-semibold text-indigo-600">2nd priority:</span> Highest trump card
                        </li>
                        <li>
                            <span class="font-semibold text-indigo-600">3rd priority:</span> Highest card of led suit
                        </li>
                        <li>
                            <span class="font-semibold text-gray-600">Note:</span> Fools never win (except if only
                            Fools are played)
                        </li>
                    </ol>
                </div>
            </div>

            <!-- Phase 4: Score -->
            <div class="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-6">
                <h3 class="mb-4 text-2xl font-semibold text-indigo-800">
                    <span
                        class="mr-2 inline-block h-8 w-8 rounded-full bg-indigo-500 text-center text-lg font-bold text-white"
                        >4</span
                    >
                    Calculate Experience Points
                </h3>
                <div class="space-y-4 text-gray-700">
                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="rounded bg-indigo-100 p-4">
                            <h4 class="mb-2 font-semibold text-indigo-800">Correct Prediction</h4>
                            <p class="text-indigo-700">
                                <strong>20 points bonus</strong><br />
                                <strong>+10 points</strong> per trick won
                            </p>
                        </div>
                        <div class="rounded bg-indigo-100 p-4">
                            <h4 class="mb-2 font-semibold text-indigo-800">Wrong Prediction</h4>
                            <p class="text-indigo-700">
                                <strong>-10 points</strong> for each trick difference
                            </p>
                        </div>
                    </div>

                    <div class="mt-4 rounded bg-indigo-100 p-4">
                        <h4 class="mb-2 font-semibold text-indigo-800">Scoring Example:</h4>
                        <ul class="space-y-1 text-sm text-indigo-700">
                            <li><strong>Predicted 2, won 2:</strong> 20 + 10 + 10 = 40 points</li>
                            <li><strong>Predicted 0, won 0:</strong> 20 points</li>
                            <li><strong>Predicted 3, won 1:</strong> -20 points (2 tricks off)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Special Cards -->
    <div class="mb-10">
        <h2 class="mb-6 text-3xl font-bold text-indigo-700">Special Cards</h2>
        <div class="grid gap-6 md:grid-cols-2">
            <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
                <h3 class="mb-3 text-xl font-semibold text-indigo-800">Wizard (Zoro)</h3>
                <ul class="space-y-2 text-indigo-700">
                    <li>• Always wins the trick when played first</li>
                    <li>• If leading with Wizard, others can play any card</li>
                    <li>• When flipped for trump, dealer chooses trump suit</li>
                </ul>
            </div>
            <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
                <h3 class="mb-3 text-xl font-semibold text-indigo-800">Fool</h3>
                <ul class="space-y-2 text-indigo-700">
                    <li>• Never wins a trick (except if only Fools played)</li>
                    <li>• Can be played anytime, regardless of suit</li>
                    <li>• When flipped for trump, there is no trump this round</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Game End -->
    <div class="mb-10">
        <h2 class="mb-4 text-3xl font-bold text-indigo-700">Winning the Game</h2>
        <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
            <h3 class="mb-3 text-xl font-semibold text-indigo-800">Game Length by Player Count:</h3>
            <div class="grid gap-4 text-center md:grid-cols-2 lg:grid-cols-4">
                <div class="rounded bg-white p-4 shadow">
                    <div class="text-2xl font-bold text-indigo-600">3</div>
                    <div class="text-sm text-gray-600">Players</div>
                    <div class="text-lg font-semibold">20 Rounds</div>
                </div>
                <div class="rounded bg-white p-4 shadow">
                    <div class="text-2xl font-bold text-indigo-600">4</div>
                    <div class="text-sm text-gray-600">Players</div>
                    <div class="text-lg font-semibold">15 Rounds</div>
                </div>
                <div class="rounded bg-white p-4 shadow">
                    <div class="text-2xl font-bold text-indigo-600">5</div>
                    <div class="text-sm text-gray-600">Players</div>
                    <div class="text-lg font-semibold">12 Rounds</div>
                </div>
                <div class="rounded bg-white p-4 shadow">
                    <div class="text-2xl font-bold text-indigo-600">6</div>
                    <div class="text-sm text-gray-600">Players</div>
                    <div class="text-lg font-semibold">10 Rounds</div>
                </div>
            </div>
            <p class="mt-6 text-lg text-indigo-700">
                <strong>Winner:</strong> The apprentice with the most experience points! In case of a tie,
                multiple winners share the victory.
            </p>
        </div>
    </div>

    <!-- Strategy Tips -->
    <div class="mb-10">
        <h2 class="mb-4 text-3xl font-bold text-indigo-700">Strategy Tips</h2>
        <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <h4 class="mb-2 font-semibold text-indigo-800">Prediction Strategy</h4>
                <ul class="space-y-1 text-sm text-indigo-700">
                    <li>• Count your high cards and trumps</li>
                    <li>• Consider Wizards as guaranteed tricks</li>
                    <li>• Fools can help avoid unwanted tricks</li>
                </ul>
            </div>
            <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <h4 class="mb-2 font-semibold text-indigo-800">Playing Strategy</h4>
                <ul class="space-y-1 text-sm text-indigo-700">
                    <li>• Lead with high cards to take tricks</li>
                    <li>• Use Fools to avoid winning tricks</li>
                    <li>• Watch others' predictions to plan</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Variants -->
    <div class="mb-10">
        <h2 class="mb-4 text-3xl font-bold text-indigo-700">Game Variant</h2>
        <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-6">
            <h3 class="mb-3 text-xl font-semibold text-indigo-800">Plus/Minus One Variant</h3>
            <p class="mb-3 text-indigo-700">
                The total of all predictions cannot equal the number of available tricks in that round.
            </p>
            <div class="rounded bg-indigo-100 p-4">
                <p class="text-sm text-indigo-800">
                    <strong>Example:</strong> In round 5 with 5 tricks available, players must predict a total
                    that's either less than 5 or greater than 5 tricks combined.
                </p>
            </div>
        </div>
    </div>


	<!-- Call to Action -->
	<div class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-center text-white">
		<h2 class="mb-4 text-3xl font-bold">Ready to Begin Your Magical Journey?</h2>
		<p class="mb-6 text-lg text-indigo-100">
			Master the art of prophecy and become the greatest wizard apprentice!
		</p>
		<a
			href="/"
			class="inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-indigo-700 transition-transform hover:scale-105"
		>
			Start Playing Now
		</a>
	</div>
</div>
