import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, LineChart, TrendingUp, AlertTriangle, Search, Lightbulb, MapPin, Package } from 'lucide-react';

export function AIAnalystDashboard() {
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="text-[#DC143C] w-6 h-6" /> AI Analyst 2.0
          </h2>
          <p className="text-slate-400">Natural language data exploration and predictive insights</p>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-slate-800 rounded-xl border border-[#DC143C]/30 p-2 shadow-[0_0_15px_rgba(220,20,60,0.15)] flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#DC143C]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything... e.g., 'Why are shipments to Germany delayed this week?' or 'Forecast Q3 revenue'"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#DC143C] transition-colors"
          />
        </div>
        <button className="px-8 py-3 bg-[#DC143C] text-white rounded-lg font-bold hover:bg-red-600 transition-colors">
          Analyze
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Alerts & Suggestions */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" /> Anomaly Detection
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-lg border border-yellow-500/30">
                <p className="text-sm font-medium text-white mb-1">Unusual Volume Spike</p>
                <p className="text-xs text-slate-400 mb-2">London hub is processing 45% more volume than historical average for Tuesday.</p>
                <button className="text-xs text-[#DC143C] font-bold">Investigate &rarr;</button>
              </div>
              <div className="p-4 bg-slate-900 rounded-lg border border-red-500/30">
                <p className="text-sm font-medium text-white mb-1">Route Delay Detected</p>
                <p className="text-xs text-slate-400 mb-2">LHR to CDG flights showing consistent 2hr delays over past 48hrs.</p>
                <button className="text-xs text-[#DC143C] font-bold">View Impact &rarr;</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-400" /> AI Suggestions
            </h3>
            <div className="space-y-3">
              {[
                'Compare Q1 vs Q2 European freight costs',
                'Identify top 5 clients by revenue growth',
                'Show carbon footprint reduction month-over-month',
                'Analyze customs clearance times by country'
              ].map((s, i) => (
                <button key={i} onClick={() => setQuery(s)} className="w-full text-left p-3 rounded-lg bg-slate-900 hover:bg-slate-700 text-sm text-slate-300 transition-colors border border-slate-700">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle/Right: Charts & Visuals */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-400">Predicted Revenue (Next 30D)</p>
                  <h3 className="text-2xl font-bold text-white">$2.4M</h3>
                </div>
                <div className="p-2 bg-green-500/20 text-green-400 rounded-lg flex items-center gap-1 text-sm font-bold">
                  <TrendingUp className="w-4 h-4" /> +12%
                </div>
              </div>
              <div className="h-32 flex items-end gap-2 pt-4">
                {/* Simulated Chart */}
                {[40, 45, 60, 50, 70, 65, 85, 80, 95, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#DC143C]/80 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-400">On-Time Delivery Probability</p>
                  <h3 className="text-2xl font-bold text-white">96.8%</h3>
                </div>
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-8">
                <div className="w-full bg-slate-900 rounded-full h-4 mb-2">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: '96.8%' }}></div>
                </div>
                <p className="text-xs text-slate-400 text-right">Based on current network conditions</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-[350px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white">Global Volume Heatmap</h3>
              <select className="bg-slate-900 border border-slate-700 text-white text-sm rounded px-3 py-1 outline-none">
                <option>Current Week</option>
                <option>Last 30 Days</option>
                <option>YTD</option>
              </select>
            </div>

            <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 relative overflow-hidden flex items-center justify-center">
              <MapPin className="w-12 h-12 text-[#DC143C] absolute opacity-20" />
              <p className="text-slate-500 font-mono text-sm z-10">MapLibre Visualization Loading...</p>

              {/* Fake heat spots */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#DC143C] rounded-full blur-3xl opacity-30"></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-yellow-500 rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
