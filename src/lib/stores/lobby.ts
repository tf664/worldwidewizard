// Update src/lib/stores/lobby.ts  
import { writable } from 'svelte/store';

export interface LobbyInfo {
  lobbyCode: string;
  username: string;
  isAdmin?: boolean;
}

function getTabId(): string {
  let tabId = sessionStorage.getItem('lobby_tab_id');
  if (!tabId) {
    tabId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem('lobby_tab_id', tabId);
  }
  return tabId;
}

function createLobbyStore() {
  let initialData: LobbyInfo | null = null;
  
  if (typeof localStorage !== 'undefined' && typeof sessionStorage !== 'undefined') {
    try {
      const tabId = getTabId();
      
      // Try tab-specific storage first  
      let stored = localStorage.getItem(`lobby_${tabId}`);
      if (!stored) {
        // Fallback to session storage
        stored = sessionStorage.getItem('lobby');
      }
      
      initialData = stored ? JSON.parse(stored) : null;
      console.log('Lobby store loaded for tab:', tabId, initialData);
    } catch (error) {
      console.warn('Failed to parse stored lobby data:', error);
      initialData = null;
    }
  }

  const { subscribe, set, update } = writable<LobbyInfo | null>(initialData);

  return {
    subscribe,
    set: (value: LobbyInfo | null) => {
      set(value);
      if (typeof localStorage !== 'undefined' && typeof sessionStorage !== 'undefined') {
        const tabId = getTabId();
        
        if (value) {
          // Save to both storages
          localStorage.setItem(`lobby_${tabId}`, JSON.stringify(value));
          sessionStorage.setItem('lobby', JSON.stringify(value));
          console.log('Lobby saved for tab:', tabId, value);
        } else {
          localStorage.removeItem(`lobby_${tabId}`);
          sessionStorage.removeItem('lobby');
        }
      }
    },
    update,
    clear: () => set(null)
  };
}

export const lobby = createLobbyStore();