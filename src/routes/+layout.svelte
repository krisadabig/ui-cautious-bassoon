<script lang="ts">
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
  
  export let data: { session: any };

  export const prerender = true;
</script>

<svelte:head>
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <title>My App</title>
</svelte:head>

<slot {data} />
<Toaster position="top-center" />
