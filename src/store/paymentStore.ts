import { create } from 'zustand';

interface Transaction {
  id: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus' | 'adjustment';
  amount: number;
  pointsAfter: number;
  date: string;
  description: string;
}

interface PaymentStore {
  pointsBalance: number;
  usdEquivalent: number;
  transactions: Transaction[];
  addPoints: (amount: number, method: string) => void;
  spendPoints: (amount: number, description: string) => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  pointsBalance: 1250,
  usdEquivalent: 125.00, // 10 points = $1
  transactions: [
    {
      id: 'tx-001',
      type: 'purchase',
      amount: +500,
      pointsAfter: 1250,
      date: new Date().toISOString(),
      description: 'Purchased with Bitcoin (BTC)'
    },
    {
      id: 'tx-002',
      type: 'spend',
      amount: -250,
      pointsAfter: 750,
      date: new Date(Date.now() - 86400000).toISOString(),
      description: 'Express Shipping to London'
    },
    {
      id: 'tx-003',
      type: 'bonus',
      amount: +100,
      pointsAfter: 1000,
      date: new Date(Date.now() - 172800000).toISOString(),
      description: 'Sign up Bonus'
    }
  ],
  addPoints: (amount, method) => set((state) => {
    const newBalance = state.pointsBalance + amount;
    return {
      pointsBalance: newBalance,
      usdEquivalent: newBalance / 10,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          type: 'purchase',
          amount,
          pointsAfter: newBalance,
          date: new Date().toISOString(),
          description: `Purchased with ${method}`
        },
        ...state.transactions
      ]
    };
  }),
  spendPoints: (amount, description) => set((state) => {
    const newBalance = state.pointsBalance - amount;
    return {
      pointsBalance: newBalance,
      usdEquivalent: newBalance / 10,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          type: 'spend',
          amount: -amount,
          pointsAfter: newBalance,
          date: new Date().toISOString(),
          description
        },
        ...state.transactions
      ]
    };
  })
}));
