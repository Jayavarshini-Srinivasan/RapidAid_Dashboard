import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('@mui') || id.includes('@emotion')) return 'vendor-mui';
            if (id.includes('@react-google-maps/api')) return 'vendor-maps';
            if (id.includes('socket.io-client')) return 'vendor-socket';
            if (id.includes('firebase')) return 'vendor-firebase';
            return 'vendor';
          }
        },
      },
    },
  },
});

