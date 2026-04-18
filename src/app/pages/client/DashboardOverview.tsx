import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { WithdrawModal } from '../../components/WithdrawModal';
import { customerService, formatters } from '../../lib/services';

export function DashboardOverview() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [summary, setSummary] = useState({
    greetingName: 'Customer',
    totalBalance: 0,
    balanceChange: '0%',
    totalSpent: 0,
    currency: 'USD',
    accounts: [],
    recentTransactions: [],
  } as Awaited<ReturnType<typeof customerService.getDashboardSummary>>);
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof customerService.getAccounts>>>([]);
  const [transactions, setTransactions] = useState<Awaited<ReturnType<typeof customerService.getTransactions>>>([]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError('');
        const [dashboardSummary, fetchedAccounts, fetchedTransactions] = await Promise.all([
          customerService.getDashboardSummary(),
          customerService.getAccounts(),
          customerService.getTransactions(),
        ]);

        if (!active) {
          return;
        }

        setSummary(dashboardSummary);
        setAccounts(fetchedAccounts);
        setTransactions(fetchedTransactions);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load your dashboard.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const recentTransactions = summary.recentTransactions.length > 0 ? summary.recentTransactions : transactions.slice(0, 5);
  const accountCards = accounts.length > 0 ? accounts : summary.accounts;

  async function handleWithdrawal(input: {
    requestType: 'WITHDRAWAL' | 'TRANSFER';
    accountId: string;
    amount: string;
    currency: string;
    note: string;
  }) {
    try {
      setSubmittingWithdrawal(true);
      setWithdrawError('');
      const selectedAccount =
        accountCards.find((account) => account.id === input.accountId) ?? accountCards[0] ?? null;
      const requestLabel =
        input.requestType === 'TRANSFER' ? 'Transfer Verification Request' : 'Withdrawal Verification Request';

      await customerService.sendSupportMessage({
        category: input.requestType === 'TRANSFER' ? 'TRANSACTION' : 'WITHDRAWAL',
        subject: requestLabel,
        message: [
          `Request type: ${input.requestType}`,
          `Account: ${selectedAccount?.name ?? 'N/A'} (${selectedAccount?.accountNumber ?? input.accountId})`,
          `Amount: ${input.currency} ${input.amount || '0'}`,
          input.note ? `Customer note: ${input.note}` : 'Customer note: Verification requested from client portal.',
        ].join('\n'),
      });
      setIsWithdrawModalOpen(false);
      setWithdrawError('');
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : 'Unable to contact customer support.');
    } finally {
      setSubmittingWithdrawal(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Dashboard
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Welcome back, {summary.greetingName}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#fca5a5]">
          {error}
        </div>
      )}

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#b89640] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative">
          <div style={{ color: '#0a0e1a', opacity: 0.7 }} className="mb-2">
            Total Balance
          </div>
          <div className="font-heading mb-6" style={{ fontSize: '48px', color: '#0a0e1a' }}>
            {loading ? 'Loading...' : formatters.money(summary.totalBalance, summary.currency)}
          </div>
          <div className="flex items-center gap-2" style={{ color: '#0a0e1a', opacity: 0.8 }}>
            <TrendingUp className="w-5 h-5" />
            <span>{summary.balanceChange || '0%'} from last update</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all text-left"
        >
          <ArrowDownRight className="w-8 h-8 text-[#10b981] mb-3" />
          <div className="font-heading" style={{ fontSize: '18px', color: '#ffffff' }}>
            Deposit
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Funding is controlled by the connected API.</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all text-left"
        >
          <ArrowUpRight className="w-8 h-8 text-[#3b82f6] mb-3" />
          <div className="font-heading" style={{ fontSize: '18px', color: '#ffffff' }}>
            Transfer
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Transaction history below updates from live data.</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsWithdrawModalOpen(true)}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all text-left"
        >
          <ArrowUpRight className="w-8 h-8 text-[#c9a84c] mb-3" />
          <div className="font-heading" style={{ fontSize: '18px', color: '#ffffff' }}>
            Withdraw
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Contact support for withdrawal or transfer verification</p>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {accountCards.slice(0, 2).map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{account.name}</div>
              {index === 0 ? <Wallet className="w-5 h-5 text-[#c9a84c]" /> : <CreditCard className="w-5 h-5 text-[#3b82f6]" />}
            </div>
            <div className="font-heading" style={{ fontSize: '28px', color: '#ffffff' }}>
              {formatters.money(account.balance, account.currency)}
            </div>
            <div className="flex items-center gap-1 mt-2" style={{ color: '#10b981', fontSize: '14px' }}>
              <TrendingUp className="w-4 h-4" />
              <span>{account.growth || '0%'}</span>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Spent</div>
            <DollarSign className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div className="font-heading" style={{ fontSize: '28px', color: '#ffffff' }}>
            {formatters.money(summary.totalSpent, summary.currency)}
          </div>
          <div className="flex items-center gap-1 mt-2" style={{ color: '#ef4444', fontSize: '14px' }}>
            <TrendingDown className="w-4 h-4" />
            <span>Current period</span>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
      >
        <h2 className="font-heading mb-6" style={{ fontSize: '24px', color: '#ffffff' }}>
          Recent Transactions
        </h2>
        <div className="space-y-4">
          {recentTransactions.length === 0 && (
            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No transactions found yet.</div>
          )}
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.amount > 0 ? 'bg-[#10b981]/20' : 'bg-[#ef4444]/20'
                  }`}
                >
                  {transaction.amount > 0 ? (
                    <ArrowDownRight className="w-5 h-5 text-[#10b981]" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-[#ef4444]" />
                  )}
                </div>
                <div>
                  <div style={{ color: '#ffffff' }}>{transaction.type}</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>{transaction.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="font-heading"
                  style={{
                    fontSize: '18px',
                    color: transaction.amount > 0 ? '#10b981' : '#ef4444',
                  }}
                >
                  {transaction.amount > 0 ? '+' : '-'}
                  {formatters.money(Math.abs(transaction.amount), summary.currency)}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>{transaction.status}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        accounts={accounts}
        error={withdrawError}
        isSubmitting={submittingWithdrawal}
        onSubmit={handleWithdrawal}
      />
    </div>
  );
}
