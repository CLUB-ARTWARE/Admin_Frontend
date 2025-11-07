import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useUserStore = create((set, get) => ({
  users: [],

  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/API/users");
      set({ users: res.data.users, loading: false });
    } catch (error) {
      console.error("❌ Erreur lors du chargement des utilisateurs :", error);
      set({ loading: false });
    }
  },

  deleteUser: async (userId) => {
    try {
      await axiosInstance.delete(`/API/users/${userId}`);
      set({
        users: get().users.filter((u) => u.user_id !== userId),
      });
    } catch (error) {
      console.error("❌ Erreur lors de la suppression :", error);
    }
  },

  acceptUser: async (userId) => {
    try {
      const res = await axiosInstance.put(`/API/users/${userId}/accept`);
      set({
        users: get().users.map((u) =>
          u.user_id === userId ? { ...u, is_active: true } : u
        ),
      });
      return res.data;
    } catch (error) {
      console.error("❌ Erreur lors de l'acceptation :", error);
    }
  },
  getUserById: async (id) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(`/API/users/${id}`);
      set({
        selectedUser: res.data.users, // Assure-toi que ton backend renvoie { user: {...} }
        loading: false,
      });
      return res.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'utilisateur :", error);
      set({ loading: false });
    }
  },
  
  rejectUser: async (userId, reason) => {
    try {
      const res = await axiosInstance.put(`/API/users/${userId}/reject`, {
        reason,
      });
      set({
        users: get().users.map((u) =>
          u.user_id === userId
            ? { ...u, is_active: false, status: "denied", rejection_reason: reason }
            : u
        ),
      });
      return res.data;
    } catch (error) {
      console.error("❌ Erreur lors du rejet :", error);
    }
  },
}));
