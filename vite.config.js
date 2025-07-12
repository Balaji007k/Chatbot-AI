import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repoName = 'Chatbot-AI';

export default defineConfig({
  plugins: [
    tailwindcss(),react(),
  ],
  base: `/${repoName}/`,
})
