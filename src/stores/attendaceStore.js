import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useAttendanceStore = create((set) => ({
  attendance: [],

  fetchAttendance: async (eventId) => {
    try {
      const res = await axiosInstance.get(`/API/events/${eventId}/attendance`);
      set({ attendance: res.data.attendance });
      return res.data;
    } catch (error) {
      console.error("❌ Erreur lors du chargement des présences :", error);
    }
  },

  closeEvent: async (eventId) => {
    try {
      const res = await axiosInstance.post(`/API/events/${eventId}/close`);
      return res.data;
    } catch (error) {
      console.error("❌ Erreur lors de la fermeture de l’événement :", error);
    }
  },

  markAttendance: async (eventId, qrData) => {
    try {
      const res = await axiosInstance.post(`/API/attendance/mark`, {
        event_id: eventId,
        qr_data: qrData,
      });
      set((state) => ({ attendance: [...state.attendance, res.data.attendance] }));
      return res.data;
    } catch (error) {
      console.error("❌ Erreur lors du marquage :", error);
    }
  },
}));
