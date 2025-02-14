import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/Versatilis/Token': 'http://177.159.112.242:9091',
      '/Versatilis/api/Especialidade?nomeEspecialidade=ANESTESIOLOGIA': 'http://177.159.112.242:9091',
    }
  }
})
