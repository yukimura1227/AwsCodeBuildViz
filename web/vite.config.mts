import { defineConfig } from 'npm:vite@5.1.6';
import react from 'npm:@vitejs/plugin-react@^4.2.1';

import 'npm:react@^18.2.0';
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
        main: resolve(__dirname, 'pages/index.html'),
      },
    },
  },
});