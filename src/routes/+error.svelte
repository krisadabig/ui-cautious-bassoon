<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const status = $derived(page.status)
	const error = $derived(page.error); 

	let isDarkMode = false;

	onMount(() => {
		isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		document.documentElement.classList.toggle('dark', isDarkMode);
	});
</script>

<svelte:head>
	<title>{status}: {error?.message || 'Something went wrong'}</title>
</svelte:head>

<div class="error-container">
	<div class="error-content">
		<div class="error-illustration">
			{#if status === 404}
				<svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path d="M9.172 16.242L12 13.414l2.828 2.828 1.414-1.414L13.414 12l2.828-2.828-1.414-1.414L12 10.586 9.172 7.758 7.758 9.172 10.586 12l-2.828 2.828z" />
					<circle cx="12" cy="12" r="10" stroke-width="2" />
				</svg>
			{:else}
				<svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			{/if}
		</div>
		
		<h1>{status}</h1>
		
		{#if status === 404}
			<h2>Page Not Found</h2>
			<p class="error-message">The page you're looking for doesn't exist or has been moved.</p>
		{:else}
			<p class="error-message">{error?.message || 'An unexpected error occurred'}</p>
		{/if}

		<div class="action-buttons">
			<button onclick={() => window.history.back()} class="btn btn-secondary">
				<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="19" y1="12" x2="5" y2="12"></line>
					<polyline points="12 19 5 12 12 5"></polyline>
				</svg>
				Go Back
			</button>
			<button onclick={() => goto(resolve('/'))} class="btn btn-primary">
				<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
					<polyline points="9 22 9 12 15 12 15 22"></polyline>
				</svg>
				Go to Homepage
			</button>
		</div>
	</div>
</div>

<style>
	:global(html.dark) {
		--bg-color: #1a1a1a;
		--text-color: #f5f5f5;
		--card-bg: #2d2d2d;
		--primary: #3b82f6;
		--primary-hover: #2563eb;
		--secondary: #6b7280;
		--secondary-hover: #4b5563;
	}

	:global(html:not(.dark)) {
		--bg-color: #f9fafb;
		--text-color: #111827;
		--card-bg: #ffffff;
		--primary: #3b82f6;
		--primary-hover: #2563eb;
		--secondary: #e5e7eb;
		--secondary-hover: #d1d5db;
	}

	.error-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		background-color: var(--bg-color);
		color: var(--text-color);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		line-height: 1.5;
	}

	.error-content {
		text-align: center;
		max-width: 28rem;
		width: 100%;
		padding: 2.5rem;
		background-color: var(--card-bg);
		border-radius: 1rem;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.error-illustration {
		margin-bottom: 1.5rem;
	}

	.error-icon {
		width: 6rem;
		height: 6rem;
		color: var(--primary);
		margin: 0 auto;
	}

	h1 {
		font-size: 5rem;
		font-weight: 800;
		margin: 0 0 0.5rem;
		line-height: 1;
		color: var(--primary);
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 1rem;
	}

	.error-message {
		color: var(--text-color);
		opacity: 0.9;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.action-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease-in-out;
		border: 1px solid transparent;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	.btn svg {
		width: 1rem;
		height: 1rem;
	}

	.btn-primary {
		background-color: var(--primary);
		color: white;
	}

	.btn-primary:hover {
		background-color: var(--primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.btn-secondary {
		background-color: var(--secondary);
		color: var(--text-color);
	}

	.btn-secondary:hover {
		background-color: var(--secondary-hover);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 640px) {
		.error-content {
			padding: 1.5rem;
		}

		h1 {
			font-size: 4rem;
		}

		.action-buttons {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}
	}
</style>