import { writable } from 'svelte/store';

export type LobbyInfo = {
    lobbyCode: string;
    username: string;
};

export const lobby = writable<LobbyInfo | null>(null);