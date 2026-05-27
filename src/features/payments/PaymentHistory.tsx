import React from 'react';
import { ChevronLeft, ArrowDownRight, ArrowUpRight, Gift, RefreshCcw } from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';

export const PaymentHistory = ({ onBack }: { onBack: () => void }) => {
  const { transactions } = usePaymentStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ArrowDownRight className="w-5 h-5 text-green-500" />;
      case 'spend': return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'bonus': return <Gift className="w-5 h-5 text-purple-500" />;
      case 'adjustment': return <RefreshCcw className="w-5 h-5 text-blue-500" />;
      default: return <ArrowUpRight className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 justify-center items-start p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[600px]">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold ml-2">Transaction History</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
          {transactions.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">No transactions yet</div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  {getIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-white truncate">{tx.description}</h3>
                  <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-slate-200'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                  <div className="text-xs text-slate-500">{tx.pointsAfter} pts</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
