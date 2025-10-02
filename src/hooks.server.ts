import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { CookieOptions } from '@supabase/ssr';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key: string) => event.cookies.get(key),
        set: (key: string, value: string, options: CookieOptions) => {
          event.cookies.set(key, value, { ...options, path: '/' });
        },
        remove: (key: string, options: CookieOptions) => {
          event.cookies.delete(key, { ...options, path: '/' });
        },
      },
    }
  );

  event.locals.getSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    return session;
  };

  // Resolve the event with the session
  const response = await resolve(event);
  return response;
};
