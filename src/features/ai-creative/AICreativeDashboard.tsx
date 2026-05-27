import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Image as ImageIcon, Download, Share2, Sparkles, Wand2, Monitor, Instagram, Linkedin, FileText } from 'lucide-react';

export function AICreativeDashboard() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="text-[#DC143C] w-6 h-6" /> AI Creative Studio
          </h2>
          <p className="text-slate-400">Generate on-brand marketing materials and shipment graphics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="font-bold text-white mb-4">Brand Kit Enforced</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#DC143C]"></div>
                <span className="text-slate-300">Primary: AirPak Red</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700"></div>
                <span className="text-slate-300">Secondary: Dark Slate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white bg-slate-800">Aa</div>
                <span className="text-slate-300">Typography: Inter/Geist</span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Logo: Always present</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="font-bold text-white mb-4">Templates</h3>
            <div className="space-y-2">
              {['Shipment Promo', 'New Route Launch', 'Holiday Shipping', 'Express Delivery'].map((t, i) => (
                <button key={i} className="w-full text-left p-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate (e.g., 'A delivery van driving through London at sunset')"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#DC143C] transition-colors"
              />
              <Wand2 className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="px-6 py-3 bg-[#DC143C] text-white rounded-lg font-bold flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Sparkles className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden h-[600px] flex flex-col">
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
              <div className="flex gap-2">
                <button className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors" title="Square (1:1)"><Instagram className="w-4 h-4" /></button>
                <button className="p-2 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 transition-colors" title="Story (9:16)"><Monitor className="w-4 h-4" /></button>
                <button className="p-2 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 transition-colors" title="Landscape (16:9)"><Linkedin className="w-4 h-4" /></button>
                <button className="p-2 bg-slate-800 text-slate-400 rounded hover:bg-slate-700 transition-colors" title="A4 Print"><FileText className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-1.5 bg-slate-700 text-white rounded text-sm hover:bg-slate-600 transition-colors"><Share2 className="w-4 h-4" /> Share</button>
                <button className="flex items-center gap-2 px-4 py-1.5 bg-[#DC143C] text-white rounded text-sm hover:bg-red-600 transition-colors"><Download className="w-4 h-4" /> Export</button>
              </div>
            </div>

            <div className="flex-1 p-8 flex justify-center items-center relative overflow-hidden bg-slate-950">
              <div className="absolute inset-0 opacity-20 pointer-events-none grid grid-cols-12 grid-rows-12 gap-1">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border border-slate-800/30"></div>
                ))}
              </div>

              {/* Canvas Placeholder */}
              <div className="w-[500px] h-[500px] bg-slate-800 border border-slate-700 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 flex flex-col justify-center items-center text-slate-500">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                  <p>Canvas Editor Ready</p>
                  <p className="text-xs mt-2 text-center px-8">Generated images will appear here with BrandGuard applied automatically.</p>
                </div>

                {/* Example of what a generated poster might look like */}
                {!isGenerating && prompt.toLowerCase().includes('van') && (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black p-8 flex flex-col z-10">
                    <img src="/assets/airpak-logo.jpeg" alt="AirPak" className="h-10 object-contain self-start mb-auto" />

                    <div className="space-y-2 mb-8 z-20">
                      <h2 className="text-4xl font-bold text-white uppercase tracking-tighter leading-none">Global<br/><span className="text-[#DC143C]">Delivery</span><br/>Excellence</h2>
                      <p className="text-slate-300 max-w-[80%]">Fast, reliable, and secure logistics worldwide.</p>
                    </div>

                    <div className="mt-auto flex justify-between items-end border-t border-slate-700 pt-4">
                      <p className="text-xs font-bold text-slate-400 tracking-widest">AIRPAK-EXPRESS.COM</p>
                      <div className="w-12 h-12 bg-white rounded p-1">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://airpak-express.com" alt="QR" className="w-full h-full" />
                      </div>
                    </div>

                    {/* Abstract graphic representation of a van/speed */}
                    <div className="absolute right-[-50px] bottom-20 w-64 h-32 bg-[#DC143C] rounded-l-full opacity-20 blur-2xl transform -rotate-12 z-0"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
