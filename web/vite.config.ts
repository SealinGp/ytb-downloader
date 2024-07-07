import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills(),
    react(),
  ],
  server: {
    proxy: {
      '^/api/*': {
        target: 'http://localhost:7777',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      }
    }
  }
})
