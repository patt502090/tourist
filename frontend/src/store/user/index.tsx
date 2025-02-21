import { create } from 'zustand';
import { user } from '../../utils/types';
import validateSession from '../../services/validateSession';

interface userSlice {
  user: user | null;
  setUser: (user: user | null) => void;
  checkSession: () => Promise<void>;
  sessionLoading: string;
}
export const useUserSlice = create<userSlice>()((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user: user })),
  sessionLoading: 'Not Started',
  checkSession: async () => {
    try {
      set({ sessionLoading: 'Loading' });
      const response = await validateSession();
      set({ user: response?.data.user, sessionLoading: 'Completed' });
    } catch (error) {
      set({ user: null, sessionLoading: 'Completed' });
    }
  },
}));
