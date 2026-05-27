import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowUpRight, ArrowDownLeft, Plus, History } from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { PaymentHistory } from './PaymentHistory';
import { CryptoSelection } from './CryptoSelection';

export const PaymentDashboard = () => {
  const { pointsBalance, usdEquivalent } = usePaymentStore();
  const [view, setView] = useState<'dashboard' | 'history' | 'add_points'>('dashboard');

  if (view === 'history') return <PaymentHistory onBack={() => setView('dashboard')} />;
  if (view === 'add_points') return <CryptoSelection onBack={() => setView('dashboard')} />;

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 justify-center items-center p-4 overflow-hidden relative">
      {/* Background elements for Apple Cash style */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        <h2 className="text-slate-400 font-medium mb-8">AirPak Cash</h2>

        <div className="relative w-full h-48 mb-12 flex items-center justify-center">
          {/* Glass Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.1),transparent,rgba(255,255,255,0.1))]" />
            <div className="absolute top-4 left-4 font-bold text-white tracking-widest text-lg opacity-80">AIRPAK</div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center">
              <span className="text-5xl font-bold text-white tracking-tight">
                {pointsBalance.toLocaleString()} <span className="text-2xl font-normal opacity-80">pts</span>
              </span>
              <span className="text-red-200 text-sm mt-1 font-medium">
                ≈ ${usdEquivalent.toFixed(2)} USD
              </span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-4 gap-4 w-full px-2">
          <ActionButton icon={ArrowUpRight} label="Send" onClick={() => {
            const recipient = window.prompt('Enter recipient email or username:');
            if (recipient) {
              const amount = window.prompt(`Enter amount to send to ${recipient}:`);
              if (amount && !isNaN(Number(amount))) toast.success(`Successfully sent ${amount} pts to ${recipient}`);
            }
          }} />
          <ActionButton icon={ArrowDownLeft} label="Request" onClick={() => {
            const recipient = window.prompt('Enter user to request points from:');
            if (recipient) toast.success(`Request sent to ${recipient}`);
          }} />
          <ActionButton icon={Plus} label="Add" onClick={() => setView('add_points')} />
          <ActionButton icon={History} label="History" onClick={() => setView('history')} />
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, disabled = false }: any) => (
  <motion.button
    whileTap={disabled ? {} : { scale: 0.9 }}
    onClick={disabled ? undefined : onClick}
    className={`flex flex-col items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-lg hover:bg-slate-700 transition-colors">
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-xs font-medium text-slate-300">{label}</span>
  </motion.button>
);
