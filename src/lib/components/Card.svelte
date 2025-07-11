<script lang="ts">
	export let name: string;
	export let description: string;
</script>

<div class="p-4 border rounded-lg shadow hover:shadow-lg transition bg-white">
	<h2 class="text-xl font-bold mb-2">{name}</h2>
	<p class="text-gray-600 text-sm">{description}</p>
</div>