import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true,
      },
    }),
  ],
  define: {
    'global': 'globalThis',
  },
  server: {
    port: 3000,
    proxy: {
      '/rsocket': {
        target: 'ws://localhost:7000',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
