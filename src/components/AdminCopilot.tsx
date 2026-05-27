import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronRight, X, Command, ArrowRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminCopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hello! I noticed you have 3 pending approvals in the queue and 1 weather exception in Frankfurt. How can I help?' }
  ]);

  const handleCommand = (cmd: string) => {
    setInput(cmd);
    inputRef.current?.focus();
  };

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { id: Date.now(), type: 'user', text: input }]);
    const currentInput = input.trim();
    setInput('');

    setTimeout(() => {
      let reply = "I've logged that. I'm still learning these new admin features!";
      if (currentInput.startsWith('/approve')) {
        reply = "I've approved the top 3 pending requests in the queue.";
        toast.success('Approved 3 requests via Copilot');
      } else if (currentInput.startsWith('/show delayed')) {
        reply = "Filtering map to show only delayed shipments (Frankfurt hub).";
      } else if (currentInput.startsWith('/create invoice')) {
        reply = "Drafting a new invoice. Please provide the shipment ID.";
      }
      setMessages(prev => [...prev, { id: Date.now(), type: 'ai', text: reply }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            exit={{ x: 100 }}
            onClick={() => setIsOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 bg-slate-900 border border-r-0 border-slate-700 text-slate-300 p-3 rounded-l-xl shadow-2xl z-50 flex items-center gap-2 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Bot className="w-5 h-5 text-red-500" />
            <span className="[writing-mode:vertical-lr] font-semibold text-sm tracking-widest uppercase">COPILOT</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-red-500" />
                <span className="font-bold text-white">Admin Copilot</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proactive Alerts */}
            <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/20">
              <div className="flex items-start gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block text-red-300">Action Required</span>
                  3 shipments flagged for manual review due to compliance mismatch.
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                    msg.type === 'user'
                      ? 'bg-red-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex flex-wrap gap-2">
              <button onClick={() => handleCommand('/approve')} className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 border border-slate-700 transition-colors">/approve all</button>
              <button onClick={() => handleCommand('/show delayed')} className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 border border-slate-700 transition-colors">/show delayed</button>
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950">
              <div className="relative">
                <Command className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a command..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-10 py-3 text-sm text-white focus:outline-none focus:border-red-500"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-600 hover:bg-red-500 rounded-md text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
