import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useDocumentStore = create((set, get) => ({
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,

  // 🔄 Récupérer la liste des documents
  getDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/API/documents");
      set({ documents: res.data.documents, loading: false });
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
      set({
        loading: false,
        error: err.response?.data?.message || "Erreur lors du chargement des documents",
      });
    }
  },

  // 📤 Upload d’un document
  uploadDocument: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/API/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        documents: [...state.documents, res.data],
        loading: false,
      }));
    } catch (err) {
      console.error("Erreur d’upload :", err);
      set({
        loading: false,
        error: err.response?.data?.message || "Erreur lors de l’upload du document",
      });
    }
  },

  // 🗑️ Supprimer un document
  deleteDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/API/documents/${id}`);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id && doc._id !== id),
        loading: false,
      }));
    } catch (err) {
      console.error("Erreur de suppression :", err);
      set({
        loading: false,
        error: err.response?.data?.message || "Erreur lors de la suppression",
      });
    }
  },

  // 👁️ Afficher un document PDF
  displayDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/API/documents/${id}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || "application/pdf",
      });

      const fileUrl = URL.createObjectURL(blob);
      const filename =
        res.headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || "document.pdf";

      set({
        currentDocument: { id, title: filename, fileUrl },
        loading: false,
      });
    } catch (err) {
      console.error("Erreur lors de l'affichage :", err);
      set({
        loading: false,
        error: "Impossible d'afficher le document",
      });
    }
  },

  // ❌ Fermer un document
  closeDocument: () => {
    const current = get().currentDocument;
    if (current?.fileUrl) URL.revokeObjectURL(current.fileUrl);
    set({ currentDocument: null });
  },

  // 🧹 Nettoyer les erreurs
  clearError: () => set({ error: null }),
}));

export default useDocumentStore;
