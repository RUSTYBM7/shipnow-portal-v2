// Logo Store - manages logo variants and generation state
import { create } from 'zustand';

type LogoVariant = 'icon' | 'full' | 'badge' | 'watermark';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AnimationPreset = 'fadeIn' | 'slideDown' | 'scaleIn' | 'drawOn' | 'float' | 'pulse' | 'spin' | 'hover' | 'tap' | 'shimmer' | 'heartbeat' | 'glitch';
type LogoStyle = 'modern' | 'classic' | 'futuristic' | 'luxury' | 'playful';

interface LogoState {
  variant: LogoVariant;
  size: LogoSize;
  animation: AnimationPreset;
  style: LogoStyle;
  isGenerating: boolean;
  generatedLogos: string[];
  selectedLogo: string | null;

  // Actions
  setVariant: (variant: LogoVariant) => void;
  setSize: (size: LogoSize) => void;
  setAnimation: (animation: AnimationPreset) => void;
  setStyle: (style: LogoStyle) => void;
  setGenerating: (isGenerating: boolean) => void;
  addGeneratedLogo: (logo: string) => void;
  selectLogo: (logo: string | null) => void;
  reset: () => void;
}

const initialState = {
  variant: 'full' as LogoVariant,
  size: 'md' as LogoSize,
  animation: 'fadeIn' as AnimationPreset,
  style: 'modern' as LogoStyle,
  isGenerating: false,
  generatedLogos: [],
  selectedLogo: null,
};

export const useLogoStore = create<LogoState>((set) => ({
  ...initialState,

  setVariant: (variant) => set({ variant }),
  setSize: (size) => set({ size }),
  setAnimation: (animation) => set({ animation }),
  setStyle: (style) => set({ style }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  addGeneratedLogo: (logo) => set((state) => ({
    generatedLogos: [...state.generatedLogos, logo]
  })),
  selectLogo: (logo) => set({ selectedLogo: logo }),
  reset: () => set(initialState),
}));