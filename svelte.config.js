import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter({
            // Output directory for pages (default: 'build')
            pages: 'build',
            // Output directory for assets (default: same as pages)
            assets: 'build',
            // Fallback page for SPA mode (e.g., '404.html' for GitHub Pages)
            fallback: '404.html', // Use '404.html' if you want a custom 404
            // Precompress assets (optional, for better performance)
            precompress: false,
            // Enforce strict prerendering (recommended for static sites)
            strict: true
        }),
        paths: {
            base: process.env.NODE_ENV === 'production' ? '/ui-cautious-bassoon' : '',
        }
    }
};

export default config;