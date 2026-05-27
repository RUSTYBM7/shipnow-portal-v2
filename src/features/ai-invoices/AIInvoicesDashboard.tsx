import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, DollarSign, Send, CheckCircle, Clock, Plus, Settings, CreditCard } from 'lucide-react';
import { InvoiceTemplates } from './InvoiceTemplates';

export function AIInvoicesDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'templates'>('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-[#DC143C] w-6 h-6" /> AI Invoices Engine
          </h2>
          <p className="text-slate-400">Automated multi-currency invoicing and payment tracking</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'dashboard' ? 'bg-[#DC143C] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            Dashboard
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Outstanding', value: '$45,210', icon: Clock, color: 'text-yellow-400' },
              { label: 'Paid (30d)', value: '$128,450', icon: CheckCircle, color: 'text-green-400' },
              { label: 'Overdue', value: '$8,400', icon: DollarSign, color: 'text-red-400' },
              { label: 'Avg Time to Pay', value: '14 Days', icon: Activity, color: 'text-blue-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white">Recent Invoices</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-[#DC143C] text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                <Plus className="w-4 h-4" /> Create Invoice
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="p-4 text-slate-400 font-medium text-sm">Invoice #</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Client</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Amount</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Due Date</th>
                  <th className="p-4 text-slate-400 font-medium text-sm">Status</th>
                  <th className="p-4 text-slate-400 font-medium text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {[
                  { id: 'INV-2026-001', client: 'Global Tech Corp', amount: '$4,500.00', date: '2026-06-15', status: 'sent' },
                  { id: 'INV-2026-002', client: 'EcoRetail', amount: '€2,100.00', date: '2026-05-30', status: 'paid' },
                  { id: 'INV-2026-003', client: 'Quantum Industries', amount: '$12,450.00', date: '2026-05-10', status: 'overdue' },
                  { id: 'INV-2026-004', client: 'Nexus Logistics', amount: '£3,200.00', date: '2026-06-20', status: 'draft' },
                ].map((inv, i) => (
                  <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-mono text-white text-sm">{inv.id}</td>
                    <td className="p-4 text-slate-300 font-medium">{inv.client}</td>
                    <td className="p-4 text-white font-mono">{inv.amount}</td>
                    <td className="p-4 text-slate-400 text-sm">{inv.date}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        inv.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        inv.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                        inv.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-600 text-slate-300'
                      }`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded" title="Send Payment Link">
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded" title="Send Email">
                        <Send className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'templates' && <InvoiceTemplates />}
    </div>
  );
}

// Quick component for Activity icon missing in lucide import
function Activity(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
}
