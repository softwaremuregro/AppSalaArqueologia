import { writable } from 'svelte/store';

// Aquí guardaremos la instancia de Audio que esté sonando
export const currentAudio = writable(null);