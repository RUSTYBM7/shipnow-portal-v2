import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, AlertTriangle, ShieldAlert, FileEdit,
  Search, Filter, MoreVertical, PlayCircle
} from 'lucide-react';
import { useApprovalStore } from '../../store/approvalStore';
import { ApprovalStatus } from './types';
import toast from 'react-hot-toast';

export const ApprovalDashboard = () => {
  const { queue, selectedItem, setSelectedItem, updateItemStatus } = useApprovalStore();
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSuperAdmin] = useState(true); // Mocking super admin status

  const filteredQueue = queue.filter(item => filter === 'all' || item.status === filter);

  const handleApprove = (id: string) => {
    updateItemStatus(id, 'approved');
    toast.success('Request approved & executed');
  };

  const handleReject = (id: string) => {
    updateItemStatus(id, 'rejected');
    toast.error('Request rejected');
  };

  const handleOverride = (id: string) => {
    updateItemStatus(id, 'approved');
    toast.success('SUPER ADMIN OVERRIDE: Executed Immediately', {
      icon: '🚀',
      style: { background: '#EF4444', color: '#fff' }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQueue.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQueue.map(i => i.id));
    }
  };

  const handleBatchApprove = () => {
    selectedIds.forEach(id => updateItemStatus(id, 'approved'));
    setSelectedIds([]);
    toast.success(`Batch approved ${selectedIds.length} items`);
  };

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-100 overflow-hidden">
      {/* Left List */}
      <div className="w-1/3 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold mb-4">AI Approval Gate</h2>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full bg-slate-800 border-none rounded-md pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-red-500"
              />
            </div>
            <button className="p-2 bg-slate-800 rounded-md hover:bg-slate-700">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'pending', 'approved', 'rejected', 'escalated'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${
                  filter === f ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-4 p-2 bg-slate-800 rounded-md flex items-center justify-between">
              <span className="text-sm font-medium">{selectedIds.length} selected</span>
              <div className="flex gap-2">
                <button onClick={handleBatchApprove} className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Approve All</button>
                <button className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">Reject All</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 flex items-center border-b border-slate-800">
            <input
              type="checkbox"
              checked={selectedIds.length > 0 && selectedIds.length === filteredQueue.length}
              onChange={toggleSelectAll}
              className="mr-3 ml-2 rounded border-slate-700 bg-slate-800 text-red-500 focus:ring-red-500"
            />
            <span className="text-xs text-slate-400 font-medium uppercase">Select All</span>
          </div>
          {filteredQueue.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-4 border-b border-slate-800 cursor-pointer flex items-start gap-3 transition-colors ${
                selectedItem?.id === item.id ? 'bg-slate-800/80 border-l-2 border-l-red-500' : 'hover:bg-slate-800/50 border-l-2 border-l-transparent'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  if (e.target.checked) setSelectedIds([...selectedIds, item.id]);
                  else setSelectedIds(selectedIds.filter(id => id !== item.id));
                }}
                className="mt-1 rounded border-slate-700 bg-slate-800 text-red-500 focus:ring-red-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase">{item.request_type}</span>
                  <span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleTimeString()}</span>
                </div>
                <h3 className="text-sm font-medium text-slate-200 truncate">{item.title}</h3>
                <p className="text-xs text-slate-400 truncate mt-1">{item.description}</p>
                <div className="flex mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                    item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    item.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    item.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {item.status}
                  </span>
                  {item.priority === 'high' && (
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> High
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Detail Panel */}
      <div className="flex-1 flex flex-col bg-slate-900/50">
        {selectedItem ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-800/20">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded uppercase">
                      {selectedItem.request_type}
                    </span>
                    <span className="text-slate-400 text-sm">ID: {selectedItem.id}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h1>
                  <p className="text-slate-400">{selectedItem.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-md">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-6 h-full">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        AI Generated Content
                      </h3>
                      <button className="text-xs text-blue-400 hover:text-blue-300">Copy</button>
                    </div>
                    <div className="flex-1 font-mono text-sm text-slate-300 whitespace-pre-wrap overflow-y-auto">
                      {JSON.stringify(selectedItem.ai_generated_content, null, 2)}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col relative">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Human Edit / Final
                      </h3>
                      <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <FileEdit className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <div className="flex-1 font-mono text-sm text-slate-400 whitespace-pre-wrap overflow-y-auto italic">
                      {selectedItem.human_edited_content
                        ? JSON.stringify(selectedItem.human_edited_content, null, 2)
                        : "No manual edits made. AI content will be used as is."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
                <button className="px-4 py-2 text-slate-400 hover:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Request Verify Details
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleReject(selectedItem.id)}
                    disabled={selectedItem.status !== 'pending'}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Reject & Block
                  </button>
                  <button
                    onClick={() => handleApprove(selectedItem.id)}
                    disabled={selectedItem.status !== 'pending'}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium shadow-lg shadow-green-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Approve & Execute
                  </button>
                  {isSuperAdmin && selectedItem.status === 'pending' && (
                    <button
                      onClick={() => handleOverride(selectedItem.id)}
                      className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md font-bold shadow-lg shadow-red-500/20 flex items-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" /> Execute Immediately (Override)
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Check className="w-16 h-16 mb-4 opacity-20" />
            <p>Select an item from the queue to review</p>
          </div>
        )}
      </div>
    </div>
  );
};
