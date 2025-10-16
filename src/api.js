import axios from "axios";
import { ACCESS_TOKEN } from "./constants.js";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response?.data?.code !== "invalid_refresh_token"
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/users/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        localStorage.setItem("access_token", data.access_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (refreshError.response?.data?.code === "invalid_refresh_token") {
          localStorage.removeItem("access_token");
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = `${BASE_URL}/users/login`;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
