<script lang="ts">
	import { spring } from 'svelte/motion';

	// Props
	export let frontImage: string = '/rcs/cards-optimized/_placeholder_.webp';
	export let backImage: string = '/rcs/cards-optimized/card_back.webp';
	export let cardName: string = 'Card';

	// State
	let dragging = false;
	let startX = 0;
	let cardElement: HTMLDivElement;

	// Smooth spring animation
	let angle = spring(0, {
		stiffness: 0.3,
		damping: 0.6
	});

	// Mouse/Touch event handlers
	function onDown(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		dragging = true;
		startX = e.type.startsWith('touch')
			? (e as TouchEvent).touches[0].clientX
			: (e as MouseEvent).clientX;

		// Change cursor
		if (cardElement) {
			cardElement.style.cursor = 'grabbing';
		}
	}

	function onMove(e: MouseEvent | TouchEvent) {
		if (!dragging) return;
		e.preventDefault();

		const currentX = e.type.startsWith('touch')
			? (e as TouchEvent).touches[0].clientX
			: (e as MouseEvent).clientX;

		const delta = currentX - startX;
		// Smooth rotation with limits
		const newAngle = Math.max(-180, Math.min(180, delta * 0.8));
		angle.set(newAngle);
	}

	function onUp() {
		dragging = false;

		// Reset cursor
		if (cardElement) {
			cardElement.style.cursor = 'grab';
		}

		// Auto-complete rotation if past halfway
		if ($angle > 90) {
			angle.set(180);
		} else if ($angle < -90) {
			angle.set(-180);
		} else {
			angle.set(0);
		}
	}

	// Global event listeners to handle mouse up outside element
	function addGlobalListeners() {
		document.addEventListener('mouseup', onUp);
		document.addEventListener('mousemove', onMove);
		document.addEventListener('touchend', onUp);
		document.addEventListener('touchmove', onMove, { passive: false });
	}

	function removeGlobalListeners() {
		document.removeEventListener('mouseup', onUp);
		document.removeEventListener('mousemove', onMove);
		document.removeEventListener('touchend', onUp);
		document.removeEventListener('touchmove', onMove);
	}

	// Auto-rotation demo
	let autoRotating = false;
	function startAutoRotation() {
		if (autoRotating || dragging) return;

		autoRotating = true;
		angle.set(180);

		setTimeout(() => {
			angle.set(0);
			setTimeout(() => {
				autoRotating = false;
			}, 1000);
		}, 2000);
	}

	// Start auto rotation after a delay
	import { onMount } from 'svelte';
	onMount(() => {
		addGlobalListeners();

		// Demo rotation after 2 seconds
		setTimeout(startAutoRotation, 2000);

		return () => {
			removeGlobalListeners();
		};
	});
</script>

<div class="card-container">
	<div
		bind:this={cardElement}
		class="card"
		on:mousedown={onDown}
		on:touchstart={onDown}
		role="button"
		tabindex="0"
		aria-label="Rotate {cardName} card"
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				startAutoRotation();
			}
		}}
	>
		<div class="inner" style="transform: rotateY({$angle}deg);">
			<!-- Card thickness edges - multiple edges for realistic thickness -->
			<div class="edge edge-top"></div>
			<div class="edge edge-bottom"></div>
			<div class="edge edge-side-left"></div>
			<div class="edge edge-side-right"></div>

			<!-- Front face -->
			<div class="face front">
				<img src={frontImage} alt="{cardName} front" loading="eager" draggable="false" />
				<div class="card-shine"></div>
			</div>

			<!-- Back face -->
			<div class="face back">
				<img src={backImage} alt="{cardName} back" loading="eager" draggable="false" />
				<div class="card-shine"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.card-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		user-select: none;
	}

	.card {
		width: 280px;
		height: 390px;
		perspective: 1200px;
		cursor: grab;
		touch-action: none;
		position: relative;
		transition: transform 0.3s ease;
		filter: drop-shadow(0 8px 25px rgba(0, 0, 0, 0.25));
	}

	.card:hover {
		transform: scale(1.02);
	}

	.card:active {
		cursor: grabbing;
	}

	.inner {
		width: 100%;
		height: 100%;
		position: relative;
		transform-style: preserve-3d;
		transition: none; /* Handled by spring animation */
	}

	/* Card thickness - realistic trading card thickness */
	:root {
		--card-width: 280px;
		--card-height: 390px;
		--card-thickness: 2px; /* More realistic card thickness */
		--half-thickness: calc(var(--card-thickness) / 2);
	}

	.face {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 
			inset 0 0 0 1px rgba(255, 255, 255, 0.1),
			0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.face img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Faces positioned for realistic thickness */
	.front {
		transform: translateZ(var(--half-thickness));
	}

	.back {
		transform: rotateY(180deg) translateZ(var(--half-thickness));
	}

	/* Card edges for realistic 3D thickness effect */
	.edge {
		position: absolute;
		background: linear-gradient(135deg, #e8d8b4 0%, #d4c4a0 30%, #b8956a 70%, #a0896b 100%);
	}

	/* Left edge */
	.edge-side-left {
		width: var(--card-thickness);
		height: 100%;
		top: 0;
		left: 0;
		transform: rotateY(-90deg);
		transform-origin: left center;
		clip-path: inset(12px 0 12px 0 round 0 12px 12px 0);
	}

	/* Right edge */
	.edge-side-right {
		width: var(--card-thickness);
		height: 100%;
		top: 0;
		right: 0;
		transform: rotateY(90deg);
		transform-origin: right center;
		clip-path: inset(12px 0 12px 0 round 12px 0 0 12px);
	}

	/* Enhanced holographic shine effect */
	.card-shine {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.15) 25%,
			rgba(255, 255, 255, 0.4) 50%,
			rgba(255, 255, 255, 0.15) 75%,
			transparent 100%
		);
		transform: skewX(-25deg);
		animation: shine 4s infinite;
		pointer-events: none;
		border-radius: 12px;
	}

	@keyframes shine {
		0% {
			left: -100%;
		}
		20% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.card {
			width: 240px;
			height: 335px;
		}
	}

	@media (max-width: 480px) {
		.card {
			width: 200px;
			height: 280px;
		}
	}
</style>
