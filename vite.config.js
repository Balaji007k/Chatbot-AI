import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import ghPages from 'vite-plugin-gh-pages';

const repoName = 'Chatbot-AI';

export default defineConfig({
  plugins: [
    tailwindcss(),react(),ghPages()
  ],
  base: `/${repoName}/`,
})
