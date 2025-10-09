import axios, { type AxiosResponse } from 'axios';
import { getAuthHeaders } from './auth';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

// Create axios instance with backend URL from environment variables
console.log("before: ", import.meta.env.VITE_BACKEND_URL)
console.log("NODE_ENV: ", process.env.NODE_ENV)
console.log("IMPORT NODE_ENV: ", import.meta.env.NODE_ENV)
console.log("import VITE_BACKEND_URL: ", import.meta.env.VITE_BACKEND_URL)
console.log("VITE_BACKEND_URL: ", process.env.VITE_BACKEND_URL)

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '',
  withCredentials: true, // Enable if using cookies/sessions
  headers: {
    'Content-Type': 'application/json',
  },
});


const apiV1 = '/api/v1';

export interface Item {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateItemRequest {
  title: string;
  description?: string;
}

export interface UpdateItemRequest {
  title?: string;
  description?: string;
}

/**
 * API utility class for making authenticated requests
 */
class ApiClient {
  private async getHeaders() {
    const headers = await getAuthHeaders();
    if (!headers) {
      goto(resolve('/'));
      throw new Error('Not authenticated');
    }
    return headers;
  }

  async getItems(params?: { all?: string }): Promise<{ data: Item[] }> {
    const headers = await this.getHeaders();
    console.log("axios: ", JSON.stringify(axiosInstance, null, 2))
    const response: AxiosResponse<{ data: Item[] }> = await axiosInstance.get(`${apiV1}/items`, {
      headers,
      params,
    });
    return response.data;
  }

  async createItem(item: CreateItemRequest): Promise<Item> {
    const headers = await this.getHeaders();
    const response: AxiosResponse<Item> = await axiosInstance.post(`${apiV1}/items`, item, {
      headers,
    });
    return response.data;
  }

  async updateItem(id: number, item: UpdateItemRequest): Promise<Item> {
    const headers = await this.getHeaders();
    const response: AxiosResponse<Item> = await axiosInstance.put(`${apiV1}/items/${id}`, item, {
      headers,
    });
    return response.data;
  }

  async deleteItem(id: number): Promise<void> {
    const headers = await this.getHeaders();
    await axiosInstance.delete(`${apiV1}/items/${id}`, {
      headers,
    });
  }
}

export const apiClient = new ApiClient();
