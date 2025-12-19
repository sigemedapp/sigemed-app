import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// FIX: Import 'process' to provide proper types for process.cwd() and resolve TS error.
import process from 'process';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // FIX: Replaced `__dirname` with `path.resolve(process.cwd(), '.')` to resolve module errors in Vite's ESM context.
          '@': path.resolve(process.cwd(), '.'),
        }
      }
    };
});