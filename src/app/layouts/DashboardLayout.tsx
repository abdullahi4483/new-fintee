import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, Wallet, CreditCard, Settings, LogOut, Menu, X, MessageCircle, ArrowLeftRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/auth';

export function DashboardLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const { logout, session } = useAuth();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
      if (event.matches) {
        setIsSidebarOpen(false);
      }
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/accounts', label: 'Accounts', icon: Wallet },
    { path: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { path: '/dashboard/cards', label: 'Cards', icon: CreditCard },
    { path: '/dashboard/support', label: 'Support', icon: MessageCircle },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[#141e32]/80 backdrop-blur-xl border border-[#c9a84c]/20 text-white"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 h-screen w-64 p-6 bg-[#0f1423]/80 backdrop-blur-xl border-r border-[#c9a84c]/20 z-40"
          >
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#3b82f6] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#0a0e1a]" />
              </div>
              <span className="font-heading" style={{ fontSize: '24px', color: '#c9a84c' }}>
                Fintech
              </span>
            </div>

            <div className="mb-8 rounded-xl bg-white/5 p-4">
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Signed in as</div>
              <div style={{ color: '#ffffff' }}>{session?.user?.fullName || session?.user?.email || 'Client User'}</div>
            </div>

            <nav className="space-y-2 mb-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <button
                type="button"
                onClick={() => void logout()}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
