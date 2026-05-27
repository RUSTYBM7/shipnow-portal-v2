import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Power, Settings, ShieldAlert, Cpu, CheckCircle, Activity, Play } from 'lucide-react';

export function AutopilotDashboard() {
  const [isAutopilotOn, setIsAutopilotOn] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              onClick={() => setIsAutopilotOn(!isAutopilotOn)}
              className={`w-20 h-10 rounded-full flex items-center transition-colors p-1 ${isAutopilotOn ? 'bg-[#DC143C]' : 'bg-slate-700'}`}
            >
              <motion.div
                layout
                className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center ${isAutopilotOn ? 'bg-white' : 'bg-slate-400'}`}
              >
                <Power className={`w-4 h-4 ${isAutopilotOn ? 'text-[#DC143C]' : 'text-slate-700'}`} />
              </motion.div>
            </button>
            {isAutopilotOn && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Autopilot <span className={`text-sm px-3 py-1 rounded-full font-bold uppercase tracking-widest ${isAutopilotOn ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>{isAutopilotOn ? 'Engaged' : 'Standby'}</span>
            </h2>
            <p className="text-slate-400 mt-1">AI-driven autonomous operations and exception handling</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-slate-400">
          <div className="text-right">
            <p>Tasks Automated Today</p>
            <p className="text-2xl font-bold text-white">4,281</p>
          </div>
          <div className="w-px bg-slate-700 mx-2"></div>
          <div className="text-right">
            <p>Human Interventions</p>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exception Handling Queue */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-yellow-500" /> Human-in-the-Loop Queue
              </h3>
              <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded">3 Action Required</span>
            </div>
            <div className="p-4 space-y-4">
              {[
                { id: 'EX-901', type: 'Customs Hold', desc: 'Missing commercial invoice value for shipment #8821 to BR', conf: '85%', action: 'Review Invoice' },
                { id: 'EX-902', type: 'Address Invalid', desc: 'Delivery address not recognized in routing DB for #9102', conf: '92%', action: 'Correct Address' },
                { id: 'EX-903', type: 'High Value Alert', desc: 'Declared value exceeds auto-approval threshold ($50k+)', conf: '100%', action: 'Manual Approval' }
              ].map((ex, i) => (
                <div key={i} className="bg-slate-900 border border-slate-700 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-slate-400 font-mono text-sm">{ex.id}</span>
                      <span className="font-bold text-white">{ex.type}</span>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">AI Conf: {ex.conf}</span>
                    </div>
                    <p className="text-sm text-slate-400">{ex.desc}</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium border border-slate-600 transition-colors">
                    {ex.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
             <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Recent Autonomous Actions
              </h3>
            </div>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-700">
                {[
                  { time: '10:42 AM', action: 'Rerouted shipment #4412 via FRA due to LHR weather', saved: '+4 hrs' },
                  { time: '10:38 AM', action: 'Auto-approved 45 standard invoices (Batch #88)', saved: '+2.5 hrs' },
                  { time: '10:15 AM', action: 'Triggered delay notification emails to 12 customers', saved: '+1 hr' }
                ].map((act, i) => (
                  <tr key={i} className="hover:bg-slate-700/50">
                    <td className="p-3 text-slate-500 whitespace-nowrap">{act.time}</td>
                    <td className="p-3 text-slate-300">{act.action}</td>
                    <td className="p-3 text-right text-green-400 font-bold whitespace-nowrap">Time Saved: {act.saved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" /> Auto-Approval Rules
            </h3>
            <div className="space-y-5">
              {[
                { name: 'Standard Invoices (<$5k)', active: true },
                { name: 'Routine Customs (EU/US)', active: true },
                { name: 'Refunds (<$100)', active: true },
                { name: 'Address Auto-Correction', active: false },
                { name: 'Carrier Rerouting', active: true }
              ].map((rule, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 font-medium">{rule.name}</span>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer ${rule.active ? 'bg-green-500' : 'bg-slate-600'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${rule.active ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
              <button className="w-full mt-4 py-2 border border-slate-600 rounded text-slate-300 hover:bg-slate-700 transition-colors text-sm font-medium">
                Manage All Rules
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-slate-700 rounded-xl p-6 relative overflow-hidden">
            <Cpu className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-5" />
            <h3 className="font-bold text-white mb-2">Neural Engine Status</h3>
            <p className="text-sm text-slate-400 mb-6">Model: AirPak-Ops-v2.1</p>

            <div className="space-y-3 relative z-10">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Confidence Threshold</span>
                  <span className="text-white font-bold">90%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[90%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Processing Load</span>
                  <span className="text-white font-bold">42%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[42%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
