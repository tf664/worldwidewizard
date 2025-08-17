<script>
    export let message = '';
    export let onClose = () => {};
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded shadow-lg max-w-sm text-center">
        <p class="mb-4">{message}</p>
        <button on:click={onClose} class="bg-blue-600 text-white px-4 py-2 rounded">
            OK
        </button>
    </div>
</div>

<style>
    /* Optional: Styling für das Popup */
</style>