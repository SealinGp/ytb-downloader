import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      overrides: {
        // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
        fs: 'memfs',
      },
    }),
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
