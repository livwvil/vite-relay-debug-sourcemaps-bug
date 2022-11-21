import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import relay from 'vite-plugin-relay';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
    host: 'localhost',
  },
  plugins: [
    react(),
    relay,
    tsconfigPaths(),
    svgrPlugin(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint ./src',
      },
    }),
  ],
});
