import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@workspace/api-client-react';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  setAuth: (token: string, user: UserProfile) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      updateUser: (updates) => set((state) => ({ 
        user: state.user ? { ...state.user, ...updates } : null 
      })),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'barista-auth-storage',
    }
  )
);
