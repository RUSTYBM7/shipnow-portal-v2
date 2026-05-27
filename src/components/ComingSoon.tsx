import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';

interface ComingSoonProps {
  featureName: string;
  expectedDate: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ featureName, expectedDate }) => {
  const [email, setEmail] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Added to waitlist!');
      setEmail('');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] w-full p-8 overflow-hidden bg-slate-950 text-slate-100">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Radial Gradient */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center max-w-2xl text-center">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 p-4 bg-slate-900/50 rounded-full border border-slate-800 backdrop-blur-sm"
        >
          <Rocket className="w-16 h-16 text-red-500" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Coming Soon
        </h1>

        <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-xl">
          We're building something extraordinary for <span className="text-white font-semibold">{featureName}</span>.
          Expected launch: {expectedDate}.
        </p>

        <form onSubmit={handleJoin} className="w-full max-w-md flex flex-col sm:flex-row gap-3 mb-12">
          <input
            type="email"
            placeholder="Enter your email for early access"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg shadow-lg shadow-red-500/20 transition-all active:scale-95 whitespace-nowrap"
          >
            Join Waitlist
          </button>
        </form>

        <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
          <Unlock className="w-4 h-4" />
          Super Admin Preview
        </button>
      </div>
    </div>
  );
};
