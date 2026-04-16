import { Search, Filter, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function Users() {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 1, name: 'John Anderson', email: 'john@example.com', balance: 125430, status: 'Active', joined: '2025-01-15' },
    { id: 2, name: 'Sarah Williams', email: 'sarah@example.com', balance: 89250, status: 'Active', joined: '2025-02-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', balance: 45680, status: 'Suspended', joined: '2024-11-10' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', balance: 156890, status: 'Active', joined: '2024-12-05' },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', balance: 32100, status: 'Active', joined: '2026-01-08' },
    { id: 6, name: 'Lisa Garcia', email: 'lisa@example.com', balance: 98450, status: 'Active', joined: '2025-03-12' },
    { id: 7, name: 'David Martinez', email: 'david@example.com', balance: 67230, status: 'Suspended', joined: '2025-01-28' },
    { id: 8, name: 'Jessica Wilson', email: 'jessica@example.com', balance: 142000, status: 'Active', joined: '2024-10-15' },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Users Management
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage all user accounts</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
          />
        </div>
        <button className="px-6 py-3 rounded-lg bg-[#c9a84c] text-[#0a0e1a] hover:bg-[#b89640] transition-all hover:scale-105">
          Add User
        </button>
      </div>

      {/* Users Table */}
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
                  Name
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Email
                </th>
                <th className="text-right p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Balance
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Status
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Joined
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="p-4" style={{ color: '#ffffff' }}>
                    {user.name}
                  </td>
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {user.email}
                  </td>
                  <td className="p-4 text-right" style={{ color: '#c9a84c' }}>
                    ${user.balance.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        user.status === 'Active'
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : 'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}
                      style={{ fontSize: '14px' }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {user.joined}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="px-3 py-1 rounded bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30 transition-all text-sm">
                        View
                      </button>
                      <button className="px-3 py-1 rounded bg-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/30 transition-all text-sm">
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button className="p-2 rounded hover:bg-white/10 transition-all">
                        <MoreVertical className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
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
