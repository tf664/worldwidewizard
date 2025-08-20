<script lang="ts">
    import { onMount } from 'svelte';
    import { cardImagePreloader } from '$lib/utils/cardImagePreloader';

    let isLoading = true;
    let loadingProgress = 0;

    export let onLoadComplete: () => void = () => {};

    onMount(async () => {
        try {
            await cardImagePreloader.preloadAllCards();
            isLoading = false;
            onLoadComplete();
        } catch (error) {
            console.error('Failed to preload some images:', error);
            // Continue anyway
            isLoading = false;
            onLoadComplete();
        }
    });
</script>

{#if isLoading}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div class="bg-white rounded-lg p-8 text-center max-w-md">
            <h2 class="text-2xl font-bold mb-4">Loading Game Assets...</h2>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: 100%"></div>
            </div>
            <p class="text-gray-600">Preparing card images for smooth gameplay</p>
            <div class="mt-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        </div>
    </div>
{/if}