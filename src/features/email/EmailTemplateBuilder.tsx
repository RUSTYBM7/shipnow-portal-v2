import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout, Type, Image, List, Save, Download, Play } from 'lucide-react';

export function EmailTemplateBuilder() {
  const [content, setContent] = useState('Welcome to AirPak Express');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 h-[700px]">
      <div className="w-64 bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col">
        <h3 className="text-lg font-bold text-white mb-4">Components</h3>
        <div className="space-y-2">
          {[
            { icon: Layout, label: 'Header' },
            { icon: Type, label: 'Text Block' },
            { icon: Image, label: 'Image' },
            { icon: List, label: 'Tracking Details' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg cursor-grab hover:bg-slate-700 border border-slate-700 transition-colors">
              <item.icon className="w-5 h-5 text-slate-400" />
              <span className="text-slate-200 text-sm">{item.label}</span>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-bold text-white mt-8 mb-4">Variables</h3>
        <div className="space-y-2">
          {['{{tracking_number}}', '{{customer_name}}', '{{shipment_status}}', '{{origin}}', '{{destination}}', '{{delivery_date}}'].map((v, i) => (
            <div key={i} className="text-xs bg-slate-900 text-slate-400 p-2 rounded border border-slate-700 font-mono cursor-pointer hover:text-white hover:border-slate-500 transition-colors">
              {v}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center z-10">
          <h3 className="text-white font-medium">Live Preview</h3>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><Save className="w-4 h-4" /></button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#DC143C] text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"><Play className="w-4 h-4" /> Test Send</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 bg-slate-950 flex justify-center">
          <div className="w-full max-w-2xl bg-black border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#111] p-6 flex justify-center items-center border-b border-slate-800">
              <img src="/assets/airpak-logo.jpeg" alt="AirPak Logo" className="h-12 object-contain rounded-md" />
            </div>

            <div className="p-8 text-center bg-gradient-to-b from-[#1a1a1a] to-black flex-1 border-b border-[#222]">
              <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">{content}</h1>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Dear {'{{customer_name}}'}, your shipment is now in transit. We are committed to delivering your package safely and on time.
              </p>

              <div className="bg-[#111] border border-slate-800 rounded-xl p-6 text-left mb-8 shadow-inner">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                  <span className="text-slate-500 uppercase text-xs font-bold tracking-wider">Tracking Number</span>
                  <span className="text-[#DC143C] font-mono font-bold text-lg">{'{{tracking_number}}'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">From</span>
                    <span className="text-white font-medium">{'{{origin}}'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">To</span>
                    <span className="text-white font-medium">{'{{destination}}'}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-slate-500 uppercase text-xs font-bold tracking-wider block mb-1">Est. Delivery</span>
                  <span className="text-white font-medium text-lg">{'{{delivery_date}}'}</span>
                </div>
              </div>

              <button className="px-8 py-4 bg-[#DC143C] text-white rounded-lg font-bold text-lg hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(220,20,60,0.4)]">
                Track Shipment Now
              </button>
            </div>

            <div className="bg-[#0a0a0a] p-6 text-center text-xs text-slate-600">
              <p className="mb-2">AirPak Express - Global Logistics Solutions</p>
              <p>Wales HQ • support@airpak-express.com</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
