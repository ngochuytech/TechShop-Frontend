import axios from "axios";
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from "./constants.js";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isRefreshEndpoint = originalRequest?.url?.includes('/refresh-token');

    if (error.response?.status === 401 && !isRefreshEndpoint) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const { data } = await axios.post(
            `${BASE_URL}/api/v1/users/refresh-token`,
            {},
            {
              withCredentials: true,
            }
          );

          const newToken = data?.token || data?.access_token;
          if (newToken) {
            sessionStorage.setItem(ACCESS_TOKEN, newToken);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          sessionStorage.removeItem(ACCESS_TOKEN);
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = `/auth`;
          return Promise.reject(refreshError);
        }
      }
      sessionStorage.removeItem(ACCESS_TOKEN);
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      window.location.href = `/auth`;
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
