<script lang="ts">
	export let src: string;
	export let alt: string = '';
	export let className: string = '';

	const fallback = '/rcs/cards-optimized/_placeholder_.webp';
	let imageSrc = src;

	function handleError() {
		imageSrc = fallback;
	}
</script>

<img src={imageSrc} {alt} class={className} on:error={handleError} />
