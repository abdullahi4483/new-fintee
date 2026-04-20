import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import type { AccountRecord } from '../lib/services';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountRecord[];
  isSubmitting?: boolean;
  error?: string;
  onSubmit: (input: {
    requestType: 'WITHDRAWAL' | 'TRANSFER';
    accountId: string;
    amount: string;
    accountNumber: string;
    bankCode: string;
  }) => void | Promise<void>;
}

export function WithdrawModal({ isOpen, onClose, accounts, onSubmit, isSubmitting = false, error }: WithdrawModalProps) {
  const [requestType, setRequestType] = useState<'WITHDRAWAL' | 'TRANSFER'>('WITHDRAWAL');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');

  useEffect(() => {
    if (!isOpen || accounts.length === 0) {
      return;
    }

    const initialAccount = accounts[0];
    setAccountId(initialAccount.id);
    setAccountNumber(initialAccount.accountNumber || '');
  }, [accounts, isOpen]);

  const selectedAccount = accounts.find((account) => account.id === accountId) || accounts[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/95 to-[#0a0e1a]/95 backdrop-blur-xl border border-[#c9a84c]/40 shadow-2xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>

              {/* Content */}
              <div>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#c9a84c]/30 flex items-center justify-center">
                    <div className="text-[#c9a84c]" style={{ fontSize: '24px' }}>
                      💰
                    </div>
                  </div>
                </div>

                <h2 className="font-heading mb-4" style={{ fontSize: '28px', color: '#ffffff' }}>
                  Verification Request
                </h2>

                {accounts.length === 0 ? (
                  <div className="space-y-4">
                    <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                      Contact support to begin your withdrawal or transfer verification request.
                    </p>
                    <Link
                      to="/dashboard/support"
                      onClick={onClose}
                      className="block w-full rounded-lg bg-[#c9a84c] px-6 py-3 text-center text-[#0a0e1a] transition-all hover:bg-[#b89640]"
                    >
                      Contact Support
                    </Link>
                  </div>
                ) : (
                  <form
                    className="space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void onSubmit({
                        requestType,
                        accountId,
                        amount,
                        accountNumber,
                        bankCode,
                      });
                    }}
                  >
                    {error && (
                      <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-left" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Verification Type
                      </label>
                      <select
                        value={requestType}
                        onChange={(event) =>
                          setRequestType(
                            event.target.value === 'TRANSFER' ? 'TRANSFER' : 'WITHDRAWAL',
                          )
                        }
                        className="w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-[#c9a84c]/20 focus:border-[#c9a84c] focus:outline-none"
                      >
                        <option value="WITHDRAWAL">Withdrawal Verification</option>
                        <option value="TRANSFER">Transfer Verification</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-left" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Account
                      </label>
                      <select
                        value={accountId}
                        onChange={(event) => {
                          const nextAccount = accounts.find((account) => account.id === event.target.value);
                          setAccountId(event.target.value);
                          setAccountNumber(nextAccount?.accountNumber || '');
                        }}
                        className="w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-[#c9a84c]/20 focus:border-[#c9a84c] focus:outline-none"
                      >
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({account.accountNumber || account.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-left" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Destination Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(event) => setAccountNumber(event.target.value)}
                        placeholder="0123456789"
                        className="w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-[#c9a84c]/20 placeholder:text-white/30 focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-left" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Bank Code
                      </label>
                      <input
                        type="text"
                        value={bankCode}
                        onChange={(event) => setBankCode(event.target.value)}
                        placeholder="058"
                        className="w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-[#c9a84c]/20 placeholder:text-white/30 focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-left" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Amount
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="100.00"
                        className="w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-[#c9a84c]/20 placeholder:text-white/30 focus:border-[#c9a84c] focus:outline-none"
                      />
                    </div>

                    <div className="rounded-lg bg-white/5 px-4 py-3 text-left">
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Available Balance</div>
                      <div style={{ color: '#ffffff' }}>
                        {selectedAccount ? `${selectedAccount.currency} ${selectedAccount.balance.toLocaleString()}` : 'N/A'}
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#c9a84c]/20 bg-[#c9a84c]/10 px-4 py-3 text-left">
                      <div style={{ color: '#ffffff', fontSize: '14px' }}>
                        This request will be sent to the live withdrawals endpoint for processing.
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Withdrawal'}
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full px-6 py-3 border border-[#c9a84c]/40 text-white rounded-lg hover:border-[#c9a84c] transition-all"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
