import type { LayoutServerLoad } from './$types';

export const prerender = true;
export const trailingSlash = 'always';

export const load: LayoutServerLoad = async ({ locals }) => {
  // This is a basic layout load function that doesn't require authentication
  return {
    session: await locals.getSession()
  };
};
