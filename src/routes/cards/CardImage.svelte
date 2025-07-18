<script lang="ts">
	export let src: string;
	export let alt: string = '';
	export let className: string = '';

	const fallback = '/rcs/cards-optimized/_placeholder_.webp';
	let errored = false;

	// reactive source
	$: imageSrc = errored ? fallback : src;

	function handleError() {
		errored = true;
	}
</script>

<img src={imageSrc}
	alt={alt}
	class={className}
	on:error={handleError}
/>
