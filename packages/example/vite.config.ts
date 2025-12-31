import { join } from 'path'
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest'

export default defineConfig(({ mode }) => ({
  plugins: [
    crx({
      manifest
    }),
  ],
  server: {
    cors: {
      origin: [
        /chrome-extension:\/\//,
      ],
    },
  },
  resolve: {
    alias: {
      '@': join(process.cwd(), './src'),
    },
  },
  build: {
    minify: mode === 'production',
  },
}))
