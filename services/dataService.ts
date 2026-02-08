import { User, Drug, Dose } from '../types';

const KEYS = {
  USER: 'bioguard_user',
  MEDS: 'bioguard_meds',
  DOSES: 'bioguard_doses',
};

/**
 * Data Service - Repository Pattern
 * Currently uses LocalStorage, but designed to be swapped with Firebase/Firestore easily.
 */
export const dataService = {
  // --- USER ---
  getUser: async (): Promise<User | null> => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: async (user: User | null): Promise<void> => {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  },

  // --- MEDICATIONS ---
  getMedications: async (): Promise<Drug[]> => {
    const data = localStorage.getItem(KEYS.MEDS);
    return data ? JSON.parse(data) : [];
  },

  saveMedications: async (meds: Drug[]): Promise<void> => {
    localStorage.setItem(KEYS.MEDS, JSON.stringify(meds));
  },

  // --- DOSES ---
  getDoses: async (): Promise<Dose[]> => {
    const data = localStorage.getItem(KEYS.DOSES);
    return data ? JSON.parse(data) : [];
  },

  saveDoses: async (doses: Dose[]): Promise<void> => {
    localStorage.setItem(KEYS.DOSES, JSON.stringify(doses));
  },

  // --- UTILS ---
  clearAllData: async (): Promise<void> => {
    // Keep user logged in, but clear health data? 
    // Or clear everything? Based on UI, usually strictly health data.
    localStorage.removeItem(KEYS.MEDS);
    localStorage.removeItem(KEYS.DOSES);
  }
};