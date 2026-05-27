import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Eye, Copy, QrCode } from 'lucide-react';

export function AIDocumentsTemplates() {
  const templates = [
    { name: 'Commercial Invoice (Standard)', type: 'Invoice', active: true },
    { name: 'Customs Declaration (EU)', type: 'Customs', active: true },
    { name: 'Bill of Lading (Ocean)', type: 'Transport', active: true },
    { name: 'Air Waybill (Express)', type: 'Transport', active: false },
    { name: 'Detailed Packing List', type: 'Packing', active: true },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">Template Library</h3>
        {templates.map((tpl, i) => (
          <div key={i} className={`p-4 rounded-xl border cursor-pointer transition-colors ${i === 0 ? 'bg-[#DC143C]/10 border-[#DC143C]' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium">{tpl.name}</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${tpl.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {tpl.active ? 'Active' : 'Draft'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{tpl.type}</p>
          </div>
        ))}
      </div>

      <div className="md:col-span-3 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-medium">Template Editor: Commercial Invoice</h3>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 transition-colors"><QrCode className="w-4 h-4" /> Toggle QR</button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#DC143C] text-white rounded-lg text-sm hover:bg-red-600 transition-colors"><Edit2 className="w-4 h-4" /> Edit Fields</button>
          </div>
        </div>

        <div className="flex-1 bg-slate-950 p-8 flex justify-center overflow-auto">
          {/* Document Preview */}
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-12 shadow-2xl relative">
            <div className="flex justify-between items-start mb-12 border-b-2 border-red-600 pb-8">
              <div>
                <img src="/assets/airpak-logo.jpeg" alt="AirPak Logo" className="h-16 object-contain mb-4" />
                <div className="text-sm">
                  <p className="font-bold">AirPak Express HQ</p>
                  <p>100 Logistics Way, Cardiff, Wales, CF10 1EP</p>
                  <p>support@airpak-express.com | +44 29 2000 1234</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-2">COMMERCIAL INVOICE</h1>
                <p className="text-sm"><span className="font-bold">Invoice No:</span> {'{{invoice_id}}'}</p>
                <p className="text-sm"><span className="font-bold">Date:</span> {'{{current_date}}'}</p>
                <p className="text-sm"><span className="font-bold">AWB:</span> {'{{tracking_number}}'}</p>
                <div className="mt-4 inline-block p-2 border-2 border-slate-200 rounded">
                  <QrCode className="w-16 h-16 text-slate-800" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="bg-slate-100 p-2 font-bold text-sm mb-2 border-l-4 border-red-600">SHIPPER / EXPORTER</h3>
                <div className="text-sm whitespace-pre-wrap">{'{{shipper_details}}'}</div>
              </div>
              <div>
                <h3 className="bg-slate-100 p-2 font-bold text-sm mb-2 border-l-4 border-red-600">CONSIGNEE / IMPORTER</h3>
                <div className="text-sm whitespace-pre-wrap">{'{{consignee_details}}'}</div>
              </div>
            </div>

            <table className="w-full text-sm mb-12">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Description of Goods</th>
                  <th className="p-2 text-left">HS Code</th>
                  <th className="p-2 text-right">Unit Value</th>
                  <th className="p-2 text-right">Total Value</th>
                </tr>
              </thead>
              <tbody className="border-b border-slate-300">
                <tr className="bg-blue-50/50 border border-blue-200">
                  <td colSpan={5} className="p-4 text-center text-blue-600 font-mono text-xs">
                    {'{{#each items}}'} Dynamic row generation {'{{/each}}'}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="absolute bottom-12 left-12 right-12 text-center border-t pt-4 text-xs text-slate-500">
              Generated by AirPak Express AI Document System | Global Logistics Solutions
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
