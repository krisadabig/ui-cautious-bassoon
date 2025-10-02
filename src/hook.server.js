import { dev } from '$app/environment';

/**
 * @param {{ event: import('@sveltejs/kit').RequestEvent, resolve: (event: import('@sveltejs/kit').RequestEvent) => Promise<Response> }} params
 */
export function handle({ event, resolve }) {
    if (dev && event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
        return new Response(undefined, { status: 404 });
    }

    return resolve(event);
}