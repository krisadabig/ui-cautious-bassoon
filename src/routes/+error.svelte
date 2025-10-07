<script lang="ts">
	import { page } from '$app/stores';

	$: status = $page.status; // e.g., 404
	$: error = $page.error; // Error object with message
</script>

<svelte:head>
	<title>{status}: {error?.message || 'Page not found'}</title>
</svelte:head>

<div class="error-container">
	<h1>{status}</h1>
	{#if status === 404}
		<p>Oops! The page you're looking for doesn't exist.</p>
		<a href="/">Go home</a>
	{:else}
		<p>Something went wrong: {error?.message}</p>
		<a href="/">Go home</a>
	{/if}
</div>

<style>
	.error-container {
		text-align: center;
		padding: 2rem;
	}
</style>
