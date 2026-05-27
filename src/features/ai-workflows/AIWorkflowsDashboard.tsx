import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, Plus, Play, GitMerge, Mail, Database, AlertCircle } from 'lucide-react';

export function AIWorkflowsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Workflow className="text-[#DC143C] w-6 h-6" /> AI Workflows
          </h2>
          <p className="text-slate-400">Design and monitor intelligent operational sequences</p>
        </div>
        <button className="px-4 py-2 bg-[#DC143C] text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-600 transition-colors">
          <Plus className="w-4 h-4" /> Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-bold text-white">Templates</h3>
          {[
            { name: 'Welcome New Customer', icon: Mail, color: 'text-blue-400' },
            { name: 'Delivery Exception Recovery', icon: AlertCircle, color: 'text-red-400' },
            { name: 'Invoice Follow-Up', icon: Database, color: 'text-green-400' },
            { name: 'High-Value Escalation', icon: GitMerge, color: 'text-purple-400' }
          ].map((tpl, i) => (
            <div key={i} className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-500 cursor-pointer transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <tpl.icon className={`w-5 h-5 ${tpl.color}`} />
                <h4 className="font-medium text-white group-hover:text-[#DC143C] transition-colors">{tpl.name}</h4>
              </div>
              <p className="text-xs text-slate-400">Pre-built sequence with AI decision nodes.</p>
            </div>
          ))}
        </div>

        <div className="md:col-span-3 bg-slate-900 border border-slate-700 rounded-xl flex flex-col h-[600px] overflow-hidden">
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-white">Editor: Delivery Exception Recovery</h3>
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-slate-700 text-white rounded text-sm hover:bg-slate-600">Save Draft</button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#DC143C] text-white rounded text-sm hover:bg-red-600">
                <Play className="w-4 h-4" /> Run Test
              </button>
            </div>
          </div>

          {/* Visual Canvas Placeholder */}
          <div className="flex-1 bg-slate-950 p-8 overflow-auto relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-6">

              {/* Trigger */}
              <div className="w-64 bg-slate-800 border-2 border-blue-500/50 rounded-lg p-4 shadow-lg text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Trigger</div>
                <AlertCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <h4 className="text-white font-medium">Exception Detected</h4>
                <p className="text-xs text-slate-400 mt-1">Status changes to "Delayed"</p>
              </div>

              <div className="w-0.5 h-6 bg-slate-600"></div>

              {/* AI Node */}
              <div className="w-64 bg-[#DC143C]/10 border-2 border-[#DC143C]/50 rounded-lg p-4 shadow-lg text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#DC143C] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">AI Decision</div>
                <GitMerge className="w-6 h-6 text-[#DC143C] mx-auto mb-2" />
                <h4 className="text-white font-medium">Analyze Severity</h4>
                <p className="text-xs text-slate-400 mt-1">Evaluate delay reason & impact</p>
              </div>

              <div className="flex w-[400px] justify-between">
                <div className="w-1/2 h-[30px] border-l-2 border-t-2 border-slate-600 rounded-tl-lg transform translate-x-px"></div>
                <div className="w-1/2 h-[30px] border-r-2 border-t-2 border-slate-600 rounded-tr-lg transform -translate-x-px"></div>
              </div>

              <div className="flex w-[480px] justify-between">
                {/* Branch A */}
                <div className="w-56 bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-lg text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Action (Minor)</div>
                  <Mail className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Send Apology Email</h4>
                  <p className="text-xs text-slate-400 mt-1">Use "Slight Delay" Template</p>
                </div>

                {/* Branch B */}
                <div className="w-56 bg-slate-800 border border-red-500/50 rounded-lg p-4 shadow-lg text-center relative">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Action (Major)</div>
                  <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Escalate to Support</h4>
                  <p className="text-xs text-slate-400 mt-1">Create High-Priority Ticket</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
