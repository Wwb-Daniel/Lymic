import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), svelte(), react()],
  output: 'server',
  adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: true }
  }),
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      }
    ]
  },
  build: {
    assets: '_astro',
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'ui-vendor': ['lucide-react', '@radix-ui/react-slider'],
          }
        }
      }
    },
    ssr: {
      external: ['sharp']
    }
  }
});
