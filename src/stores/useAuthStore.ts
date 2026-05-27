// Auth Store - manages user session, role, and impersonation
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'user' | 'admin' | 'super_admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  } | null;
  isImpersonating: boolean;
  originalUser: User | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: AuthState['session']) => void;
  setLoading: (isLoading: boolean) => void;
  login: (user: User, session: AuthState['session']) => void;
  logout: () => void;
  impersonate: (user: User) => void;
  stopImpersonation: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      session: null,
      isImpersonating: false,
      originalUser: null,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
      }),

      setSession: (session) => set({ session }),

      setLoading: (isLoading) => set({ isLoading }),

      login: (user, session) => set({
        user,
        session,
        isAuthenticated: true,
        isLoading: false,
        isImpersonating: false,
        originalUser: null,
      }),

      logout: () => set({
        user: null,
        session: null,
        isAuthenticated: false,
        isImpersonating: false,
        originalUser: null,
      }),

      impersonate: (user) => set((state) => ({
        isImpersonating: true,
        originalUser: state.user,
        user,
      })),

      stopImpersonation: () => set((state) => ({
        isImpersonating: false,
        user: state.originalUser,
        originalUser: null,
      })),

      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
      },

      isAdmin: () => get().hasRole(['admin', 'super_admin']),

      isSuperAdmin: () => get().hasRole('super_admin'),
    }),
    {
      name: 'airpak-auth',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);