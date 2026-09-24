import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// Custom plugin to ensure /terms, /privacy, and 404 routes serve their dedicated HTML
function multiPageRouter() {
  return {
    name: 'multi-page-router',
    configureServer(server: any) {
      server.middlewares.use((req: any, _res: any, next: any) => {
        const rawUrl = req.url || '/'
        const pathname = rawUrl.split('?')[0]

        // Allow Vite internal and asset requests to pass through
        if (
          pathname.startsWith('/@') ||
          pathname.startsWith('/node_modules') ||
          pathname.startsWith('/src') ||
          pathname.startsWith('/assets') ||
          pathname.startsWith('/images') ||
          pathname.startsWith('/public') ||
          pathname.endsWith('.js') ||
          pathname.endsWith('.mjs') ||
          pathname.endsWith('.ts') ||
          pathname.endsWith('.tsx') ||
          pathname.endsWith('.css') ||
          pathname.endsWith('.png') ||
          pathname.endsWith('.jpg') ||
          pathname.endsWith('.svg') ||
          pathname.endsWith('.woff') ||
          pathname.endsWith('.woff2') ||
          pathname.endsWith('.ico')
        ) {
          return next()
        }

        if (pathname === '/terms' || pathname === '/terms/') {
          req.url = '/terms/index.html'
          return next()
        }

        if (pathname === '/privacy' || pathname === '/privacy/') {
          req.url = '/privacy/index.html'
          return next()
        }

        if (
          pathname === '/404' ||
          pathname === '/404/' ||
          pathname === '/not-found' ||
          pathname === '/not-found/'
        ) {
          req.url = '/404/index.html'
          return next()
        }

        if (pathname === '/' || pathname === '/index.html') {
          return next()
        }

        // Every other unknown route -> redirect to 404 page
        req.url = '/404/index.html'
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  appType: 'mpa',
  plugins: [react(), tailwindcss(), multiPageRouter()],
  build: {
    rollupOptions: {
      input: {
        main: resolve('.', 'index.html'),
        terms: resolve('.', 'terms/index.html'),
        privacy: resolve('.', 'privacy/index.html'),
        notFound: resolve('.', '404/index.html'),
        notFoundAlt: resolve('.', 'not-found/index.html'),
        four_oh_four: resolve('.', '404.html'),
      },
    },
  },
})
