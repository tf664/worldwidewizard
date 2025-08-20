import { writable } from 'svelte/store';

interface User {
  username?: string;
}

function getTabId(): string {
  let tabId = sessionStorage.getItem('user_tab_id');
  if (!tabId) {
    tabId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem('user_tab_id', tabId);
  }
  return tabId;
}

// Better persistence logic with tab isolation
function createUserStore() {
  let storedUser: User | null = null;
  
  if (typeof localStorage !== 'undefined' && typeof sessionStorage !== 'undefined') {
    try {
      const tabId = getTabId();
      
      // Try tab-specific storage first
      let stored = localStorage.getItem(`user_${tabId}`);
      if (!stored) {
        // Fallback to session storage
        stored = sessionStorage.getItem('user');
      }
      
      storedUser = stored ? JSON.parse(stored) : null;
      console.log('User store loaded for tab:', tabId, storedUser);
    } catch (error) {
      console.warn('Failed to parse stored user data:', error);
      storedUser = null;
    }
  }

  const { subscribe, set, update } = writable<User | null>(storedUser);

  return {
    subscribe,
    set: (value: User | null) => {
      set(value);
      if (typeof localStorage !== 'undefined' && typeof sessionStorage !== 'undefined') {
        const tabId = getTabId();
        
        if (value && value.username) {
          // Save to both storages
          localStorage.setItem(`user_${tabId}`, JSON.stringify(value));
          sessionStorage.setItem('user', JSON.stringify(value));
          console.log('User saved for tab:', tabId, value);
        } else {
          localStorage.removeItem(`user_${tabId}`);
          sessionStorage.removeItem('user');
        }
      }
    },
    update,
    setUsername: (username: string) => {
      const newUser = { username };
      set(newUser);
    },
    clear: () => {
      set(null);
    }
  };
}

export const user = createUserStore();
export const userStore = user;