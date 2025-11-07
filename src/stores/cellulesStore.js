import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useCelluleStore = create((set, get) => ({
  cellules: [],
  selectedCellule: null,
  loading: false,
  error: null,

  // 🔹 Récupérer toutes les cellules
  fetchCellules: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/API/cellules");
      set({ cellules: res.data.cells || [], loading: false });
    } catch (error) {
      console.error("❌ Erreur lors du chargement des cellules :", error);
      set({
        error: error.response?.data?.message || "Erreur de chargement",
        loading: false,
      });
    }
  },

  // 🔹 Ajouter une cellule
  addCellule: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/API/cellules", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newCellule = res.data.cell;
      set({
        cellules: [...get().cellules, newCellule],
        loading: false,
      });
      return newCellule;
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout de la cellule :", error);
      set({
        error: error.response?.data?.message || "Erreur d'ajout",
        loading: false,
      });
      throw error;
    }
  },

  // 🔹 Mettre à jour une cellule
  updateCellule: async (cellId, formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.put(`/API/cellules/${cellId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedCellule = res.data.cell;
      set({
        cellules: get().cellules.map((c) =>
          c.id === cellId ? { ...c, ...updatedCellule } : c
        ),
        loading: false,
      });
      return updatedCellule;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de la cellule :", error);
      set({
        error: error.response?.data?.message || "Erreur de mise à jour",
        loading: false,
      });
      throw error;
    }
  },

  // 🔹 Supprimer une cellule
  deleteCellule: async (cellId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/API/cellules/${cellId}`);
      set({
        cellules: get().cellules.filter((c) => c.id !== cellId),
        loading: false,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de la cellule :", error);
      set({
        error: error.response?.data?.message || "Erreur de suppression",
        loading: false,
      });
      throw error;
    }
  },

  // 🔹 Récupérer tous les utilisateurs d'une cellule
  getAllUsersInCell: async (cellId) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/API/cellules/${cellId}/users`);
      set({ loading: false });
      return res.data.users || [];
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
      set({
        error: error.response?.data?.message || "Erreur lors de la récupération des utilisateurs",
        loading: false,
      });
      return [];
    }
  },

  // 🔹 Supprimer un utilisateur d'une cellule
  removeUserFromCell: async (cellId, userId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/API/cellules/${cellId}/users/${userId}`);
      set({ loading: false });
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'utilisateur :", error);
      set({
        error: error.response?.data?.message || "Erreur de suppression utilisateur",
        loading: false,
      });
      throw error;
    }
  },
}));