import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Copy, QrCode, CheckCircle2, RefreshCw } from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import toast from 'react-hot-toast';

export const CryptoDetail = ({ crypto, onBack, onComplete }: any) => {
  const [amountStr, setAmountStr] = useState('0');
  const [isPoints, setIsPoints] = useState(true);
  const [copied, setCopilled] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { addPoints } = usePaymentStore();

  const handleNumpad = (num: string) => {
    if (amountStr === '0' && num !== '.') setAmountStr(num);
    else if (amountStr.includes('.') && num === '.') return;
    else setAmountStr(prev => prev + num);
  };

  const handleDelete = () => {
    setAmountStr(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const amountNum = parseFloat(amountStr) || 0;
  const points = isPoints ? amountNum : amountNum * 10000; // Mock conversion
  const cryptoAmount = isPoints ? amountNum / 10000 : amountNum;
  const usdAmount = points / 10;

  const mockAddress = `0x${Math.random().toString(16).slice(2, 42)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mockAddress);
    setCopilled(true);
    toast.success('Address copied');
    setTimeout(() => setCopilled(false), 2000);
  };

  const handleDeposit = () => {
    if (points <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    // Simulate transaction delay
    toast.loading('Processing payment...', { id: 'deposit' });
    setTimeout(() => {
      addPoints(points, crypto.symbol);
      toast.success('Points added successfully!', { id: 'deposit' });
      onComplete();
    }, 2000);
  };

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 justify-center items-start p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col min-h-[600px]">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full ${crypto.color} flex items-center justify-center text-[10px] font-bold`}>
              {crypto.symbol[0]}
            </div>
            <span className="font-semibold">{crypto.symbol}</span>
          </div>
          <button onClick={() => setShowQR(!showQR)} className="p-2 -mr-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
            <QrCode className="w-6 h-6" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showQR ? (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="bg-white p-4 rounded-2xl mb-6">
                {/* Mock QR Code */}
                <div className="w-48 h-48 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTAgMGgxMHYxMEgwem0yMCAwaDEwdjEwSDIwem0yMCAwaDEwdjEwSDQwem0yMCAwaDEwdjEwSDYwem0yMCAwaDEwdi4uLCIvPjwvc3ZnPg==')] bg-slate-200" style={{ backgroundSize: '10px 10px' }} />
              </div>
              <p className="text-sm text-slate-400 mb-2">Send only {crypto.symbol} to this address</p>
              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg max-w-full">
                <span className="text-xs truncate font-mono text-slate-300">{mockAddress}</span>
                <button onClick={handleCopy} className="text-slate-400 hover:text-white shrink-0">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="numpad"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col items-center justify-center py-6">
                <div className="text-5xl font-bold mb-2 flex items-baseline gap-2">
                  {amountStr}
                  <span className="text-2xl text-slate-500 font-normal">{isPoints ? 'pts' : crypto.symbol}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 bg-slate-800 px-4 py-1.5 rounded-full cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setIsPoints(!isPoints)}>
                  <RefreshCw className="w-3 h-3" />
                  <span className="text-sm font-medium">
                    ≈ {isPoints ? `${cryptoAmount.toFixed(6)} ${crypto.symbol}` : `${points.toLocaleString()} pts`}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500">Network Fee: ~0.0001 {crypto.symbol}</div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, '⌫'].map((num) => (
                  <button
                    key={num}
                    onClick={() => num === '⌫' ? handleDelete() : handleNumpad(num.toString())}
                    className="h-14 text-xl font-medium rounded-2xl bg-slate-800/50 hover:bg-slate-700 active:scale-95 transition-all text-white flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={handleDeposit}
                className="w-full py-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                Buy {points.toLocaleString()} Points
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
