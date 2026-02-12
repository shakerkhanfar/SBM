import axios, { type AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.hamsa.ai',
  headers: {
    Authorization: `Token ${import.meta.env.VITE_API_KEY}`,
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => Promise.reject(error),
);

// Wrapper that fixes return types since the interceptor unwraps the response
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get(url, config) as unknown as Promise<T>,
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.post(url, data, config) as unknown as Promise<T>,
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.put(url, data, config) as unknown as Promise<T>,
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete(url, config) as unknown as Promise<T>,
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.patch(url, data, config) as unknown as Promise<T>,
};

export const rawApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.hamsa.ai',
  headers: {
    Authorization: `Token ${import.meta.env.VITE_API_KEY}`,
  },
});

export default api;
