import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  root: fileURLToPath(new URL('./src', import.meta.url)),
  base: './',
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    // strictPort intentionally off — the dev orchestrator (scripts/dev.mjs)
    // picks an available port and passes it via --port + --strictPort on the
    // CLI, then sets VITE_DEV_PORT for Electron. If you run `npm run dev:vite`
    // directly, Vite will fall through to the next free port automatically.
  },
});
