import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase } }) => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return json({ error: error.message }, { status: 500 });
  }
  
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
