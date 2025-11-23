import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  AdminUser: null,
  loading: false,
  accessToken: null,
  error: null,

  loginAdmin: async (data) => {
    try {
      set({ loading: true, error: null });

      const res = await axiosInstance.post("/login", data);

      // Vérifie le rôle (seulement admin)
      if (res.data.user.role_id !== 2 && res.data.user.role_id !== 3) {
        set({ loading: false });
        toast.error("Accès refusé : espace réservé aux admins");
        return;
      }

      const token = res.data.accessToken;

      // Sauvegarde dans Zustand + localStorage
      set({
        AdminUser: res.data.user,
        accessToken: token,
        loading: false,
        error: null, // Réinitialiser l'erreur en cas de succès
      });
      localStorage.setItem("accessToken", token); 

      toast.success("Connexion réussie");
      return res.data; // Retourner les données pour le composant
    } catch (err) {
      // Extraire le message d'erreur proprement
      const errorMessage = err.response?.data?.message 
        || err.response?.data 
        || err.message 
        || "Erreur lors de la connexion";
      
      set({
        error: errorMessage, // Stocker seulement le message, pas l'objet complet
        loading: false,
      });
      
      toast.error(errorMessage);
      throw err; // Propager l'erreur pour le composant
    }
  },

  logout: () => {
    set({ AdminUser: null, accessToken: null, error: null });
    localStorage.removeItem("accessToken");
    toast.success("Déconnexion réussie");
  },
}));
