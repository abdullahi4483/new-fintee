import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminService } from '../../lib/services';

export function Withdrawals() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [withdrawals, setWithdrawals] = useState<Awaited<ReturnType<typeof adminService.getWithdrawals>>>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Verification failed');

  useEffect(() => {
    let active = true;

    async function loadWithdrawals() {
      try {
        setIsLoading(true);
        setError('');
        const data = await adminService.getWithdrawals();
        if (active) {
          setWithdrawals(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load withdrawals.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadWithdrawals();

    return () => {
      active = false;
    };
  }, []);

  async function handleApprove(id: string) {
    try {
      setSubmittingId(id);
      setError('');
      await adminService.approveWithdrawal(id);
      setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'Approved' } : w)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to approve withdrawal.');
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleReject() {
    if (!rejectTargetId || !rejectReason.trim()) {
      return;
    }

    try {
      setSubmittingId(rejectTargetId);
      setError('');
      await adminService.rejectWithdrawal(rejectTargetId, rejectReason.trim());
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === rejectTargetId ? { ...w, status: 'Rejected' } : w)),
      );
      setRejectTargetId(null);
      setRejectReason('Verification failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reject withdrawal.');
    } finally {
      setSubmittingId(null);
    }
  }

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch =
      w.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || w.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Withdrawal Requests
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage withdrawal requests</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#fca5a5]">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-2">
            Pending Requests
          </div>
          <div className="font-heading" style={{ fontSize: '32px', color: '#c9a84c' }}>
            {withdrawals.filter((w) => w.status === 'Pending').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-2">
            Total Amount Pending
          </div>
          <div className="font-heading" style={{ fontSize: '32px', color: '#c9a84c' }}>
            ${withdrawals
              .filter((w) => w.status === 'Pending')
              .reduce((sum, w) => sum + w.amount, 0)
              .toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }} className="mb-2">
            Approved
          </div>
          <div className="font-heading" style={{ fontSize: '32px', color: '#10b981' }}>
            {withdrawals.filter((w) => w.status === 'Approved').length}
          </div>
        </motion.div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by user or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-48 px-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
                  Email
                </th>
                <th className="text-right p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Amount
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Date
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Status
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="p-6 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Loading withdrawals...
                  </td>
                </tr>
              )}
              {!isLoading && filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No withdrawals found.
                  </td>
                </tr>
              )}
              {!isLoading && filteredWithdrawals.map((withdrawal, index) => (
                <motion.tr
                  key={withdrawal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    #{withdrawal.id.toString().padStart(5, '0')}
                  </td>
                  <td className="p-4" style={{ color: '#ffffff' }}>
                    {withdrawal.user}
                  </td>
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {withdrawal.email}
                  </td>
                  <td className="p-4 text-right font-heading" style={{ fontSize: '16px', color: '#c9a84c' }}>
                    ${withdrawal.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                    {withdrawal.date}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        withdrawal.status === 'Pending'
                          ? 'bg-[#c9a84c]/20 text-[#c9a84c]'
                          : withdrawal.status === 'Approved'
                            ? 'bg-[#10b981]/20 text-[#10b981]'
                            : 'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}
                      style={{ fontSize: '14px' }}
                    >
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {withdrawal.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => void handleApprove(withdrawal.id)}
                            disabled={submittingId === withdrawal.id}
                            className="p-2 rounded bg-[#10b981]/20 hover:bg-[#10b981]/30 transition-all"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4 text-[#10b981]" />
                          </button>
                          <button
                            onClick={() => {
                              setRejectTargetId(withdrawal.id);
                              setRejectReason('Verification failed');
                            }}
                            disabled={submittingId === withdrawal.id}
                            className="p-2 rounded bg-[#ef4444]/20 hover:bg-[#ef4444]/30 transition-all"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4 text-[#ef4444]" />
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>-</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {rejectTargetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setRejectTargetId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-lg rounded-2xl border border-[#c9a84c]/20 bg-gradient-to-br from-[#141e32] to-[#0a0e1a] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
                  Reject Withdrawal
                </h2>
                <button
                  onClick={() => setRejectTargetId(null)}
                  className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <label className="mb-2 block text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-[#c9a84c]/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none"
                placeholder="Add a reason for rejecting this withdrawal"
              />

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectTargetId(null)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-white/80 transition-colors hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectReason.trim() || submittingId === rejectTargetId}
                  onClick={() => void handleReject()}
                  className="rounded-lg bg-[#ef4444] px-5 py-2 font-medium text-white transition-colors hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submittingId === rejectTargetId ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
