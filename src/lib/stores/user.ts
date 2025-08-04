import { writable } from 'svelte/store';

const storedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
const initial = storedUser ? JSON.parse(storedUser) : null;

export const user = writable(initial);

user.subscribe((value) => {
	if (typeof localStorage !== 'undefined') {
		if (value) {
			localStorage.setItem('user', JSON.stringify(value));
		} else {
			localStorage.removeItem('user');
		}
	}
});
