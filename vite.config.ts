import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 5173,
    proxy: {
      '/api/codeforces': {
        target: 'https://codeforces-stats.tashif.codes',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/codeforces/, ''),
      },
      '/api/codechef': {
        target: 'https://codechef-stats-api-two.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/codechef/, ''),
      },
    },
  },
  optimizeDeps: {
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
