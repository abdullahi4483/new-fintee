import { useEffect, useState } from 'react';
import { CreditCard, Lock, Unlock } from 'lucide-react';
import { motion } from 'motion/react';
import { customerService, formatters } from '../../lib/services';

export function Cards() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Awaited<ReturnType<typeof customerService.getCards>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;

    void customerService
      .getCards()
      .then((data) => {
        if (active) {
          setCards(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load cards.');
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

  const card = cards[0];
  const isFrozen = Boolean(card?.frozen);

  async function toggleFreeze() {
    if (!card) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      if (card.frozen) {
        await customerService.unfreezeCard(card.id);
      } else {
        await customerService.freezeCard(card.id);
      }

      setCards((current) =>
        current.map((item) => (item.id === card.id ? { ...item, frozen: !item.frozen } : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update card status.');
    } finally {
      setActionLoading(false);
    }
  }

  async function requestReplacement() {
    if (!card) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await customerService.replaceCard(card.id, 'Card damaged');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request a replacement card.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Cards
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage your virtual cards</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#fca5a5]">
          {error}
        </div>
      )}

      {loading && <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading cards...</div>}
      {!loading && !card && <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No cards available.</div>}

      {card && (
        <div className="max-w-2xl">
          <div className="perspective-1000 mb-8">
            <motion.div
              className="relative h-56 w-full cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#b89640] p-8 shadow-2xl"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <div style={{ fontSize: '14px', color: '#0a0e1a', opacity: 0.7 }} className="mb-1">
                        {card.brand} {card.type}
                      </div>
                      <div className="flex gap-2">
                        <div className="h-7 w-10 rounded bg-[#0a0e1a]/20" />
                      </div>
                    </div>
                    <CreditCard className="h-12 w-12 text-[#0a0e1a] opacity-30" />
                  </div>

                  <div>
                    <div className="mb-4">
                      <div
                        className="font-heading tracking-wider"
                        style={{ fontSize: '24px', color: '#0a0e1a', letterSpacing: '0.15em' }}
                      >
                        •••• •••• •••• {card.last4}
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <div style={{ fontSize: '12px', color: '#0a0e1a', opacity: 0.6 }} className="mb-1">
                          Card Holder
                        </div>
                        <div style={{ fontSize: '16px', color: '#0a0e1a' }}>{card.cardHolder.toUpperCase()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#0a0e1a', opacity: 0.6 }} className="mb-1">
                          Expires
                        </div>
                        <div style={{ fontSize: '16px', color: '#0a0e1a' }}>{card.expiry}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#b89640] to-[#c9a84c] p-8 shadow-2xl"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="mt-4 -mx-8 h-12 bg-[#0a0e1a]" />

                  <div className="flex flex-1 flex-col justify-center">
                    <div className="mb-2 flex h-10 items-center justify-end rounded bg-white/90 px-4">
                      <span style={{ fontSize: '18px', color: '#0a0e1a', fontFamily: 'monospace' }}>{card.cvv}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#0a0e1a', opacity: 0.7 }} className="text-right">
                      CVV
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#0a0e1a', opacity: 0.6 }}>
                    This card is property of Fintech. If found, please return to nearest branch.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-[#c9a84c]/20 bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading mb-1" style={{ fontSize: '20px', color: '#ffffff' }}>
                  Card Status
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {isFrozen ? 'Your card is currently frozen' : 'Your card is active'}
                </p>
              </div>
              <div
                className={`rounded-full px-4 py-2 ${
                  isFrozen ? 'bg-[#3b82f6]/20 text-[#3b82f6]' : 'bg-[#10b981]/20 text-[#10b981]'
                }`}
              >
                {isFrozen ? 'Frozen' : 'Active'}
              </div>
            </div>

            <button
              onClick={() => void toggleFreeze()}
              disabled={actionLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#c9a84c]/40 bg-[#c9a84c]/20 px-6 py-3 text-[#c9a84c] transition-all hover:bg-[#c9a84c]/30"
            >
              {isFrozen ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              <span>{actionLoading ? 'Updating...' : isFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-[#c9a84c]/20 bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 p-6 backdrop-blur-xl"
          >
            <h3 className="font-heading mb-4" style={{ fontSize: '20px', color: '#ffffff' }}>
              Card Details
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/10 py-3">
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Card Number</span>
                <span style={{ color: '#ffffff' }}>•••• •••• •••• {card.last4}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 py-3">
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Card Type</span>
                <span style={{ color: '#ffffff' }}>{card.brand} {card.type}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 py-3">
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Spending Limit</span>
                <span style={{ color: '#ffffff' }}>{formatters.money(card.spendingLimit, card.currency)} / month</span>
              </div>
              <div className="flex justify-between border-b border-white/10 py-3">
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Current Usage</span>
                <span style={{ color: '#ffffff' }}>{formatters.money(card.currentUsage, card.currency)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Available</span>
                <span style={{ color: '#10b981' }}>
                  {formatters.money(card.spendingLimit - card.currentUsage, card.currency)}
                </span>
              </div>
            </div>

            <button
              onClick={() => void requestReplacement()}
              disabled={actionLoading}
              className="mt-6 w-full rounded-lg bg-[#c9a84c] px-6 py-3 text-[#0a0e1a] transition-all hover:scale-105 hover:bg-[#b89640]"
            >
              {actionLoading ? 'Processing...' : 'Request New Card'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
