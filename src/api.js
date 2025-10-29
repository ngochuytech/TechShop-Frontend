import axios from "axios";
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from "./constants.js";

const BASE_URL = import.meta.env.VITE_API_URL;

// Tạo biến global để lưu navigate function
let navigateFunction = null;

export const setNavigate = (navigate) => {
  navigateFunction = navigate;
};

// Biến để lưu promise refresh token đang thực hiện
let refreshTokenPromise = null;

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
        
        // Nếu đã có promise refresh token đang chạy, chờ nó hoàn thành
        if (!refreshTokenPromise) {
          refreshTokenPromise = axios.post(
            `${BASE_URL}/api/v1/users/refresh-token`,
            {},
            {
              withCredentials: true,
            }
          )
          .then((response) => {
            const newToken = response.data?.token || response.data?.access_token;
            if (newToken) {
              sessionStorage.setItem(ACCESS_TOKEN, newToken);
            }
            return newToken;
          })
          .catch((refreshError) => {
            sessionStorage.removeItem(ACCESS_TOKEN);
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            if (navigateFunction) {
              setTimeout(() => navigateFunction('/auth'), 2000);
            } else {
              setTimeout(() => window.location.href = `/auth`, 2000);
            }
            throw refreshError;
          })
          .finally(() => {
            // Reset promise sau khi hoàn thành (thành công hoặc thất bại)
            refreshTokenPromise = null;
          });
        }

        try {
          const newToken = await refreshTokenPromise;
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      } else {
        // Nếu đã retry rồi mà vẫn lỗi 401, xóa token và redirect
        sessionStorage.removeItem(ACCESS_TOKEN);
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        if (navigateFunction) {
          setTimeout(() => navigateFunction('/auth'), 2000);
        } else {
          setTimeout(() => window.location.href = `/auth`, 2000);
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
