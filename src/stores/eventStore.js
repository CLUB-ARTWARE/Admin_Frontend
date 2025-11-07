import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useEventStore = create((set, get) => ({
  events: [],
  loading: false,
  presentUsers: [],
  absentUsers: [],
  // Dans votre store eventStore
clearUsers: () => set({
  presentUsers: [],
  absentUsers: []
}),

  fetchEvents: async (token) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/API/events", {
      });
      set({ events: res.data.event, loading: false });
    } catch (error) {
      console.error("Error fetching events:", error);
      set({ loading: false });
    }
  },

  createEvent: async (formData, token) => {
    try {
      const res = await axiosInstance.post("/API/events", formData, {
      });
      set({ events: [...get().events, res.data.event] });
      return res.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  updateEvent: async (eventId, payload, token) => {
    try {
      const res = await axiosInstance.patch(`/API/events/${eventId}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      set({
        events: get().events.map((e) =>
          e.id === eventId ? { ...e, ...res.data.event } : e
        ),
      });
      return res.data;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  deleteEvent: async (eventId, token) => {
    try {
      const res = await axiosInstance.delete(`/API/events/${eventId}`, {
      });
      set({ events: get().events.filter((e) => e.id !== eventId) });
      return res.data;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  fetchRegistrations: async (eventId, token) => {
    try {
      const res = await axiosInstance.get(`/API/events/${eventId}/registrations`, {
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching registrations:", error);
      throw error;
    }
  },
  fetchPresentUsers: async (eventId) => {
    try {
      const res = await axiosInstance.get(`/API/events/${eventId}/present`);
      set({ presentUsers: res.data.users }); // Stocke directement le tableau users
      return res.data.users;
    } catch (error) {
      console.error("Error fetching present users:", error);
      throw error;
    }
  },

  fetchAbsentUsers: async (eventId) => {
    try {
      const res = await axiosInstance.get(`/API/events/${eventId}/absent`);
      set({ absentUsers: res.data.users }); // Stocke directement le tableau users
      return res.data.users;
    } catch (error) {
      console.error("Error fetching absent users:", error);
      throw error;
    }
  },
  setUserPresent: async (eventId, userId) => {
    try {
      const res = await axiosInstance.post(`/API/events/${eventId}/users/${userId}`, {});
      
      // Mettre à jour les listes localement
      const { presentUsers, absentUsers } = get();
      
      // Retirer l'utilisateur de la liste des absents s'il y était
      const updatedAbsentUsers = absentUsers.filter(user => user.user_id !== userId);
      
      // Ajouter l'utilisateur à la liste des présents
      const userToAdd = absentUsers.find(user => user.user_id === userId) || 
                       presentUsers.find(user => user.user_id === userId);
      
      let updatedPresentUsers;
      if (userToAdd && !presentUsers.some(user => user.user_id === userId)) {
        // Ajouter l'utilisateur avec le timestamp mis à jour
        updatedPresentUsers = [...presentUsers, { 
          ...userToAdd, 
          status: "present",
          timestamp: new Date().toISOString()
        }];
      } else {
        updatedPresentUsers = presentUsers;
      }
      
      set({
        presentUsers: updatedPresentUsers,
        absentUsers: updatedAbsentUsers
      });
      
      return res.data;
    } catch (error) {
      console.error("Error setting user as present:", error);
      throw error;
    }
  }
}));