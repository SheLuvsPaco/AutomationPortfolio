// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Inline CSS: one request for the document, nothing render-blocking.
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
