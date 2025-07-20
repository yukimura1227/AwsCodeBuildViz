import { defineConfig } from 'npm:vite@5.4.19';
import react from 'npm:@vitejs/plugin-react@^4.2.1';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import 'npm:react-dom@^18.2.0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import 'npm:react-dom@^18.2.0';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'pages/AverageTrendChart/index.html'),
        timeline: resolve(__dirname, 'pages/Timeline/index.html'),
      },
    },
  },
});