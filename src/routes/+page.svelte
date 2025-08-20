<script lang="ts">
	import { user } from '$lib/stores/user';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Component State
	let count = 0;
	let name = '';
	let username = '';
	let savedMessage = '';
	let mounted = false;

	// Navigation Functions
	const start = () => goto('/setup');
	const startOnline = () => goto('/onlinesetup');
	const viewAbout = () => goto('/about');
	const viewCards = () => goto('/cards');
	const viewHowToPlay = () => goto('/howtoplay');

	// Animation on mount - use requestAnimationFrame for better performance
	onMount(() => {
		requestAnimationFrame(() => {
			mounted = true;
		});
	});
</script>

<svelte:head>
	<title>World Wide Wizard - Strategic Card Game</title>
	<meta
		name="description"
		content="Play the strategic trick-taking card game Wizard online with friends. Master the art of precise bidding and tactical card play."
	/>
	<meta name="keywords" content="wizard, card game, online game, multiplayer, strategy" />
</svelte:head>

<!-- Full viewport background that works with navbar -->
<div class="page-container">
	<!-- Animated background elements -->
	<div class="background-animation" aria-hidden="true">
		<div class="floating-card card-1"></div>
		<div class="floating-card card-2"></div>
		<div class="floating-card card-3"></div>
		<div class="floating-card card-4"></div>
		<div class="floating-card card-5"></div>
		<div class="floating-card card-6"></div>
		<div class="floating-card card-7"></div>
		<div class="floating-card card-8"></div>
		<div class="floating-card card-9"></div>
		<div class="floating-card card-10"></div>
		<div class="floating-card card-11"></div>
		<div class="floating-card card-12"></div>
	</div>

	<!-- Main Content Container -->
	<div class="content-wrapper">
		<!-- ...existing code... -->
		<!-- Header Section -->
		<header class="header {mounted ? 'visible' : 'hidden'}">
			<!-- Logo/Title -->
			<h1 class="title">Wizard</h1>

			<!-- Subtitle -->
			<p class="subtitle">Master the Art of Strategic Bidding</p>

			<!-- Description -->
			<p class="description">The ultimate trick-taking card game where precision beats ambition</p>
		</header>

		<!-- Main Action Panel -->
		<main class="main-panel {mounted ? 'visible' : 'hidden'}">
			<div class="action-container">
				<!-- Primary Actions -->
				<div class="primary-actions">
					<button type="button" on:click={start} class="btn btn-primary btn-local">
						<span class="btn-content">
							<svg
								class="btn-icon"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							Start Local Game
						</span>
					</button>

					<button type="button" on:click={startOnline} class="btn btn-primary btn-online">
						<span class="btn-content">
							<svg
								class="btn-icon"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
								/>
							</svg>
							Play Online
						</span>
					</button>
				</div>

				<!-- Secondary Actions -->
				<div class="secondary-actions">
					<button type="button" on:click={viewHowToPlay} class="btn btn-secondary">
						<svg
							class="btn-icon-small"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
							/>
						</svg>
						How to Play
					</button>

					<button type="button" on:click={viewCards} class="btn btn-secondary">
						<svg
							class="btn-icon-small"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
							/>
						</svg>
						View Cards
					</button>

					<button type="button" on:click={viewAbout} class="btn btn-secondary">
						<svg
							class="btn-icon-small"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						About Game
					</button>
				</div>
			</div>
		</main>

		<!-- Debug counter (can be removed in production) -->
		{#if count > 0}
			<div class="debug-counter {mounted ? 'visible' : 'hidden'}">
				<button type="button" on:click={() => count++} class="btn btn-debug">
					Debug clicks: {count}
				</button>
			</div>
		{/if}

		<!-- Footer -->
		<footer class="footer {mounted ? 'visible' : 'hidden'}">
			<p>© 2024 World Wide Wizard • Digital adaptation of the classic card game</p>
		</footer>
	</div>
</div>

<style>
	/* CSS Custom Properties for better maintainability */
	:root {
		--animation-duration: 0.3s;
		--animation-timing: ease-out;
	}

	/* Base layout classes */
	.page-container {
		position: relative;
		min-height: 100vh;
		background: linear-gradient(135deg, #1e1b4b, #581c87, #be185d);
	}

	.background-animation {
		position: absolute;
		inset: 0;
		opacity: 0.15;
		pointer-events: none;
		overflow: hidden;
	}

	.content-wrapper {
		position: relative;
		z-index: 10;
		display: flex;
		min-height: 100vh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
	}

	/* Header styles */
	.header {
		margin-bottom: 3rem;
		text-align: center;
		transform: translateY(2rem);
		opacity: 0;
		transition:
			transform var(--animation-duration) var(--animation-timing),
			opacity var(--animation-duration) var(--animation-timing);
	}

	.header.visible {
		transform: translateY(0);
		opacity: 1;
	}

	.title {
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #fbbf24, #ec4899, #9333ea);
		background-clip: text;
		font-size: clamp(3.5rem, 8vw, 6rem);
		font-weight: 900;
		letter-spacing: -0.025em;
		color: transparent;
		/* Simplified glow effect */
		filter: drop-shadow(0 0 1rem rgba(255, 255, 255, 0.3));
	}

	.subtitle {
		margin: 0 auto 0.5rem;
		max-width: 32rem;
		font-size: clamp(1.25rem, 3vw, 1.5rem);
		font-weight: 300;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.8);
	}

	.description {
		margin: 0 auto;
		max-width: 24rem;
		font-size: 1.125rem;
		color: rgba(255, 255, 255, 0.6);
	}

	/* Main panel styles */
	.main-panel {
		width: 100%;
		max-width: 28rem;
		transform: translateY(2rem);
		opacity: 0;
		transition:
			transform var(--animation-duration) var(--animation-timing) 0.1s,
			opacity var(--animation-duration) var(--animation-timing) 0.1s;
	}

	.main-panel.visible {
		transform: translateY(0);
		opacity: 1;
	}

	.action-container {
		border-radius: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background-color: rgba(255, 255, 255, 0.1);
		padding: 2rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(16px);
	}

	.primary-actions {
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Button base styles */
	.btn {
		position: relative;
		width: 100%;
		border: none;
		border-radius: 1rem;
		font-weight: 600;
		transition:
			transform var(--animation-duration) var(--animation-timing),
			box-shadow var(--animation-duration) var(--animation-timing);
		cursor: pointer;
		overflow: hidden;
	}

	.btn:hover {
		transform: scale(1.02);
	}

	.btn:active {
		transform: scale(0.98);
	}

	/* Primary button styles */
	.btn-primary {
		padding: 1rem 2rem;
		font-size: 1.25rem;
		color: white;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	.btn-local {
		background: linear-gradient(135deg, #4338ca, #7c3aed);
	}

	.btn-local:hover {
		background: linear-gradient(135deg, #3730a3, #6d28d9);
		box-shadow: 0 20px 25px -5px rgba(67, 56, 202, 0.25);
	}

	.btn-online {
		background: linear-gradient(135deg, #059669, #0d9488);
	}

	.btn-online:hover {
		background: linear-gradient(135deg, #047857, #0f766e);
		box-shadow: 0 20px 25px -5px rgba(5, 150, 105, 0.25);
	}

	/* Secondary button styles */
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		font-size: 1.125rem;
		color: white;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1));
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.secondary-actions .btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		text-align: center;
	}

	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}

		.secondary-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding-top: 1rem;
	}


	/* Button content and icons */
	.btn-content {
		position: relative;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.btn-icon {
		width: 1.5rem;
		height: 1.5rem;
		transition: transform var(--animation-duration) var(--animation-timing);
		flex-shrink: 0; /* Prevent icon from shrinking */
	}

	.btn-icon-small {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0; /* Prevent icon from shrinking */
	}

	.btn:hover .btn-icon {
		transform: scale(1.1);
	}

	/* Footer and debug styles */
	.footer,
	.debug-counter {
		margin-top: 4rem;
		text-align: center;
		transform: translateY(1rem);
		opacity: 0;
		transition:
			transform var(--animation-duration) var(--animation-timing) 0.2s,
			opacity var(--animation-duration) var(--animation-timing) 0.2s;
	}

	.footer.visible,
	.debug-counter.visible {
		transform: translateY(0);
		opacity: 1;
	}

	.footer {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.4);
	}

	.btn-debug {
		border: 1px solid rgba(255, 255, 255, 0.2);
		background-color: rgba(255, 255, 255, 0.1);
		padding: 0.5rem 1rem;
		color: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(4px);
	}

	.btn-debug:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}

	/* Enhanced floating cards - now with 6 cards in various sizes and positions */
	.floating-card {
		position: absolute;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
		border-radius: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(8px);
		will-change: transform;
	}

	/* Primary cards - larger and more prominent */
	.card-1 {
		width: 5rem;
		height: 7rem;
		top: 8%;
		left: 8%;
		animation: float-primary 12s ease-in-out infinite;
	}

	.card-2 {
		width: 4.5rem;
		height: 6.3rem;
		bottom: 15%;
		right: 12%;
		animation: float-primary 14s ease-in-out infinite reverse;
	}

	/* Secondary cards - medium size */
	.card-3 {
		width: 3.5rem;
		height: 4.9rem;
		top: 20%;
		right: 5%;
		animation: float-secondary 10s ease-in-out infinite 2s;
	}

	.card-4 {
		width: 4rem;
		height: 5.6rem;
		bottom: 8%;
		left: 15%;
		animation: float-secondary 11s ease-in-out infinite reverse 1s;
	}

	/* Accent cards - smaller and more subtle */
	.card-5 {
		width: 2.5rem;
		height: 3.5rem;
		top: 50%;
		left: 5%;
		animation: float-accent 8s ease-in-out infinite 3s;
	}

	.card-6 {
		width: 3rem;
		height: 4.2rem;
		top: 60%;
		right: 8%;
		animation: float-accent 9s ease-in-out infinite reverse 4s;
	}
	/* Additional primary cards */
	.card-7 {
		width: 4.2rem;
		height: 5.9rem;
		top: 70%;
		left: 20%;
		animation: float-primary 13s ease-in-out infinite 1.5s;
	}

	.card-8 {
		width: 3.8rem;
		height: 5.3rem;
		top: 25%;
		left: 50%;
		animation: float-secondary 9s ease-in-out infinite reverse 2.5s;
	}

	/* More secondary cards */
	.card-9 {
		width: 3.2rem;
		height: 4.5rem;
		bottom: 40%;
		right: 25%;
		animation: float-secondary 12s ease-in-out infinite 3.5s;
	}

	.card-10 {
		width: 2.8rem;
		height: 3.9rem;
		top: 40%;
		left: 25%;
		animation: float-accent 7s ease-in-out infinite reverse 4.5s;
	}

	/* More accent cards */
	.card-11 {
		width: 2.2rem;
		height: 3.1rem;
		bottom: 25%;
		left: 40%;
		animation: float-accent 6s ease-in-out infinite 5s;
	}

	.card-12 {
		width: 2.6rem;
		height: 3.6rem;
		bottom: 50%;
		right: 40%;
		animation: float-primary 11s ease-in-out infinite reverse 6s;
	}

	/* Animation keyframes for different card types */
	@keyframes float-primary {
		0%,
		100% {
			transform: translate3d(0, 0, 0) rotate(0deg);
		}
		25% {
			transform: translate3d(15px, -10px, 0) rotate(1deg);
		}
		50% {
			transform: translate3d(8px, -25px, 0) rotate(3deg);
		}
		75% {
			transform: translate3d(-5px, -15px, 0) rotate(-1deg);
		}
	}

	@keyframes float-secondary {
		0%,
		100% {
			transform: translate3d(0, 0, 0) rotate(0deg);
		}
		33% {
			transform: translate3d(12px, -8px, 0) rotate(-2deg);
		}
		66% {
			transform: translate3d(-8px, -18px, 0) rotate(2deg);
		}
	}

	@keyframes float-accent {
		0%,
		100% {
			transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
		}
		50% {
			transform: translate3d(6px, -12px, 0) rotate(1deg) scale(1.05);
		}
	}

	/* Responsive optimizations */
	@media (max-width: 768px) {
		.floating-card {
			position: absolute;
			border-radius: 0.75rem;
			border: 2px solid rgba(255, 255, 255, 0.15);
			backdrop-filter: blur(12px);
			will-change: transform;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		}
		/* Card color variations for better visibility */
		.card-1 {
			background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.08));
			border-color: rgba(251, 191, 36, 0.3);
		}

		.card-2 {
			background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.08));
			border-color: rgba(236, 72, 153, 0.3);
		}

		.card-3 {
			background: linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(147, 51, 234, 0.08));
			border-color: rgba(147, 51, 234, 0.3);
		}

		.card-4 {
			background: linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(5, 150, 105, 0.08));
			border-color: rgba(5, 150, 105, 0.3);
		}

		.card-5 {
			background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08));
			border-color: rgba(59, 130, 246, 0.3);
		}

		.card-6 {
			background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08));
			border-color: rgba(239, 68, 68, 0.3);
		}

		.card-7 {
			background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.08));
			border-color: rgba(168, 85, 247, 0.3);
		}

		.card-8 {
			background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08));
			border-color: rgba(34, 197, 94, 0.3);
		}

		.card-9 {
			background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.08));
			border-color: rgba(249, 115, 22, 0.3);
		}

		.card-10 {
			background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(14, 165, 233, 0.08));
			border-color: rgba(14, 165, 233, 0.3);
		}

		.card-11 {
			background: linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(244, 63, 94, 0.08));
			border-color: rgba(244, 63, 94, 0.3);
		}

		.card-12 {
			background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08));
			border-color: rgba(16, 185, 129, 0.3);
		}

		.content-wrapper {
			padding: 2rem 1rem;
		}

		.action-container {
			padding: 1.5rem;
		}
	}

	@media (max-width: 768px) {
		.floating-card {
			opacity: 0.9;
		}

		.card-1,
		.card-2,
		.card-7,
		.card-12 {
			width: 3.75rem;
			height: 5.25rem;
		}

		.card-3,
		.card-4,
		.card-8,
		.card-9 {
			width: 2.8rem;
			height: 3.9rem;
		}

		.card-5,
		.card-6,
		.card-10,
		.card-11 {
			width: 2rem;
			height: 2.8rem;
		}

		.content-wrapper {
			padding: 2rem 1rem;
		}

		.action-container {
			padding: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		/* Hide more cards on very small screens for performance */
		.card-5,
		.card-6,
		.card-9,
		.card-10,
		.card-11,
		.card-12 {
			display: none;
		}
	}
	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.floating-card {
			animation: none;
		}

		.title {
			filter: none;
		}

		.btn {
			transition: none;
		}
	}
</style>
