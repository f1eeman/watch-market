import { defineConfig, fontProviders } from 'astro/config'
import sitemap from '@astrojs/sitemap'

const subsets = ['latin', 'cyrillic']

export default defineConfig({
  site: 'https://conquest.watch.ru',
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Roboto',
      cssVariable: '--font-roboto',
      fallbacks: ['sans-serif'],
      weights: [300, 400, 500, 700],
      styles: ['normal'],
      subsets,
    },
    {
      provider: fontProviders.google(),
      name: 'Playfair Display',
      cssVariable: '--font-playfair',
      fallbacks: ['serif'],
      weights: [400, 700],
      styles: ['normal'],
      subsets,
    },
    {
      provider: fontProviders.google(),
      name: 'Prata',
      cssVariable: '--font-prata',
      fallbacks: ['serif'],
      weights: [400],
      styles: ['normal'],
      subsets,
    },
  ],
})
