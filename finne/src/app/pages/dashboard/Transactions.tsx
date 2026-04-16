import { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const transactions = [
    { id: 1, date: '2026-03-27', amount: 5000, type: 'Deposit', status: 'Completed', description: 'Salary Payment' },
    { id: 2, date: '2026-03-27', amount: -120, type: 'Withdrawal', status: 'Completed', description: 'ATM Withdrawal' },
    { id: 3, date: '2026-03-26', amount: -1200, type: 'Transfer', status: 'Completed', description: 'Rent Payment' },
    { id: 4, date: '2026-03-26', amount: -45.5, type: 'Purchase', status: 'Completed', description: 'Restaurant' },
    { id: 5, date: '2026-03-25', amount: -350, type: 'Transfer', status: 'Completed', description: 'Utilities' },
    { id: 6, date: '2026-03-25', amount: 2500, type: 'Deposit', status: 'Completed', description: 'Freelance Work' },
    { id: 7, date: '2026-03-24', amount: -89.99, type: 'Purchase', status: 'Completed', description: 'Online Shopping' },
    { id: 8, date: '2026-03-24', amount: -200, type: 'Withdrawal', status: 'Pending', description: 'ATM Withdrawal' },
    { id: 9, date: '2026-03-23', amount: -75, type: 'Purchase', status: 'Completed', description: 'Grocery Store' },
    { id: 10, date: '2026-03-23', amount: 1500, type: 'Deposit', status: 'Completed', description: 'Investment Return' },
  ];

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || t.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Transactions
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>View your transaction history</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-48 pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="transfer">Transfer</option>
            <option value="purchase">Purchase</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
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
                  Date
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Description
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
              {filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="p-4" style={{ color: '#ffffff' }}>
                    {transaction.date}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 ? 'bg-[#10b981]/20' : 'bg-[#ef4444]/20'
                        }`}
                      >
                        {transaction.amount > 0 ? (
                          <ArrowDownRight className="w-4 h-4 text-[#10b981]" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-[#ef4444]" />
                        )}
                      </div>
                      <span style={{ color: '#ffffff' }}>{transaction.description}</span>
                    </div>
                  </td>
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {transaction.type}
                  </td>
                  <td
                    className="p-4 text-right font-heading"
                    style={{
                      fontSize: '16px',
                      color: transaction.amount > 0 ? '#10b981' : '#ef4444',
                    }}
                  >
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        transaction.status === 'Completed'
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : 'bg-[#c9a84c]/20 text-[#c9a84c]'
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
