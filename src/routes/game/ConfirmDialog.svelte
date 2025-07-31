<script lang="ts">
	export let show = false;
	export let title = '';
	export let message = '';
	export let onConfirm: () => void;
	export let onCancel: () => void;
</script>

{#if show}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
			<h3 class="text-lg font-bold mb-2">{title}</h3>
			<p class="text-gray-600 mb-6">{message}</p>

			<div class="flex gap-3">
				<button
					class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded flex-1 text-gray-800"
					on:click={onCancel}
				>
					Cancel
				</button>
				<button
					class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex-1 text-white"
					on:click={onConfirm}
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}
