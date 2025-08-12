import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  output: 'server',
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