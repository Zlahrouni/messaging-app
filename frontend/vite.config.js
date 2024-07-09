import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  server: {
    host: 'localhost',
    port: 3800
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
