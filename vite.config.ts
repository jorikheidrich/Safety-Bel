
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist'
  },
  server: {
    port: 3000
  },
  define: {
    // Dit zorgt ervoor dat de applicatie niet crasht op 'process is not defined'
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});
