import { useEffect, useState } from 'react';
import { Wallet, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { customerService, formatters } from '../../lib/services';

export function Accounts() {
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof customerService.getAccounts>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void customerService
      .getAccounts()
      .then((data) => {
        if (active) {
          setAccounts(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load accounts.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Accounts
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage your accounts</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#fca5a5]">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {loading && (
          <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading accounts...</div>
        )}
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(201, 168, 76, 0.3)' }}
            className="p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-1">
                  {account.type}
                </div>
                <h3 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
                  {account.name}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[#c9a84c]" />
              </div>
            </div>

            <div className="mb-4">
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-1">
                Balance
              </div>
              <div className="font-heading" style={{ fontSize: '36px', color: '#ffffff' }}>
                {formatters.money(account.balance, account.currency)}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                {account.accountNumber}
              </div>
              <div className="flex items-center gap-1" style={{ color: '#10b981' }}>
                <TrendingUp className="w-4 h-4" />
                <span>{account.growth}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
