// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Just in case something tries to reach backend
      '@backend': path.resolve(__dirname, '../vixencomix-backend'),
    },
  },
  server: {
    fs: {
      allow: ['.'], // Only allow project root
      deny: ['../vixencomix-backend'], // ✅ hard deny access to backend
    },
  },
  optimizeDeps: {
    exclude: ['express', 'nodemailer', 'dotenv'], // ✅
  },
});
