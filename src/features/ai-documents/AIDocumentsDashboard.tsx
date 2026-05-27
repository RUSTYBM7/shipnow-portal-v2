import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, CheckCircle, Clock, Zap, Settings } from 'lucide-react';
import { AIDocumentsTemplates } from './AIDocumentsTemplates';

export function AIDocumentsDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'templates'>('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-[#DC143C] w-6 h-6" /> AI Documents
          </h2>
          <p className="text-slate-400">Auto-generate branded shipping documents from data</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'dashboard' ? 'bg-[#DC143C] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'templates' ? 'bg-[#DC143C] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Settings className="w-4 h-4" /> Templates
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Commercial Invoices', count: 142, icon: FileText, color: 'text-blue-400' },
              { label: 'Bills of Lading', count: 86, icon: FileText, color: 'text-green-400' },
              { label: 'Customs Declarations', count: 54, icon: FileText, color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 bg-slate-900 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.count}</p>
                  </div>
                </div>
                <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                  Generate Batch
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-white">Recent Generations</h3>
              <button className="text-sm text-[#DC143C] hover:text-red-400 font-medium">View All</button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="p-4 text-slate-400 font-medium text-sm">Shipment ID</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Document Type</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Status</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Date</th>
                  <th className="p-4 text-slate-400 font-medium text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {[
                  { id: 'SHP-9021', type: 'Commercial Invoice', status: 'completed', date: '2 mins ago' },
                  { id: 'SHP-9020', type: 'Customs Declaration', status: 'completed', date: '15 mins ago' },
                  { id: 'SHP-9019', type: 'Packing List', status: 'processing', date: 'Just now' },
                  { id: 'SHP-9018', type: 'Bill of Lading', status: 'completed', date: '1 hour ago' },
                ].map((doc, i) => (
                  <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-mono text-white text-sm">{doc.id}</td>
                    <td className="p-4 text-slate-300">{doc.type}</td>
                    <td className="p-4">
                      {doc.status === 'completed' ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle className="w-4 h-4" /> Ready</span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-400 text-sm"><Clock className="w-4 h-4" /> Processing</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{doc.date}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button disabled={doc.status !== 'completed'} className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded disabled:opacity-50">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'templates' && <AIDocumentsTemplates />}
    </div>
  );
}
