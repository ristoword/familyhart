import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const port = parseInt(process.env.PORT || '5173', 10);

export default defineConfig({
  plugins: [react()],
  // Railway / container: ascolta su tutte le interfacce (non solo localhost)
  server: {
    host: true,
    port,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
  preview: {
    host: true,
    port: parseInt(process.env.PORT || '4173', 10),
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router')
          ) {
            return 'react-vendor';
          }
        },
      },
    },
  },
})
