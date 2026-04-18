import { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { adminService } from '../../lib/services';

export function AdminOverview() {
  const [data, setData] = useState<{
    metrics: { label: string; value: string; change?: string }[];
    recentActivity: { id: string; user: string; action: string; amount: string; time: string }[];
  }>({ metrics: [], recentActivity: [] });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        setIsLoading(true);
        setError('');
        const response = await adminService.getDashboardSummary();
        if (active) {
          setData(response);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load admin summary.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      active = false;
    };
  }, []);

  const icons = [Users, DollarSign, CreditCard, TrendingUp];
  const colors = ['#c9a84c', '#10b981', '#3b82f6', '#c9a84c'];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Overview of your platform</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#fca5a5]">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {isLoading && (
          <div className="md:col-span-4 rounded-xl border border-[#c9a84c]/20 bg-[#141e32]/40 p-6 text-center text-white/70">
            Loading summary metrics...
          </div>
        )}
        {data.metrics.map((stat, index) => {
          const Icon = icons[index] || TrendingUp;
          const color = colors[index] || '#c9a84c';
          const change = stat.change || '0%';

          return (
            <motion.div
              key={`${stat.label}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color }} />
                <div className={`px-2 py-1 rounded ${change.startsWith('+') ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`} style={{ fontSize: '12px' }}>
                  {change}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-1">
                {stat.label}
              </div>
              <div className="font-heading" style={{ fontSize: '32px', color: '#ffffff' }}>
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </div>

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
          {!isLoading && data.recentActivity.length === 0 && (
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No recent activity found.</div>
          )}
          {data.recentActivity.map((activity, index) => (
            <motion.div
              key={activity.id}
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
