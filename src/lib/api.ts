import axios, { type AxiosResponse } from 'axios';
import { getAuthHeaders } from './auth';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

// Create axios instance with proper configuration for proxy
const axiosInstance = axios.create({
  baseURL: '', // Use relative URLs with proxy
  withCredentials: false, // Important for proxy to work correctly
});

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
    const response: AxiosResponse<{ data: Item[] }> = await axiosInstance.get(`/api/items`, {
      headers,
      params,
    });
    return response.data;
  }

  async createItem(item: CreateItemRequest): Promise<Item> {
    const headers = await this.getHeaders();
    const response: AxiosResponse<Item> = await axiosInstance.post(`/api/items`, item, {
      headers,
    });
    return response.data;
  }

  async updateItem(id: number, item: UpdateItemRequest): Promise<Item> {
    const headers = await this.getHeaders();
    const response: AxiosResponse<Item> = await axiosInstance.put(`/api/items/${id}`, item, {
      headers,
    });
    return response.data;
  }

  async deleteItem(id: number): Promise<void> {
    const headers = await this.getHeaders();
    await axiosInstance.delete(`/api/items/${id}`, {
      headers,
    });
  }
}

export const apiClient = new ApiClient();
