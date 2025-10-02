<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';

  let error = '';

  onMount(async () => {
    try {
      // Try to exchange code for session explicitly (in case detectSessionInUrl didn't already do it)
      const url = new URL($page.url);
      const code = url.searchParams.get('code');
      const error_description = url.searchParams.get('error_description');
      if (error_description) {
        error = error_description;
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          error = exchangeError.message;
          return;
        }
      }

      // Verify session and redirect
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await goto('/dashboard');
      } else {
        // No session - go back to home/login
        await goto('/');
      }
    } catch (e: unknown) {
      error = (e as Error)?.message ?? 'Unexpected error during sign-in.';
      console.error(e);
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-6 text-center">
    <div class="flex items-center justify-center">
      <svg class="animate-spin -ml-1 mr-3 h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-gray-800">Finishing sign-in…</span>
    </div>

    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <div class="font-medium">Sign-in failed</div>
        <div class="text-sm">{error}</div>
        <button class="mt-3 text-indigo-700 underline" on:click={async () => await goto('/')}>Back</button>
      </div>
    {/if}
  </div>
</div>
