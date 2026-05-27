import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layout, Type, Image as ImageIcon, Zap, Check, ArrowRight, RefreshCcw, ThumbsUp, ThumbsDown } from 'lucide-react';

const SUGGESTIONS = [
  {
    id: 1,
    type: 'layout',
    icon: Layout,
    title: 'Optimize Checkout Flow',
    description: 'AI analysis indicates a 15% drop-off at the shipping method step. Suggesting a unified accordion layout to reduce friction.',
    impact: 'High',
    metric: '+3.2% Conversion Rate',
    status: 'pending'
  },
  {
    id: 2,
    type: 'copy',
    icon: Type,
    title: 'Rewrite Value Proposition',
    description: 'Current header "Ship anything, anywhere" is generic. AI generated variants based on competitor analysis show higher resonance.',
    impact: 'Medium',
    metric: '+12% Time on Site',
    status: 'pending'
  },
  {
    id: 3,
    type: 'media',
    icon: ImageIcon,
    title: 'Replace Hero Image',
    description: 'Current stock photo has a high bounce rate. AI generated 4 hyper-realistic localized shipping scenario images.',
    impact: 'Medium',
    metric: '-5% Bounce Rate',
    status: 'pending'
  },
  {
    id: 4,
    type: 'performance',
    icon: Zap,
    title: 'Lazy Load Analytics Scripts',
    description: 'Third-party tracking is blocking main thread. AI recommends deferring load to improve Core Web Vitals.',
    impact: 'High',
    metric: '-1.2s LCP',
    status: 'pending'
  }
];

export const AiSuggestionsDashboard = () => {
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);
  const [activeSuggestion, setActiveSuggestion] = useState(SUGGESTIONS[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAction = (id: number, action: 'apply' | 'dismiss') => {
    setSuggestions(prev => prev.map(s =>
      s.id === id ? { ...s, status: action === 'apply' ? 'applied' : 'dismissed' } : s
    ));

    // Select next pending suggestion
    const next = suggestions.find(s => s.id !== id && s.status === 'pending');
    if (next) setActiveSuggestion(next);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="flex h-full w-full bg-slate-50 gap-6">
      {/* Sidebar - List of suggestions */}
      <div className="w-96 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-5rem)]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI Suggestions
            </h2>
            <p className="text-sm text-slate-500 mt-1">Smart optimizations for your portal</p>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${isGenerating ? 'animate-spin text-indigo-500' : 'text-slate-400'}`}
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => setActiveSuggestion(suggestion)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                activeSuggestion.id === suggestion.id
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-transparent bg-slate-50 hover:bg-slate-100'
              } ${suggestion.status !== 'pending' ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  activeSuggestion.id === suggestion.id ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-500'
                }`}>
                  <suggestion.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 truncate">{suggestion.title}</h3>
                    {suggestion.status === 'applied' && <Check className="w-4 h-4 text-green-500" />}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{suggestion.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                      {suggestion.impact} Impact
                    </span>
                    <span className="text-[10px] font-medium text-emerald-600">
                      {suggestion.metric}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Preview & Action */}
      <div className="flex-1 p-6 h-[calc(100vh-5rem)] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSuggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <activeSuggestion.icon className="w-5 h-5" />
                    <span className="font-medium uppercase tracking-wider text-xs">
                      {activeSuggestion.type} Optimization
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">{activeSuggestion.title}</h1>
                  <p className="text-slate-600 mt-2 max-w-2xl">{activeSuggestion.description}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-1">Expected Lift</p>
                  <p className="text-xl font-bold text-emerald-600">{activeSuggestion.metric}</p>
                </div>
              </div>

              {/* Preview Area */}
              <div className="p-6 bg-slate-100/50">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Before & After Preview</h3>

                <div className="grid grid-cols-2 gap-6">
                  {/* Current */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <span className="font-medium text-slate-400">Current</span>
                    </div>
                    {/* Mock Content Based on Type */}
                    <div className="opacity-75 grayscale-[0.5]">
                      {activeSuggestion.type === 'copy' && (
                        <div className="text-center py-8">
                          <h4 className="text-2xl font-bold mb-2">Ship anything, anywhere</h4>
                          <p className="text-slate-500">Fast and reliable global shipping solutions.</p>
                        </div>
                      )}
                      {activeSuggestion.type === 'layout' && (
                        <div className="space-y-4">
                          <div className="h-10 bg-slate-100 rounded-lg w-full" />
                          <div className="h-10 bg-slate-100 rounded-lg w-full" />
                          <div className="h-10 bg-slate-100 rounded-lg w-full" />
                        </div>
                      )}
                      {activeSuggestion.type === 'media' && (
                        <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                          Generic Stock Photo
                        </div>
                      )}
                      {activeSuggestion.type === 'performance' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Bundle Size</span><span>2.4 MB</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">LCP</span><span className="text-red-500">3.8s</span></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  <div className="bg-white p-4 rounded-xl border-2 border-indigo-500 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                      AI GENERATED
                    </div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <span className="font-medium text-indigo-600 flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> Proposed
                      </span>
                    </div>
                    {/* Mock Content Based on Type */}
                    <div>
                      {activeSuggestion.type === 'copy' && (
                        <div className="text-center py-8">
                          <h4 className="text-2xl font-bold text-slate-900 mb-2">Global Logistics, Zero Friction.</h4>
                          <p className="text-slate-600">Enterprise-grade shipping platform that scales with your ambition.</p>
                        </div>
                      )}
                      {activeSuggestion.type === 'layout' && (
                        <div className="space-y-2">
                          <div className="p-3 border border-indigo-100 rounded-lg flex justify-between bg-indigo-50/30">
                            <span className="font-medium text-slate-700">1. Origin & Destination</span>
                            <Check className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="p-3 border-2 border-indigo-500 rounded-lg bg-white shadow-sm">
                            <span className="font-bold text-indigo-700">2. Select Shipping Method</span>
                            <div className="mt-3 space-y-2">
                              <div className="h-8 bg-slate-50 rounded" />
                              <div className="h-8 bg-slate-50 rounded" />
                            </div>
                          </div>
                        </div>
                      )}
                      {activeSuggestion.type === 'media' && (
                        <div className="aspect-video bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium shadow-inner">
                          AI Generated Contextual Image
                        </div>
                      )}
                      {activeSuggestion.type === 'performance' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm"><span className="text-slate-500">Bundle Size</span><span className="font-medium">1.1 MB</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-500">LCP</span><span className="font-bold text-emerald-500">1.4s</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Was this suggestion helpful?</span>
                  <button className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors"><ThumbsUp className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><ThumbsDown className="w-4 h-4" /></button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(activeSuggestion.id, 'dismiss')}
                    disabled={activeSuggestion.status !== 'pending'}
                    className="px-6 py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleAction(activeSuggestion.id, 'apply')}
                    disabled={activeSuggestion.status !== 'pending'}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:bg-slate-300"
                  >
                    {activeSuggestion.status === 'applied' ? 'Applied' : 'Apply Changes'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
