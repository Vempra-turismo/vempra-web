import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";
import { fileURLToPath } from 'url';
import path from 'path';


// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src')
      }
    }
  },
  integrations: [
    tailwind(),
    icon({
      include: {
        mdi: [
          'clock-outline',
          'key-variant',
          'check-circle-outline',
        ],
      },
    }),
  ]
});