// LogoWorkflow.tsx - Advanced Logo Engine for AirPak Express
// Realistic 3D logo with AI generation capabilities

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Wand2, Sparkles, Eye, RotateCcw, Share2, Copy, Check } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
type LogoVariant = 'icon' | 'full' | 'badge' | 'watermark';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AnimationPreset = 'fadeIn' | 'slideDown' | 'scaleIn' | 'drawOn' | 'float' | 'pulse' | 'spin' | 'hover' | 'tap' | 'shimmer' | 'heartbeat' | 'glitch';
type LogoStyle = 'modern' | 'classic' | 'futuristic' | 'luxury' | 'playful';

interface LogoConfig {
  variant: LogoVariant;
  size: LogoSize;
  animation: AnimationPreset;
  style: LogoStyle;
  color: string;
  animated: boolean;
}

// ============================================================================
// SIZE CONFIG
// ============================================================================
const SIZE_MAP: Record<LogoSize, number> = {
  xs: 32,
  sm: 48,
  md: 80,
  lg: 120,
  xl: 180,
  '2xl': 240,
};

// ============================================================================
// 3D LOGO SVG COMPONENT
// ============================================================================
interface LogoSVGProps {
  size: number;
  variant: LogoVariant;
  animated: boolean;
  animation?: AnimationPreset;
  className?: string;
}

export const AirPakLogoSVG: React.FC<LogoSVGProps> = ({ size, variant, animated, animation = 'fadeIn', className = '' }) => {
  const [copied, setCopied] = useState(false);

  const getAnimationProps = () => {
    switch (animation) {
      case 'float':
        return { animate: { y: [0, -8, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } };
      case 'pulse':
        return { animate: { scale: [1, 1.05, 1] }, transition: { duration: 2, repeat: Infinity } };
      case 'spin':
        return { animate: { rotate: 360 }, transition: { duration: 4, repeat: Infinity, ease: 'linear' } };
      case 'shimmer':
        return {};
      case 'heartbeat':
        return { animate: { scale: [1, 1.1, 1] }, transition: { duration: 1.5, repeat: Infinity } };
      default:
        return {};
    }
  };

  const gradientId = `airpak-gradient-${size}`;
  const glowId = `airpak-glow-${size}`;
  const shineId = `airpak-shine-${size}`;

  const logoContent = (
    <svg
      width={size}
      height={size * (variant === 'icon' ? 1 : 1.3)}
      viewBox={`0 0 ${size} ${size * (variant === 'icon' ? 1 : 1.3)}`}
      className={className}
    >
      <defs>
        {/* Metallic Red Gradient */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF5350" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="#DC2626" floodOpacity="0.6" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Drop Shadow */}
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>

        {/* Shine Gradient */}
        <linearGradient id={shineId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
        </linearGradient>

        {/* Wing Gradient */}
        <linearGradient id="wingGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      {/* Wings - Express Delivery Motion */}
      <g filter="url(#dropShadow)">
        {/* Left Wing */}
        <path
          d={`M ${size * 0.15} ${size * 0.45} Q ${size * 0.05} ${size * 0.4} ${size * 0.02} ${size * 0.35} L ${size * 0.12} ${size * 0.55} Z`}
          fill="url(#wingGrad)"
          opacity="0.9"
        />
        <path
          d={`M ${size * 0.18} ${size * 0.5} Q ${size * 0.08} ${size * 0.48} ${size * 0.05} ${size * 0.43} L ${size * 0.15} ${size * 0.6} Z`}
          fill="#94A3B8"
          opacity="0.7"
        />

        {/* Right Wing */}
        <path
          d={`M ${size * 0.85} ${size * 0.45} Q ${size * 0.95} ${size * 0.4} ${size * 0.98} ${size * 0.35} L ${size * 0.88} ${size * 0.55} Z`}
          fill="url(#wingGrad)"
          opacity="0.9"
        />
        <path
          d={`M ${size * 0.82} ${size * 0.5} Q ${size * 0.92} ${size * 0.48} ${size * 0.95} ${size * 0.43} L ${size * 0.85} ${size * 0.6} Z`}
          fill="#94A3B8"
          opacity="0.7"
        />
      </g>

      {/* 3D Isometric Package Box */}
      <g filter="url(#dropShadow)">
        {/* Top Face */}
        <polygon
          points={`${size * 0.35} ${size * 0.15}, ${size * 0.65} ${size * 0.15}, ${size * 0.75} ${size * 0.25}, ${size * 0.45} ${size * 0.25}`}
          fill="url(#gradientId)"
        />

        {/* Front Face */}
        <polygon
          points={`${size * 0.25} ${size * 0.25}, ${size * 0.45} ${size * 0.25}, ${size * 0.45} ${size * 0.65}, ${size * 0.25} ${size * 0.65}`}
          fill="#DC2626"
        />

        {/* Right Side Face */}
        <polygon
          points={`${size * 0.45} ${size * 0.25}, ${size * 0.65} ${size * 0.25}, ${size * 0.65} ${size * 0.65}, ${size * 0.45} ${size * 0.65}`}
          fill="#B91C1C"
        />

        {/* Shine Overlay on Top */}
        <polygon
          points={`${size * 0.35} ${size * 0.15}, ${size * 0.55} ${size * 0.15}, ${size * 0.6} ${size * 0.22}, ${size * 0.4} ${size * 0.22}`}
          fill="white"
          opacity="0.3"
        />

        {/* "A" Icon on Front Face */}
        <text
          x={size * 0.35}
          y={size * 0.48}
          fontSize={size * 0.22}
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          A
        </text>

        {/* Speed/Motion Lines */}
        <g opacity="0.6">
          <line x1={size * 0.02} y1={size * 0.38} x2={size * 0.12} y2={size * 0.38} stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1={size * 0.02} y1={size * 0.42} x2={size * 0.08} y2={size * 0.42} stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={size * 0.98} y1={size * 0.38} x2={size * 0.88} y2={size * 0.38} stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1={size * 0.98} y1={size * 0.42} x2={size * 0.92} y2={size * 0.42} stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>

      {/* Glow Effect */}
      <circle cx={size * 0.5} cy={size * 0.4} r={size * 0.4} fill="none" stroke="#DC2626" strokeWidth="2" opacity="0.3" filter="url(#glowId)" />

      {/* Text for 'full' variant */}
      {variant !== 'icon' && (
        <g transform={`translate(${size * 0.1}, ${size * 0.95})`}>
          <text
            x={size * 0.4}
            y={size * 0.08}
            fontSize={size * 0.08}
            fontWeight="bold"
            fill="#DC2626"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
          >
            AIRPAK EXPRESS
          </text>
        </g>
      )}

      {/* Badge ® for badge variant */}
      {variant === 'badge' && (
        <g transform={`translate(${size * 0.75}, ${size * 0.1})`}>
          <circle cx="0" cy="0" r={size * 0.05} fill="#DC2626" />
          <text x="0" y={size * 0.015} fontSize={size * 0.035} fill="white" textAnchor="middle" fontWeight="bold">®</text>
        </g>
      )}
    </svg>
  );

  return (
    <motion.div {...getAnimationProps()} className="inline-block">
      {logoContent}
    </motion.div>
  );
};

// ============================================================================
// AUTO-HEADER COMPONENT
// ============================================================================
interface AutoHeaderProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}

export const AutoHeader: React.FC<AutoHeaderProps> = ({ variant = 'full', size = 'md', className = '' }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <AirPakLogoSVG size={SIZE_MAP[size]} variant={variant} animated={false} />
        <nav className="hidden md:flex items-center gap-6">
          <a href="#track" className="text-slate-700 hover:text-red-600 font-medium">Track</a>
          <a href="#ship" className="text-slate-700 hover:text-red-600 font-medium">Ship</a>
          <a href="#support" className="text-slate-700 hover:text-red-600 font-medium">Support</a>
        </nav>
      </div>
    </motion.header>
  );
};

// ============================================================================
// BRAND ENGINE
// ============================================================================
interface BrandEngineProps {
  children: React.ReactNode;
  watermarkEnabled?: boolean;
}

export const BrandEngine: React.FC<BrandEngineProps> = ({ children, watermarkEnabled = true }) => {
  return (
    <div className="relative">
      {children}
      {watermarkEnabled && (
        <div className="fixed bottom-4 right-4 opacity-10 pointer-events-none">
          <AirPakLogoSVG size={64} variant="icon" animated={false} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// AI LOGO GENERATOR
// ============================================================================
interface AILogoGeneratorProps {
  onLogoGenerated?: (svg: string) => void;
  className?: string;
}

export const AILogoGenerator: React.FC<AILogoGeneratorProps> = ({ onLogoGenerated, className = '' }) => {
  const [style, setStyle] = useState<LogoStyle>('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

  const styles: { value: LogoStyle; label: string; icon: string }[] = [
    { value: 'modern', label: 'Modern', icon: '◼️' },
    { value: 'classic', label: 'Classic', icon: '🏛️' },
    { value: 'futuristic', label: 'Futuristic', icon: '🚀' },
    { value: 'luxury', label: 'Luxury', icon: '✨' },
    { value: 'playful', label: 'Playful', icon: '🎨' },
  ];

  const generateLogos = async () => {
    setIsGenerating(true);

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const variations = [
      `Generated ${style} variant 1`,
      `Generated ${style} variant 2`,
      `Generated ${style} variant 3`,
    ];

    setGeneratedLogos(variations);
    setIsGenerating(false);
    onLogoGenerated?.(variations[0]);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold text-lg">AI Logo Generator</h3>
      </div>

      {/* Style Selector */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {styles.map((s) => (
          <button
            key={s.value}
            onClick={() => setStyle(s.value)}
            className={`p-3 rounded-xl text-center transition-all ${
              style === s.value
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xs font-medium">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={generateLogos}
        disabled={isGenerating}
        className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Generate 3 Variations
          </>
        )}
      </button>

      {/* Generated Variants */}
      <AnimatePresence>
        {generatedLogos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid grid-cols-3 gap-4"
          >
            {generatedLogos.map((logo, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedLogo === logo ? 'ring-2 ring-red-600 bg-red-50' : 'bg-slate-50 hover:bg-slate-100'
                }`}
                onClick={() => setSelectedLogo(logo)}
              >
                <div className="aspect-square flex items-center justify-center">
                  <AirPakLogoSVG size={64} variant="icon" animated={false} />
                </div>
                <p className="text-center text-xs text-slate-500 mt-2">Variant {i + 1}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Options */}
      {selectedLogo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          {['SVG', 'PNG', 'ICO', 'PWA'].map((format) => (
            <button
              key={format}
              className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {format}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// LOGO PREVIEW & CUSTOMIZATION
// ============================================================================
interface LogoPreviewProps {
  config: LogoConfig;
  onConfigChange: (config: LogoConfig) => void;
}

export const LogoPreview: React.FC<LogoPreviewProps> = ({ config, onConfigChange }) => {
  const [previewAnimation, setPreviewAnimation] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Size Options */}
      <div className="mb-6">
        <label className="text-sm font-medium text-slate-600 mb-3 block">Size</label>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(SIZE_MAP) as LogoSize[]).map((size) => (
            <button
              key={size}
              onClick={() => onConfigChange({ ...config, size })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                config.size === size ? 'bg-red-600 text-white' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {size.toUpperCase()} ({SIZE_MAP[size]}px)
            </button>
          ))}
        </div>
      </div>

      {/* Variant Options */}
      <div className="mb-6">
        <label className="text-sm font-medium text-slate-600 mb-3 block">Variant</label>
        <div className="flex gap-2 flex-wrap">
          {(['icon', 'full', 'badge', 'watermark'] as LogoVariant[]).map((variant) => (
            <button
              key={variant}
              onClick={() => onConfigChange({ ...config, variant })}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                config.variant === variant ? 'bg-red-600 text-white' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      {/* Animation Options */}
      <div className="mb-6">
        <label className="text-sm font-medium text-slate-600 mb-3 block">Animation</label>
        <div className="flex gap-2 flex-wrap">
          {(['fadeIn', 'slideDown', 'scaleIn', 'float', 'pulse', 'shimmer'] as AnimationPreset[]).map((anim) => (
            <button
              key={anim}
              onClick={() => onConfigChange({ ...config, animation: anim })}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                config.animation === anim ? 'bg-red-600 text-white' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {anim}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div className="bg-slate-900 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
        <div
          className="cursor-pointer"
          onClick={() => setPreviewAnimation(!previewAnimation)}
        >
          <AirPakLogoSVG
            size={SIZE_MAP[config.size]}
            variant={config.variant}
            animated={config.animated}
            animation={previewAnimation ? config.animation : 'fadeIn'}
          />
        </div>
      </div>

      <p className="text-center text-sm text-slate-500 mt-4">Click logo to preview animation</p>
    </div>
  );
};

// ============================================================================
// MAIN LOGO WORKFLOW COMPONENT
// ============================================================================
interface LogoWorkflowProps {
  className?: string;
}

export const LogoWorkflow: React.FC<LogoWorkflowProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<LogoConfig>({
    variant: 'full',
    size: 'md',
    animation: 'fadeIn',
    style: 'modern',
    color: '#DC2626',
    animated: true,
  });
  const [activeTab, setActiveTab] = useState<'preview' | 'generator' | 'brand'>('preview');

  const tabs = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'generator', label: 'AI Generator', icon: Sparkles },
    { id: 'brand', label: 'Brand Engine', icon: Sparkles },
  ] as const;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <LogoPreview config={config} onConfigChange={setConfig} />
          </motion.div>
        )}

        {activeTab === 'generator' && (
          <motion.div
            key="generator"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AILogoGenerator />
          </motion.div>
        )}

        {activeTab === 'brand' && (
          <motion.div
            key="brand"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Brand Guidelines</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-sm text-slate-600 mb-1">Primary Color</p>
                  <p className="font-bold text-red-600">#DC2626</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600 mb-1">Secondary</p>
                  <p className="font-bold">#0F172A</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600 mb-1">Accent</p>
                  <p className="font-bold">#22C55E</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600 mb-1">Clear Space</p>
                  <p className="font-bold">4x logo height</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-slate-50 rounded-xl flex items-center gap-3 hover:bg-slate-100">
                  <Copy className="w-5 h-5 text-slate-600" />
                  <span className="font-medium">Copy Logo SVG</span>
                </button>
                <button className="p-4 bg-slate-50 rounded-xl flex items-center gap-3 hover:bg-slate-100">
                  <Share2 className="w-5 h-5 text-slate-600" />
                  <span className="font-medium">Share Brand Kit</span>
                </button>
                <button className="p-4 bg-slate-50 rounded-xl flex items-center gap-3 hover:bg-slate-100">
                  <Download className="w-5 h-5 text-slate-600" />
                  <span className="font-medium">Export Assets</span>
                </button>
                <button className="p-4 bg-slate-50 rounded-xl flex items-center gap-3 hover:bg-slate-100">
                  <Check className="w-5 h-5 text-slate-600" />
                  <span className="font-medium">Brand Audit</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogoWorkflow;