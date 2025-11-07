import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  selectedAnnouncement: null,
  loading: false,
  error: null,

  // 🔹 Récupérer toutes les annonces
  fetchAnnouncements: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/API/announcements");
      set({
        announcements: res.data.announcements || [],
        loading: false,
      });
    } catch (error) {
      console.error("❌ Erreur lors du chargement des annonces :", error);
      set({
        error: error.response?.data?.message || "Erreur de chargement",
        loading: false,
      });
    }
  },

  // 🔹 Ajouter une annonce
  addAnnouncement: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/API/announcements", formData);
      const newAnnouncement = res.data.announcement;
      set({
        announcements: [...get().announcements, newAnnouncement],
        loading: false,
      });
      return newAnnouncement;
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout de l'annonce :", error);
      set({
        error: error.response?.data?.message || "Erreur d'ajout",
        loading: false,
      });
      throw error;
    }
  },

  // 🔹 Mettre à jour une annonce
  updateAnnouncement: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.put(`/API/announcements/${id}`, formData);
      const updatedAnnouncement = res.data.announcement;
      set({
        announcements: get().announcements.map((a) =>
          a.id === id ? { ...a, ...updatedAnnouncement } : a
        ),
        loading: false,
      });
      return updatedAnnouncement;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'annonce :", error);
      set({
        error: error.response?.data?.message || "Erreur de mise à jour",
        loading: false,
      });
      throw error;
    }
  },

  // 🔹 Supprimer une annonce
  deleteAnnouncement: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/API/announcements/${id}`);
      set({
        announcements: get().announcements.filter((a) => a.id !== id),
        loading: false,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'annonce :", error);
      set({
        error: error.response?.data?.message || "Erreur de suppression",
        loading: false,
      });
      throw error;
    }
  },

  // 🔹 Sélectionner une annonce (utile pour un modal / détails)
  selectAnnouncement: (announcement) => set({ selectedAnnouncement: announcement }),
}));
