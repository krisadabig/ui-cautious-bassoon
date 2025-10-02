// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient;
      getSession(): Promise<Session | null>;
    }
    interface PageData {
      session: Session | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

declare module '@sveltejs/kit' {
  interface Locals {
    supabase: SupabaseClient;
    getSession(): Promise<Session | null>;
  }
  interface PageData {
    session: Session | null;
  }
}

export {};
