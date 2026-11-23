import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import {booksApi} from './books-api.ts'

export default defineConfig({
  resolve: {alias: {'@': fileURLToPath(new URL('./src', import.meta.url))}},
  plugins: [react(), tailwind(), {
    name: 'books-api',
    configureServer(server) { server.middlewares.use(booksApi) },
    configurePreviewServer(server) { server.middlewares.use(booksApi) },
  }],
})

