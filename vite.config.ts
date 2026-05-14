import { defineConfig } from 'vitest/config'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackRouter({ 
      target: 'react', 
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    viteReact(),
  ],
  // الجزء ده هو الحل لمشكلة سوبابيز في الـ Build
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      // نضمن إن المكتبة مش معتبرة external بالخطأ
      external: [],
    },
  },
  test: {
    environment: 'jsdom',
  },
})

export default config