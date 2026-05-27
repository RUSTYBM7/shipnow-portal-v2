import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Target, Activity } from 'lucide-react';

export function EmailCampaigns() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Active Campaigns</h3>
        <button className="px-4 py-2 bg-[#DC143C] text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-600 transition-colors">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-400 w-5 h-5" />
            <h4 className="text-slate-300 font-medium">Total Audience</h4>
          </div>
          <p className="text-2xl font-bold text-white">45,210</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-green-400 w-5 h-5" />
            <h4 className="text-slate-300 font-medium">A/B Testing</h4>
          </div>
          <p className="text-2xl font-bold text-white">2 Active</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-purple-400 w-5 h-5" />
              <h4 className="text-slate-300 font-medium">Send-Time Optimizer</h4>
            </div>
            <p className="text-sm text-slate-400">AI-driven delivery</p>
          </div>
          <div className="w-12 h-6 bg-[#DC143C] rounded-full relative cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="p-4 text-slate-400 font-medium text-sm">Campaign Name</th>
              <th className="p-4 text-slate-400 font-medium text-sm">Segment</th>
              <th className="p-4 text-slate-400 font-medium text-sm">Sent</th>
              <th className="p-4 text-slate-400 font-medium text-sm">Opens</th>
              <th className="p-4 text-slate-400 font-medium text-sm">Clicks</th>
              <th className="p-4 text-slate-400 font-medium text-sm">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {[
              { name: 'Holiday Promo 2026', segment: 'All Active Users', sent: '12,500', opens: '45%', clicks: '12%', status: 'Active' },
              { name: 'New Route Announcement', segment: 'Europe Shippers', sent: '4,200', opens: '62%', clicks: '28%', status: 'Active' },
              { name: 'VIP Upgrade Offer', segment: 'High Volume', sent: '850', opens: '88%', clicks: '45%', status: 'Draft' },
              { name: 'Service Disruption Alert', segment: 'Affected Regions', sent: '2,100', opens: '94%', clicks: '15%', status: 'Completed' },
            ].map((c, i) => (
              <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                <td className="p-4 font-medium text-white">{c.name}</td>
                <td className="p-4 text-slate-400 text-sm">{c.segment}</td>
                <td className="p-4 text-slate-300">{c.sent}</td>
                <td className="p-4 text-green-400">{c.opens}</td>
                <td className="p-4 text-purple-400">{c.clicks}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    c.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                    c.status === 'Draft' ? 'bg-slate-600 text-slate-300' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
