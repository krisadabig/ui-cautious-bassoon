<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { apiClient } from '$lib/api';
  import { toast } from 'svelte-sonner';
  import { fly, fade } from 'svelte/transition';
	import { resolve } from '$app/paths';
  
  interface Item {
    id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    user_id: string;
  }

  // State
  let items: Item[] = $state<Item[]>([])

  let loading = $state<boolean>(true);
  
  // Skeleton items for loading state
  const skeletonItems = Array(3).fill({});
  let isSubmitting = $state<boolean>(false);
  let isDeleting = $state<boolean>(false);
  let deletingId: number | null = $state<number | null>(null);
  let showForm = $state<boolean>(false);
  let editingId: number | null = $state<number | null>(null);
  let showAllItems = $state<boolean>(false);
  let formData = $state({
    title: '',
    description: ''
  });
  let user: any = $state(null);
  let error: string | null = $state(null);

  // Initialize component
  onMount(async () => {
    try {
      user = (await supabase.auth.getUser()).data.user;
      await loadItems();
    } catch (err) {
      console.error('Error initializing dashboard:', err);
      toast.error('Failed to load dashboard');
    }
  });

  // Form helpers
  function resetForm() {
    formData = { 
      title: '', 
      description: '' 
    };
    editingId = null;
  }

  // Load items from API
  async function loadItems() {
    try {
      loading = true;
      const params = showAllItems ? { all: 'true' } : {};
      const res = await apiClient.getItems(params);
      console.log("res: ", res)
      items = res || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load items';
      toast.error(message);
      console.error('Error loading items:', err);
    } finally {
      loading = false;
    }
  }

  // Toggle between showing all items and only user's items
  async function toggleShowAll() {
    showAllItems = !showAllItems;
    await loadItems();
  }

  // Item actions
  function startEdit(item: Item) {
    editingId = item.id;
    formData = {
      title: item.title,
      description: item.description || ''
    };
    showForm = true;
    // Scroll to form after a short delay to allow DOM update
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // Form submission
  async function handleSubmit() {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      isSubmitting = true;
      if (editingId !== null) {
        // Pass editingId directly as a number
        const updatedItem = await apiClient.updateItem({ ...formData, id: editingId });
        const currentEditingId = editingId; // Capture the current editingId
        items = items.map(item => item.id === currentEditingId ? updatedItem : item);
        toast.success('Item updated successfully');
        showForm = false;
      } else {
        const newItem = await apiClient.createItem(formData);
        items = [newItem, ...items];
        toast.success('Item created successfully');
        showForm = false;
      }
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save item';
      toast.error(message);
      console.error('Error saving item:', err);
    } finally {
      isSubmitting = false;
    }
  }

  async function deleteItem(id: number) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      isDeleting = true;
      deletingId = id;
      await apiClient.deleteItem(id);
      items = items.filter(item => item.id !== id);
      toast.success('Item deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(message);
      console.error('Error deleting item:', err);
    } finally {
      isDeleting = false;
      deletingId = null;
    }
  }

  function cancelEdit() {
    editingId = null;
    showForm = false;
    resetForm();
  }

  // Auth
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await goto(resolve('/'));
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Failed to sign out');
    }
  }
</script>

<svelte:head>
  <title>Dashboard - My App</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <h1 class="text-2xl font-bold text-gray-900">My Items</h1>
        <div class="flex items-center space-x-4">
          {#if user?.user_metadata?.avatar_url}
            <img 
              src={user.user_metadata.avatar_url} 
              alt="User avatar" 
              class="h-8 w-8 rounded-full"
            />
          {/if}
          <div class="flex items-center space-x-2">
            <p class="text-sm text-gray-600">{user?.email}</p>
            <button
              onclick={signOut}
              class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 flex items-center"
              aria-label="Sign out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 max-w-7xl w-full mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
    <!-- Toast Container -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <!-- Toasts will be inserted here by svelte-sonner -->
    </div>
    
    {#if loading}
      <!-- Skeleton Loading -->
      <div class="animate-pulse space-y-6">
        <div class="flex justify-between items-center mb-8">
          <div class="h-8 bg-gray-200 rounded w-48"></div>
          <div class="h-10 bg-indigo-600 rounded-md w-32"></div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each skeletonItems as _, i (i)}
            <div class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div class="p-4">
                <div class="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}

    <!-- Loading Overlay -->
    {#if loading}
      <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p class="text-gray-700">Loading your items...</p>
        </div>
      </div>
    {/if}

    <!-- Error Message -->
    {#if error}
      <div class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span class="block sm:inline">{error}</span>
        <button
          onclick={() => error = ''}
          class="absolute top-0 bottom-0 right-0 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
          aria-label="Dismiss error message"
        >
          <svg class="fill-current h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
          </svg>
          <span class="sr-only">Dismiss error message</span>
        </button>
      </div>
    {/if}

    <!-- Create Item Button -->
    <div class="mb-4 sm:mb-6 flex justify-end">
      <button
        onclick={() => { showForm = !showForm; if (!showForm) resetForm(); }}
        class="fixed bottom-6 right-6 sm:static z-10 bg-indigo-600 hover:bg-indigo-700 text-white p-3 sm:px-4 sm:py-2 rounded-full sm:rounded-md text-sm font-medium inline-flex items-center shadow-lg sm:shadow-md transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label={showForm ? 'Cancel' : 'Add new item'}
      >
        {#if showForm}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-4 sm:w-4 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span class="hidden sm:inline">Cancel</span>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-4 sm:w-4 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="hidden sm:inline">Add New Item</span>
        {/if}
      </button>
    </div>

    <!-- Create New Item Form -->
    {#if showForm && !editingId}
      <div class="bg-white shadow rounded-lg p-6 mb-6" transition:fly={{ y: -20, duration: 200 }}>
        <h2 class="text-lg font-medium text-gray-900 mb-4">Create New Item</h2>
        <form onsubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-1 gap-6">
            <div class="space-y-2">
              <label for="title" class="block text-base font-medium text-gray-700">Title *</label>
              <input
                type="text"
                id="title"
                bind:value={formData.title}
                placeholder="Enter a descriptive title"
                required
                class="block w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
              />
            </div>
            <div class="space-y-2">
              <label for="description" class="block text-base font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                bind:value={formData.description}
                placeholder="Add more details about this item"
                rows="3"
                class="block w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
              ></textarea>
            </div>
          </div>
          <div class="flex space-x-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isSubmitting}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {editingId ? 'Updating...' : 'Creating...'}
              {:else}
                {editingId ? 'Update Item' : 'Create Item'}
              {/if}
            </button>
            <button
              type="button"
              onclick={() => { showForm = false; resetForm(); }}
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    {/if}

    <!-- Items List -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-4 py-4 sm:px-6">
        {#if !editingId}
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <h2 class="text-base sm:text-lg font-medium text-gray-900">
                {showAllItems ? 'All Items' : 'Your Items'}
              </h2>
              <button 
                type="button" 
                onclick={toggleShowAll}
                class="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                title={showAllItems ? 'Show only my items' : 'Show all items'}
              >
                {showAllItems ? 'Show Mine' : 'Show All'}
              </button>
            </div>
            <p class="text-sm text-gray-500">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        {/if}

        {#if loading}
          <div class="flex justify-center items-center py-8">
            <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-2 text-gray-600">Loading items...</span>
          </div>
        {:else if !items || items.length === 0}
          <p class="text-gray-500 text-center py-8">No items found. Create your first item above!</p>
        {:else}
          <div class="space-y-4">
            {#each items as item (item.id)}
              <div class="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                {#if editingId === item.id}
                  <form onsubmit={handleSubmit} class="p-6 space-y-6">
                    <h3 class="text-lg font-medium text-gray-900">Edit Item</h3>
                    <div class="space-y-2">
                      <label for="edit-title-{item.id}" class="block text-base font-medium text-gray-700">Title</label>
                      <input
                        id="edit-title-{item.id}"
                        type="text"
                        bind:value={formData.title}
                        class="block w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                        placeholder="Enter title"
                      />
                    </div>
                    <div class="space-y-2">
                      <label for="edit-desc-{item.id}" class="block text-base font-medium text-gray-700">Description</label>
                      <textarea
                        id="edit-desc-{item.id}"
                        bind:value={formData.description}
                        rows="2"
                        class="block w-full px-4 py-3 text-base border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                        placeholder="Enter description (optional)"
                      ></textarea>
                    </div>
                    <div class="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        disabled={!formData.title.trim() || isSubmitting}
                        class="flex-1 sm:flex-none inline-flex justify-center items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                        aria-label="Save changes"
                      >
                        {#if isSubmitting}
                          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        {:else}
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        {/if}
                      </button>
                      <button
                        type="button"
                        onclick={cancelEdit}
                        class="flex-1 sm:flex-none inline-flex justify-center items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                        aria-label="Cancel editing"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </form>
                {:else}
                  <div class="p-4">
                    <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="text-lg font-medium text-gray-900">{item.title}</h3>
                      <p class="text-gray-600 mt-1">{item.description || 'No description'}</p>
                      <p class="text-sm text-gray-500 mt-2">
                        Created: {new Date(item.created_at).toLocaleString()}
                        {#if item.updated_at !== item.created_at}
                          • Updated: {new Date(item.updated_at).toLocaleString()}
                        {/if}
                      </p>
                    </div>
                    <div class="flex space-x-2 ml-4">
                      <button
                        onclick={() => startEdit(item)}
                        class="p-2 sm:px-4 sm:py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 flex items-center"
                        aria-label={`Edit ${item.title}`}
                        title="Edit item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span class="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onclick={() => deleteItem(item.id)}
                        class="p-2 sm:px-4 sm:py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 flex items-center"
                        aria-label={`Delete ${item.title}`}
                        title="Delete item"
                        disabled={isDeleting && deletingId === item.id}
                      >
                        {#if isDeleting && deletingId === item.id}
                          <svg class="animate-spin h-5 w-5 sm:mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span class="hidden sm:inline">Deleting...</span>
                        {:else}
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span class="hidden sm:inline">Delete</span>
                        {/if}
                      </button>
                    </div>
                  </div>
                </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    {/if}
  </main>
</div>
