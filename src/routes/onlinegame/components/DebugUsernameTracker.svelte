<script lang="ts">
  import { userStore } from '$lib/stores/user';
  import { lobby } from '$lib/stores/lobby';
  import { socketService } from '$lib/stores/socket';
  
  export let actualUsername: string;
  export let savedGameData: any;

  $: socketInfo = socketService.getCurrentUserInfo();
</script>

<div class="debug-username-tracker">
  <h4>Username Debug Info</h4>
  <div class="debug-grid">
    <div>UserStore: {$userStore?.username || 'null'}</div>
    <div>Lobby Store: {$lobby?.username || 'null'}</div>
    <div>Saved Data: {savedGameData?.username || 'null'}</div>
    <div>Socket Info: {socketInfo?.username || 'null'}</div>
    <div><strong>Actual Username: {actualUsername || 'null'}</strong></div>
  </div>
</div>

<style>
  .debug-username-tracker {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
    z-index: 1000;
  }
  
  .debug-grid {
    display: grid;
    gap: 5px;
  }
</style>