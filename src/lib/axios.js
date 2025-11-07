import axios from "axios";
import { useAuthStore } from "../stores/authStore"; // adapte le chemin

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:3500",
  withCredentials: true,
});

// ✅ Intercepteur de requêtes : lit le token dans localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // <-- ici
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Intercepteur de réponses : rafraîchit le token si expiré
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.get(
          `${axiosInstance.defaults.baseURL}/refresh`,
          { withCredentials: true }
        );
        const newAccessToken = refreshRes.data.accessToken;

        // On met à jour localStorage et Zustand
        localStorage.setItem("accessToken", newAccessToken);
        const { set } = useAuthStore.getState();
        set({ accessToken: newAccessToken });

        // On relance la requête échouée avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        // Si le refresh échoue → on déconnecte
        const { logout } = useAuthStore.getState();
        logout();
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };
