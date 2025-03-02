import axios, { AxiosError } from 'axios';
import refreshToken from '../services/retryToken';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
export const protectedapi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
export default api;
protectedapi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    // @ts-ignore
    if (originalRequest && error.response && error.response.status === 401 && !originalRequest?._retry) {
      // @ts-ignore
      originalRequest._retry = true;
      try {
        await refreshToken();
        return protectedapi(originalRequest);
      } catch (error) {
        // window.location.href = '/signin';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
