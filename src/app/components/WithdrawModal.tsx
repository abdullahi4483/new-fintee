import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
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
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#c9a84c]/30 flex items-center justify-center">
                    <div className="text-[#c9a84c]" style={{ fontSize: '24px' }}>
                      💰
                    </div>
                  </div>
                </div>

                <h2 className="font-heading mb-4" style={{ fontSize: '28px', color: '#ffffff' }}>
                  Withdrawal Request
                </h2>

                <p className="mb-8" style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                  To proceed with your withdrawal, please contact customer service for verification.
                </p>

                <button
                  onClick={() => {
                    window.location.href = 'mailto:support@fintech.com';
                  }}
                  className="w-full px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105"
                >
                  Contact Support
                </button>

                <button
                  onClick={onClose}
                  className="mt-3 w-full px-6 py-3 border border-[#c9a84c]/40 text-white rounded-lg hover:border-[#c9a84c] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
