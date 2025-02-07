import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/versatilisToken': {
        target: 'http://177.159.112.242:9091',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/versatilisToken/, '/versatilis/Token'),
      },
    },
  },
});
