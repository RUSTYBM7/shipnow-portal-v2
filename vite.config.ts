// vite.config.ts - AirPak Express Vite Configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import sourceIdentifierPlugin from 'vite-plugin-source-identifier';

const isProd = process.env.BUILD_MODE === 'prod';

export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'map-vendor': ['maplibre-gl'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'vaul'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});