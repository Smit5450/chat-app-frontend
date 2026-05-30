import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (!error.response) {
      toast.error("Network error");
    }
    const message = error.response?.data?.message || "Something went wrong";

    toast.error(message);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      localStorage.removeItem("user");

      // window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
