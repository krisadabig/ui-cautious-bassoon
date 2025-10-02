<script>
  import { onMount } from 'svelte';
  import { Toaster } from 'svelte-sonner';
  
  // Add a class to the body for auth pages
  onMount(() => {
    document.body.classList.add('bg-gray-50');
    
    return () => {
      document.body.classList.remove('bg-gray-50');
    };
  });
</script>

<main class="min-h-screen bg-gray-50">
  <slot />
</main>

<Toaster position="top-center" />
