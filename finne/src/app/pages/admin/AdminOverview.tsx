import { Users, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminOverview() {
  const stats = [
    { label: 'Total Users', value: '12,458', icon: Users, change: '+12.5%', color: '#c9a84c' },
    { label: 'Total Deposits', value: '$5.2M', icon: DollarSign, change: '+8.3%', color: '#10b981' },
    { label: 'Pending Withdrawals', value: '23', icon: CreditCard, change: '-5.2%', color: '#3b82f6' },
    { label: 'Revenue', value: '$125K', icon: TrendingUp, change: '+15.7%', color: '#c9a84c' },
  ];

  const recentActivity = [
    { user: 'John Doe', action: 'Withdrawal Request', amount: '$5,000', time: '5 mins ago' },
    { user: 'Jane Smith', action: 'New Account', amount: '-', time: '12 mins ago' },
    { user: 'Mike Johnson', action: 'Deposit', amount: '$10,000', time: '23 mins ago' },
    { user: 'Sarah Williams', action: 'Transfer', amount: '$2,500', time: '1 hour ago' },
    { user: 'Tom Brown', action: 'Withdrawal Request', amount: '$3,200', time: '2 hours ago' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
              <div className={`px-2 py-1 rounded ${stat.change.startsWith('+') ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`} style={{ fontSize: '12px' }}>
                {stat.change}
              </div>
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-1">
              {stat.label}
            </div>
            <div className="font-heading" style={{ fontSize: '32px', color: '#ffffff' }}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
      >
        <h2 className="font-heading mb-6" style={{ fontSize: '24px', color: '#ffffff' }}>
          Recent Activity
        </h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              <div>
                <div style={{ color: '#ffffff' }}>{activity.user}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{activity.action}</div>
              </div>
              <div className="text-right">
                <div style={{ color: '#c9a84c' }}>{activity.amount}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>{activity.time}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
