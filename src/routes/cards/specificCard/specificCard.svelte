<script lang="ts">
	import { spring } from 'svelte/motion';
	import { onMount } from 'svelte';

	// Component Props
	export let frontImage: string = '/rcs/cards-optimized/_placeholder_.webp';
	export let backImage: string = '/rcs/cards-optimized/card_back.webp';
	export let cardName: string = 'Card';
	export let suit: string = 'white';

	// Configuration Constants
	const SENSITIVITY = 0.5;
	const SNAP_ANGLE = 180;
	const SPRING_CONFIG = {
		dragging: { stiffness: 0.4, damping: 0.7 },
		idle: { stiffness: 0.15, damping: 0.4 }
	};

	// Component State
	let dragging = false;
	let startX = 0;
	let baseAngle = 0;
	let cardElement: HTMLDivElement;

	// Animation State
	let angle = spring(baseAngle, SPRING_CONFIG.idle);

	// Reactive Statements
	$: updateSpringSettings(dragging);

	/**
	 * Updates spring animation settings based on dragging state
	 */
	function updateSpringSettings(isDragging: boolean) {
		const config = isDragging ? SPRING_CONFIG.dragging : SPRING_CONFIG.idle;
		angle.stiffness = config.stiffness;
		angle.damping = config.damping;
	}

	/**
	 * Handles mouse/touch down events to start dragging
	 */
	function onDown(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		dragging = true;
		startX = e.type.startsWith('touch')
			? (e as TouchEvent).touches[0].clientX
			: (e as MouseEvent).clientX;

		baseAngle = $angle;

		if (cardElement) {
			cardElement.style.cursor = 'grabbing';
		}
	}

	/**
	 * Handles mouse/touch move events for card rotation while dragging
	 */
	function onMove(e: MouseEvent | TouchEvent) {
		if (!dragging) return;
		e.preventDefault();

		const currentX = e.type.startsWith('touch')
			? (e as TouchEvent).touches[0].clientX
			: (e as MouseEvent).clientX;

		const delta = currentX - startX;
		const newAngle = baseAngle + delta * SENSITIVITY;

		angle.set(newAngle);
	}

	/**
	 * Handles mouse/touch up events to stop dragging and snap to nearest position
	 */
	function onUp() {
		dragging = false;

		if (cardElement) {
			cardElement.style.cursor = 'grab';
		}

		// Snap to the nearest 180°
		const currentAngle = $angle;
		const nearest = Math.round(currentAngle / SNAP_ANGLE) * SNAP_ANGLE;
		angle.set(nearest);
		baseAngle = nearest;
	}

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

	// Lifecycle
	onMount(() => {
		addGlobalListeners();
		return removeGlobalListeners;
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
	>
		<div class="inner" style="transform: rotateY({$angle}deg);">
			<!-- Card thickness edges -->
			<div class="edge edge-side-left {suit}"></div>
			<div class="edge edge-side-right {suit}"></div>

			<!-- Front face -->
			<div class="face front">
				<img src={frontImage} alt="{cardName} front" loading="eager" draggable="false" />
				<div class="card-shine"></div>
			</div>

			<!-- Backside -->
			<div class="face back">
				<img src={backImage} alt="{cardName} back" loading="eager" draggable="false" />
				<div class="card-shine"></div>
			</div>
		</div>
	</div>
</div>

<style>
	:root {
		--card-width: 280px;
		--card-height: 390px;
		--card-thickness: 2px;
		--half-thickness: calc(var(--card-thickness) / 2);
	}

	.card-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		user-select: none;
	}

	/* Main Card Element */
	.card {
		width: 280px;
		height: 390px;
		perspective: 1200px;
		cursor: grab;
		touch-action: none;
		position: relative;
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
		transition: none;
		will-change: transform;
	}
	
	.face {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
			inset 0 0 0 2px rgba(255, 255, 255, 0.4),
			0 2px 8px rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.face img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		border-radius: 11px;
	}

	.front {
		transform: translateZ(var(--half-thickness));
	}

	.back {
		transform: rotateY(180deg) translateZ(var(--half-thickness));
	}

	/* Card Edges */
	.edge {
		position: absolute;
	}

	.edge.blue {
		background: linear-gradient(135deg, #3730a3, #4338ca, #4f46e5, #6366f1);
	}

	.edge.red {
		background: linear-gradient(135deg, #b91c1c, #dc2626, #ef4444, #f87171);
	}

	.edge.green {
		background: linear-gradient(135deg, #166534, #16a34a, #22c55e, #4ade80);
	}

	.edge.yellow {
		background: linear-gradient(135deg, #ca8a04, #eab308, #facc15, #fde047);
	}

	.edge.zoro {
		background: linear-gradient(135deg, #f472b6, #a855f7, #3b82f6, #60a5fa);
	}

	.edge.fool {
		background: linear-gradient(135deg, #f87171, #fde047, #3b82f6, #60a5fa);
	}

	.edge-side-left {
		width: var(--card-thickness);
		height: 100%;
		top: 0;
		left: 0;
		transform: rotateY(-90deg);
		transform-origin: left center;
		clip-path: inset(12px 0 12px 0 round 0 12px 12px 0);
	}

	.edge-side-right {
		width: var(--card-thickness);
		height: 100%;
		top: 0;
		right: 0;
		transform: rotateY(90deg);
		transform-origin: right center;
		clip-path: inset(12px 0 12px 0 round 12px 0 0 12px);
	}

	/* Holographic Shine Effect */
	.card-shine {
		position: absolute;
		top: -10%;
		left: -150%;
		width: 120%;
		height: 120%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			transparent 20%,
			rgba(255, 255, 255, 0.1) 35%,
			rgba(255, 255, 255, 0.4) 50%,
			rgba(255, 255, 255, 0.1) 65%,
			transparent 80%,
			transparent 100%
		);
		transform: skewX(-25deg);
		animation: shine 4s infinite;
		pointer-events: none;
		border-radius: 12px;
	}

	@keyframes shine {
		0% {
			left: -150%;
		}
		15% {
			left: -150%;
		}
		85% {
			left: 130%;
		}
		100% {
			left: 130%;
		}
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.card {
			width: 240px;
			height: 336px;
		}
	}

	@media (max-width: 480px) {
		.card {
			width: 200px;
			height: 280px;
		}
	}
</style>
