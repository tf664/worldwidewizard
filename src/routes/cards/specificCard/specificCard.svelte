<script lang="ts">
	import { spring } from 'svelte/motion';

	// Props
	export let frontImage: string = '/rcs/cards-optimized/_placeholder_.webp';
	export let backImage: string = '/rcs/cards-optimized/card_back.webp';
	export let cardName: string = 'Card';
	export let suit: string = 'white';

	// State
	let dragging = false;
	let startX = 0;
	let baseAngle = 0; // Track the card's resting position
	let cardElement: HTMLDivElement;

	// Smooth spring animation with adaptive parameters
	let angle = spring(0, {
		stiffness: 0.2,
		damping: 0.9
	});

	// Update spring settings based on dragging state
	$: {
		if (dragging) {
			// Faster, more responsive during drag
			angle.stiffness = 0.4;
			angle.damping = 0.7;
		} else {
			// Slower, smoother for release animation
			angle.stiffness = 0.15;
			angle.damping = 0.8;
		}
	}

	// Mouse/Touch event handlers
	function onDown(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		dragging = true;
		startX = e.type.startsWith('touch')
			? (e as TouchEvent).touches[0].clientX
			: (e as MouseEvent).clientX;

		baseAngle = normalizeAngle($angle); // capture starting rotation
		// Change cursor
		if (cardElement) {
			cardElement.style.cursor = 'grabbing';
		}
	}

	// Helper: Normalize angle to [-180, 180)
	function normalizeAngle(angle: number): number {
		angle = angle % 360;
		if (angle >= 180) angle -= 360;
		if (angle < -180) angle += 360;
		return angle;
	}

	// Helper: Find shortest angle difference from a to b
	function shortestAngleDiff(a: number, b: number): number {
		let diff = normalizeAngle(b - a);
		return diff;
	}

	// Turning motion, moving the mouse
function onMove(e: MouseEvent | TouchEvent) {
	if (!dragging) return;
	e.preventDefault();

	const currentX = e.type.startsWith('touch')
		? (e as TouchEvent).touches[0].clientX
		: (e as MouseEvent).clientX;

	const delta = currentX - startX;
	let newAngle = baseAngle + delta * sensitivity;

	newAngle = normalizeAngle(newAngle);
	angle.set(newAngle);
}


	// Turning motion, releasing button
function onUp() {
	dragging = false;
	if (cardElement) cardElement.style.cursor = 'grab';

	const currentAngle = normalizeAngle($angle);

	// snapping distances
	const distTo0 = Math.min(
		Math.abs(currentAngle),
		Math.abs(currentAngle - 360),
		Math.abs(currentAngle + 360)
	);
	const distTo180 = Math.min(
		Math.abs(currentAngle - 180),
		Math.abs(currentAngle - 180 - 360),
		Math.abs(currentAngle - 180 + 360)
	);
	const distToNeg180 = Math.min(
		Math.abs(currentAngle + 180),
		Math.abs(currentAngle + 180 - 360),
		Math.abs(currentAngle + 180 + 360)
	);

	const minDist = Math.min(distTo0, distTo180, distToNeg180);

	let targetAngle: number;
	if (minDist === distTo0) targetAngle = 0;
	else if (minDist === distTo180) targetAngle = 180;
	else targetAngle = -180;

	angle.set(targetAngle);
	baseAngle = targetAngle;  // update baseAngle on release
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

	// Initialize event listeners
	import { onMount } from 'svelte';
	onMount(() => {
		addGlobalListeners();

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
	>
		<div class="inner" style="transform: rotateY({$angle}deg);">
			<!-- Card thickness edges - multiple edges for realistic thickness -->
			<div class="edge edge-top {suit}"></div>
			<div class="edge edge-bottom {suit}"></div>
			<div class="edge edge-side-left {suit}"></div>
			<div class="edge edge-side-right {suit}"></div>

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
	/* Remove transition here to avoid flicker */
	/* transition: transform 0.3s ease; */
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
 	will-change: transform; /* Add for smoother animations */
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

	/* Card edges for realistic 3D thickness effect */
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

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.card {
			width: 400x;
			height: 606px;
		}
	}

	@media (max-width: 480px) {
		.card {
			width: 200px;
			height: 280px;
		}
	}
</style>
