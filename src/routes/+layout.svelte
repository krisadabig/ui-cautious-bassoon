<script lang="ts">
  import { asset } from '$app/paths';
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
  
  const { data, children } = $props<{ 
    data: { session: any },
    children: (props: { data: any }) => any
  }>();
</script>

<svelte:head>
  <link rel="icon" type="image/x-icon" href={asset('/favicon.ico')} />
  <title>My App</title>
</svelte:head>

{@render children({ data })}
<Toaster position="top-center" />
