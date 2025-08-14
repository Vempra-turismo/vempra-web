import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";


// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
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