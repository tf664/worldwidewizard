<script lang="ts">
    export let message: string = 'Are you sure?';
    export let confirmText: string = 'Confirm';
    export let cancelText: string = 'Cancel';
    export let onConfirm: () => void;
    export let onCancel: () => void;
    export let confirmClass: string = 'confirm';
</script>

<div class="dialog-overlay" on:click={onCancel} role="button" tabindex="0">
    <div class="dialog-box" on:click|stopPropagation role="dialog">
        <div class="dialog-content">
            <h3>Confirmation</h3>
            <p>{message}</p>
        </div>
        
        <div class="dialog-actions">
            <button class="btn btn-cancel" on:click={onCancel}>
                {cancelText}
            </button>
            <button class="btn btn-{confirmClass}" on:click={onConfirm}>
                {confirmText}
            </button>
        </div>
    </div>
</div>

<style>
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .dialog-box {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        border: 2px solid #e5e7eb;
    }

    .dialog-content h3 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
    }

    .dialog-content p {
        margin: 0 0 1.5rem 0;
        color: #6b7280;
        line-height: 1.5;
    }

    .dialog-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
    }

    .btn {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 0.875rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-cancel {
        background: #e5e7eb;
        color: #374151;
    }

    .btn-cancel:hover {
        background: #d1d5db;
    }

    .btn-confirm {
        background: #3b82f6;
        color: white;
    }

    .btn-confirm:hover {
        background: #2563eb;
    }

    .btn-restart {
        background: #ef4444;
        color: white;
    }

    .btn-restart:hover {
        background: #dc2626;
    }
</style>