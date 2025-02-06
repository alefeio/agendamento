import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/versatilis': {
        target: 'http://177.159.112.242:9091',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
