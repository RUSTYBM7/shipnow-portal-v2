import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Terminal, Key, Webhook, Play, Copy, CheckCircle } from 'lucide-react';

export function APIPlaygroundDashboard() {
  const [activeTab, setActiveTab] = useState<'rest' | 'webhooks' | 'keys' | 'partners'>('rest');
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/v1/shipments/track');
  const [copied, setCopied] = useState(false);

  const mockResponse = `{
  "status": "success",
  "data": {
    "tracking_number": "AWB-123456789",
    "status": "IN_TRANSIT",
    "location": "London Heathrow (LHR)",
    "timestamp": "2026-05-25T14:32:00Z",
    "estimated_delivery": "2026-05-27T10:00:00Z"
  }
}`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Code className="text-[#DC143C] w-6 h-6" /> API Playground
          </h2>
          <p className="text-slate-400">Test endpoints, manage keys, and configure integrations</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-slate-700">
        {[
          { id: 'rest', label: 'REST Console', icon: Terminal },
          { id: 'webhooks', label: 'Webhooks', icon: Webhook },
          { id: 'keys', label: 'API Keys', icon: Key },
          { id: 'partners', label: 'Partner Integrations', icon: Code },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#DC143C] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'rest' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Request Panel */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50">
              <h3 className="font-bold text-white mb-4">Request</h3>
              <div className="flex bg-slate-900 rounded-lg border border-slate-600 overflow-hidden">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="bg-slate-800 text-white px-4 py-2 border-r border-slate-600 outline-none font-bold"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="flex-1 bg-transparent text-white px-4 py-2 outline-none font-mono text-sm"
                />
                <button className="bg-[#DC143C] hover:bg-red-600 text-white px-6 py-2 font-bold flex items-center gap-2 transition-colors">
                  <Play className="w-4 h-4" /> Send
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="text-slate-400 text-sm font-medium mb-2">Headers</h4>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-sm">
                    <div className="flex gap-4 mb-2">
                      <span className="text-blue-400">Authorization:</span>
                      <span className="text-slate-300">Bearer sk_test_123...</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-blue-400">Content-Type:</span>
                      <span className="text-slate-300">application/json</span>
                    </div>
                  </div>
                </div>

                {method !== 'GET' && (
                  <div>
                    <h4 className="text-slate-400 text-sm font-medium mb-2">Body (JSON)</h4>
                    <textarea
                      className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-300 font-mono text-sm outline-none resize-none focus:border-slate-500"
                      defaultValue="{\n  \n}"
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Response Panel */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-white">Response</h3>
                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono text-xs font-bold">200 OK</span>
                <span className="text-slate-400 text-xs font-mono">142ms</span>
              </div>
              <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
                {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto bg-[#0d1117]">
              <pre className="text-sm font-mono text-slate-300">
                <code dangerouslySetInnerHTML={{ __html: mockResponse.replace(/"(.*?)"/g, '<span class="text-blue-400">"$1"</span>').replace(/: <span class="text-blue-400">"(.*?)"<\/span>/g, ': <span class="text-green-400">"$1"</span>') }} />
              </pre>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'keys' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white">API Keys</h3>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors">Generate New Key</button>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="p-4 text-slate-400 font-medium text-sm">Name</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Key</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Created</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Last Used</th>
                <th className="p-4 text-slate-400 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr className="hover:bg-slate-700/50">
                <td className="p-4 text-white font-medium">Production ERP</td>
                <td className="p-4 text-slate-300 font-mono text-sm">sk_live_8f92...a1b2</td>
                <td className="p-4 text-slate-400 text-sm">Jan 12, 2026</td>
                <td className="p-4 text-slate-400 text-sm">2 mins ago</td>
                <td className="p-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Active</span></td>
              </tr>
              <tr className="hover:bg-slate-700/50">
                <td className="p-4 text-white font-medium">Testing Staging</td>
                <td className="p-4 text-slate-300 font-mono text-sm">sk_test_4c5d...e6f7</td>
                <td className="p-4 text-slate-400 text-sm">Mar 05, 2026</td>
                <td className="p-4 text-slate-400 text-sm">1 day ago</td>
                <td className="p-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Active</span></td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      )}

      {activeTab === 'partners' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Shopify', 'WooCommerce', 'Amazon FBA', 'eBay', 'Etsy'].map((partner, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center hover:border-slate-500 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <Code className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-white font-bold mb-2">{partner}</h3>
              <p className="text-slate-400 text-sm mb-4">Official connector for auto-importing orders and sync tracking.</p>
              <button className="mt-auto px-6 py-2 border border-slate-600 rounded-lg text-white text-sm font-medium hover:bg-slate-700 transition-colors w-full">
                Configure
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'webhooks' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-center h-[400px]">
           <div className="text-center">
             <Webhook className="w-16 h-16 text-slate-600 mx-auto mb-4" />
             <h3 className="text-white font-bold text-lg mb-2">Webhook Management</h3>
             <p className="text-slate-400">Configure endpoints to receive real-time event notifications.</p>
             <button className="mt-6 px-6 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600">Add Endpoint</button>
           </div>
        </motion.div>
      )}

    </div>
  );
}
