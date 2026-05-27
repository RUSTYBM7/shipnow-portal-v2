import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function InvoiceTemplates() {
  const [activeTemplate, setActiveTemplate] = useState(0);

  const templates = [
    { name: 'Corporate Classic', theme: 'light' },
    { name: 'Modern Minimal', theme: 'light' },
    { name: 'Gradient Glass', theme: 'dark' },
    { name: 'Dark Executive', theme: 'dark' },
    { name: 'iOS Clean', theme: 'light' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 h-[700px]">
      <div className="w-64 space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Template Styles</h3>
        {templates.map((tpl, i) => (
          <div
            key={i}
            onClick={() => setActiveTemplate(i)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${activeTemplate === i ? 'bg-[#DC143C]/20 border-[#DC143C]' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
          >
            <h4 className="text-white font-medium mb-1">{tpl.name}</h4>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${tpl.theme === 'dark' ? 'bg-slate-900 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
              {tpl.theme} Mode
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center z-10">
          <h3 className="text-white font-medium">Live Preview: {templates[activeTemplate].name}</h3>
          <div className="text-sm text-slate-400">Auto-calculation enabled (Tax, Freight, Fuel)</div>
        </div>

        <div className={`flex-1 overflow-auto p-8 flex justify-center ${templates[activeTemplate].theme === 'dark' ? 'bg-slate-950' : 'bg-slate-200'}`}>
          <div className={`w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative p-12 flex flex-col ${
            templates[activeTemplate].theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-black'
          }`}>
            {/* Header */}
            <div className={`flex justify-between items-start mb-12 pb-8 border-b-2 ${templates[activeTemplate].theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
              <div>
                <img src="/assets/airpak-logo.jpeg" alt="AirPak Logo" className="h-12 object-contain mb-6 rounded-md" />
                <div className={`text-sm ${templates[activeTemplate].theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  <p className="font-bold text-lg mb-1">AirPak Express</p>
                  <p>100 Logistics Way, Cardiff, Wales</p>
                  <p>VAT: GB123456789</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className={`text-5xl font-bold tracking-tight mb-4 ${templates[activeTemplate].theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>INVOICE</h1>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-right justify-items-end">
                  <div className="font-bold">Invoice No:</div>
                  <div className="font-mono">INV-2026-892</div>
                  <div className="font-bold">Date:</div>
                  <div>May 25, 2026</div>
                  <div className="font-bold">Due Date:</div>
                  <div className="text-[#DC143C] font-bold">Jun 25, 2026</div>
                </div>
              </div>
            </div>

            {/* Billed To */}
            <div className="mb-12">
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${templates[activeTemplate].theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Billed To</h3>
              <p className="font-bold text-lg">GlobalTech Industries Ltd.</p>
              <p className={`text-sm ${templates[activeTemplate].theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>400 Innovation Park, London, L1 2XX</p>
              <p className={`text-sm ${templates[activeTemplate].theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Contact: Sarah Jenkins</p>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm mb-8">
              <thead className={templates[activeTemplate].theme === 'dark' ? 'text-slate-400 border-b border-slate-700' : 'text-slate-500 border-b-2 border-slate-800'}>
                <tr>
                  <th className="py-3 text-left font-bold uppercase tracking-wider text-xs">Description</th>
                  <th className="py-3 text-center font-bold uppercase tracking-wider text-xs">Qty</th>
                  <th className="py-3 text-right font-bold uppercase tracking-wider text-xs">Rate</th>
                  <th className="py-3 text-right font-bold uppercase tracking-wider text-xs">Amount</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${templates[activeTemplate].theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
                <tr>
                  <td className="py-4">
                    <p className="font-bold">Express Air Freight (LHR to JFK)</p>
                    <p className={`text-xs mt-1 ${templates[activeTemplate].theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>AWB: 123-45678901, 250kg</p>
                  </td>
                  <td className="py-4 text-center">1</td>
                  <td className="py-4 text-right font-mono">$1,250.00</td>
                  <td className="py-4 text-right font-mono font-bold">$1,250.00</td>
                </tr>
                <tr>
                  <td className="py-4">
                    <p className="font-bold">Customs Clearance Services</p>
                  </td>
                  <td className="py-4 text-center">1</td>
                  <td className="py-4 text-right font-mono">$150.00</td>
                  <td className="py-4 text-right font-mono font-bold">$150.00</td>
                </tr>
                <tr>
                  <td className="py-4">
                    <p className="font-bold">Fuel Surcharge (12%)</p>
                  </td>
                  <td className="py-4 text-center">-</td>
                  <td className="py-4 text-right font-mono">-</td>
                  <td className="py-4 text-right font-mono font-bold">$150.00</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
              <div className="w-64 space-y-3">
                <div className={`flex justify-between text-sm ${templates[activeTemplate].theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Subtotal</span>
                  <span className="font-mono">$1,550.00</span>
                </div>
                <div className={`flex justify-between text-sm ${templates[activeTemplate].theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Tax (0%)</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className={`flex justify-between text-lg font-bold pt-3 border-t ${templates[activeTemplate].theme === 'dark' ? 'border-slate-700' : 'border-slate-300'}`}>
                  <span>Total Due</span>
                  <span className="font-mono text-[#DC143C]">$1,550.00</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 flex justify-between items-end border-t border-slate-200">
              <div className={`text-xs ${templates[activeTemplate].theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                <p className="font-bold mb-1">Payment Instructions:</p>
                <p>Please pay via Bank Transfer to:</p>
                <p>AirPak Express Ltd.</p>
                <p>Acct: 12345678 | Sort: 12-34-56</p>
              </div>
              <button className="px-6 py-2 bg-[#DC143C] text-white rounded font-medium shadow-lg hover:bg-red-600">
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
