import { useState } from 'react';
import { Send, MessageCircle, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export function Support() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the message to admin
    setSubmitted(true);
    setTimeout(() => {
      setSubject('');
      setMessage('');
      setCategory('general');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Customer Support
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Send us a message and we'll get back to you</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Contact Methods */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
          >
            <div className="w-12 h-12 mb-4 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#c9a84c]" />
            </div>
            <h3 className="font-heading mb-2" style={{ fontSize: '20px', color: '#ffffff' }}>
              Email
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>support@fintech.com</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
          >
            <div className="w-12 h-12 mb-4 rounded-full bg-[#3b82f6]/20 flex items-center justify-center">
              <Phone className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <h3 className="font-heading mb-2" style={{ fontSize: '20px', color: '#ffffff' }}>
              Phone
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>+1 (555) 123-4567</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
          >
            <div className="w-12 h-12 mb-4 rounded-full bg-[#10b981]/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#10b981]" />
            </div>
            <h3 className="font-heading mb-2" style={{ fontSize: '20px', color: '#ffffff' }}>
              Live Chat
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>Available 24/7</p>
          </motion.div>
        </div>

        {/* Message Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 p-8 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <h2 className="font-heading mb-6" style={{ fontSize: '24px', color: '#ffffff' }}>
            Send Us a Message
          </h2>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#10b981]/20 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-[#10b981]" />
              </div>
              <h3 className="font-heading mb-2" style={{ fontSize: '24px', color: '#ffffff' }}>
                Message Sent!
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                We've received your message and will respond within 24 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="general">General Inquiry</option>
                  <option value="account">Account Issue</option>
                  <option value="transaction">Transaction Problem</option>
                  <option value="withdrawal">Withdrawal Request</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide details about your inquiry..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          )}
        </motion.div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-8 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
      >
        <h2 className="font-heading mb-6" style={{ fontSize: '24px', color: '#ffffff' }}>
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: 'How long does it take to process a withdrawal?',
              a: 'Withdrawals are typically processed within 1-3 business days after verification.',
            },
            {
              q: 'What documents do I need for verification?',
              a: 'You need a valid government-issued ID and proof of address (utility bill or bank statement).',
            },
            {
              q: 'Are there any fees for transactions?',
              a: 'Internal transfers are free. External transfers may have standard banking fees.',
            },
            {
              q: 'How can I increase my account limits?',
              a: 'Contact support with your account details and we can review your limit increase request.',
            },
          ].map((faq, index) => (
            <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h3 className="font-heading mb-2" style={{ fontSize: '16px', color: '#c9a84c' }}>
                {faq.q}
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
