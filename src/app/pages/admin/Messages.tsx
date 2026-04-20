import { useEffect, useState } from 'react';
import { Search, Filter, MessageCircle, Mail, Clock, X } from 'lucide-react';
import { motion } from 'motion/react';
import { adminService } from '../../lib/services';

export function Messages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [messages, setMessages] = useState<Awaited<ReturnType<typeof adminService.getMessages>>>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      try {
        setIsLoading(true);
        setError('');
        const data = await adminService.getMessages();
        if (active) {
          setMessages(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load messages.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadMessages();

    return () => {
      active = false;
    };
  }, []);

  async function replyToSelected(messageId: string) {
    if (!replyBody.trim()) {
      setError('Reply message cannot be empty.');
      return;
    }

    try {
      setError('');
      await adminService.replyToMessage(messageId, replyBody.trim());
      setMessages((current) => current.map((msg) => (msg.id === messageId ? { ...msg, status: 'Replied' } : msg)));
      setReplyBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reply to message.');
    }
  }

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || msg.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: messages.length,
    pending: messages.filter((m) => m.status === 'Pending').length,
    replied: messages.filter((m) => m.status === 'Replied').length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Customer Messages
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>View and respond to customer inquiries</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#fca5a5]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Messages</span>
            <MessageCircle className="w-5 h-5 text-[#c9a84c]" />
          </div>
          <div className="font-heading" style={{ fontSize: '32px', color: '#ffffff' }}>
            {stats.total}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Pending</span>
            <Clock className="w-5 h-5 text-[#c9a84c]" />
          </div>
          <div className="font-heading" style={{ fontSize: '32px', color: '#c9a84c' }}>
            {stats.pending}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Replied</span>
            <Mail className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div className="font-heading" style={{ fontSize: '32px', color: '#3b82f6' }}>
            {stats.replied}
          </div>
        </motion.div>

      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-48 pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

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
                  User
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Category
                </th>
                <th className="text-left p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Subject
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Status
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Date
                </th>
                <th className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Loading messages...
                  </td>
                </tr>
              )}
              {!isLoading && filteredMessages.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No messages found.
                  </td>
                </tr>
              )}
              {!isLoading && filteredMessages.map((msg, index) => (
                <motion.tr
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="p-4">
                    <div>
                      <div style={{ color: '#ffffff' }}>{msg.user}</div>
                      <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>{msg.email}</div>
                    </div>
                  </td>
                  <td className="p-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {msg.category}
                  </td>
                  <td className="p-4" style={{ color: '#ffffff' }}>
                    {msg.subject}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        msg.status === 'Pending'
                          ? 'bg-[#c9a84c]/20 text-[#c9a84c]'
                          : msg.status === 'Replied'
                            ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                            : 'bg-[#10b981]/20 text-[#10b981]'
                      }`}
                      style={{ fontSize: '14px' }}
                    >
                      {msg.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div style={{ color: '#ffffff' }}>{msg.date}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedMessage(msg.id);
                          setReplyBody('');
                        }}
                        className="px-3 py-1 rounded bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30 transition-all text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMessage(msg.id);
                          setReplyBody('');
                        }}
                        className="px-3 py-1 rounded bg-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/30 transition-all text-sm"
                      >
                        Reply
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/95 to-[#0a0e1a]/95 backdrop-blur-xl border border-[#c9a84c]/40"
          >
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>

            {(() => {
              const msg = messages.find((message) => message.id === selectedMessage);
              if (!msg) return null;

              return (
                <>
                  <div className="mb-6">
                    <h2 className="font-heading mb-2" style={{ fontSize: '28px', color: '#ffffff' }}>
                      {msg.subject}
                    </h2>
                    <div className="flex items-center gap-4" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      <span>From: {msg.user}</span>
                      <span>•</span>
                      <span>{msg.email}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      <span>{msg.date}</span>
                      <span className="px-2 py-1 rounded bg-[#c9a84c]/20 text-[#c9a84c] text-sm">{msg.category}</span>
                    </div>
                  </div>

                  <div className="mb-6 p-4 rounded-lg bg-white/5">
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>{msg.message}</p>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                      placeholder="Type your reply here..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all resize-none"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => void replyToSelected(msg.id)} className="flex-1 px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105">
                        Send Reply
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </div>
  );
}
