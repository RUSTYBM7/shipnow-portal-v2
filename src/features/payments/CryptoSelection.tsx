import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search } from 'lucide-react';
import { CryptoDetail } from './CryptoDetail';

const cryptoOptions = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin Network', color: 'bg-[#F7931A]' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', network: 'ERC-20', color: 'bg-[#627EEA]' },
  { id: 'usdt_erc', name: 'Tether', symbol: 'USDT', network: 'ERC-20', color: 'bg-[#26A17B]' },
  { id: 'usdt_trc', name: 'Tether', symbol: 'USDT', network: 'TRC-20', color: 'bg-[#26A17B]' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', network: 'Solana Network', color: 'bg-[#14F195]' },
];

export const CryptoSelection = ({ onBack }: { onBack: () => void }) => {
  const [selected, setSelected] = useState<any>(null);

  if (selected) {
    return <CryptoDetail crypto={selected} onBack={() => setSelected(null)} onComplete={onBack} />;
  }

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 justify-center items-start p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[600px]">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold ml-2">Select Crypto</h2>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search crypto or network..."
            className="w-full bg-slate-800 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-red-500 text-white placeholder-slate-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
          {cryptoOptions.map((crypto, i) => (
            <motion.button
              key={crypto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelected(crypto)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors text-left"
            >
              <div className={`w-12 h-12 rounded-full ${crypto.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {crypto.symbol[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-semibold text-white truncate">{crypto.name}</h3>
                  <span className="text-xs font-medium text-slate-400">{crypto.symbol}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{crypto.network}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
