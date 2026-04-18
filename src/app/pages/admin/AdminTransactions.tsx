import { useEffect, useState } from 'react';
import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import { adminService, formatters } from '../../lib/services';

export function AdminTransactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [transactions, setTransactions] = useState<Awaited<ReturnType<typeof adminService.getTransactions>>>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadTransactions() {
      try {
        setIsLoading(true);
        setError('');
        const data = await adminService.getTransactions();
        if (active) {
          setTransactions(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load transactions.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => {
      active = false;
    };
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = (t.user || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === 'all' || t.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Transactions Monitoring
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Monitor all platform transactions</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#fca5a5]">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full md:w-48 px-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="transfer">Transfer</option>
          <option value="purchase">Purchase</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-48 px-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  ID
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  User
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Date & Time
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Type
                </th>
                <th className="text-right p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Amount
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Loading transactions...
                  </td>
                </tr>
              )}
              {!isLoading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No transactions found.
                  </td>
                </tr>
              )}
              {!isLoading && filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    #{transaction.id.toString().padStart(5, '0')}
                  </td>
                  <td className="p-4" style={{ color: '#ffffff' }}>
                    {transaction.user || 'N/A'}
                  </td>
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {transaction.date}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 ? 'bg-[#10b981]/20' : 'bg-[#ef4444]/20'
                        }`}
                      >
                        {transaction.amount > 0 ? (
                          <ArrowDownRight className="w-3 h-3 text-[#10b981]" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-[#ef4444]" />
                        )}
                      </div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{transaction.type}</span>
                    </div>
                  </td>
                  <td
                    className="p-4 text-right font-heading"
                    style={{
                      fontSize: '16px',
                      color: transaction.amount > 0 ? '#10b981' : '#ef4444',
                    }}
                  >
                    {transaction.amount > 0 ? '+' : '-'}
                    {formatters.money(Math.abs(transaction.amount))}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        transaction.status === 'Completed'
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : transaction.status === 'Pending'
                            ? 'bg-[#c9a84c]/20 text-[#c9a84c]'
                            : 'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}
                      style={{ fontSize: '14px' }}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
