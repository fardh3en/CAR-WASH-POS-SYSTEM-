import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'firebase-firestore-vendor',
              test: /node_modules[\\/]@firebase[\\/]firestore[\\/]/,
              priority: 20,
            },
            {
              name: 'firebase-auth-vendor',
              test: /node_modules[\\/]@firebase[\\/]auth[\\/]/,
              priority: 20,
            },
            {
              name: 'firebase-vendor',
              test: /node_modules[\\/](?:firebase|@firebase)[\\/]/,
              priority: 10,
            },
            {
              name: 'supabase-vendor',
              test: /node_modules[\\/]@supabase[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
