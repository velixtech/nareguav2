import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// host: true deixa o site acessível pelo IP da rede local,
// para testar no celular, tablet ou TV conectados no mesmo Wi-Fi.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});
