import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Local dev: proxy /api → backend
      '/api': {
        target: 'https://clothing-amriah.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
