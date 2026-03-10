import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  base: '/la-nanana-calendario/',
  server: {
    host: true,
    port: 8080,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'La Nanana - Calendario',
        short_name: 'La Nanana',
        start_url: '/la-nanana-calendario/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#10B981',
        icons: [
          {
            src: '/la-nanana-calendario/la-nanana-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/la-nanana-calendario/la-nanana-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));