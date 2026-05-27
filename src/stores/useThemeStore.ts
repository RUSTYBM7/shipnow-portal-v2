// Theme Store - manages light/dark/auto theme with system sync
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

interface ThemeState {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  colors: ThemeColors;
  fontFamily: string;

  // Actions
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  syncWithSystem: () => void;
}

// AirPak brand colors
const lightColors: ThemeColors = {
  primary: '#DC2626',
  secondary: '#0F172A',
  accent: '#22C55E',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#0F172A',
  textSecondary: '#64748B',
};

const darkColors: ThemeColors = {
  primary: '#EF4444',
  secondary: '#F8FAFC',
  accent: '#22C55E',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'auto',
      resolvedMode: 'light',
      colors: lightColors,
      fontFamily: 'Inter, system-ui, sans-serif',

      setMode: (mode) => {
        if (mode === 'auto') {
          get().syncWithSystem();
        } else {
          set({
            mode,
            resolvedMode: mode,
            colors: mode === 'dark' ? darkColors : lightColors,
          });
        }
      },

      toggleMode: () => {
        const { mode } = get();
        const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light';
        get().setMode(nextMode);
      },

      syncWithSystem: () => {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        set({
          mode: 'auto',
          resolvedMode: isDark ? 'dark' : 'light',
          colors: isDark ? darkColors : lightColors,
        });
      },
    }),
    {
      name: 'airpak-theme',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.mode === 'auto') {
      useThemeStore.getState().syncWithSystem();
    }
  });
}