import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/auth';

export function Login() {
  const location = useLocation();
  const redirectTo = typeof location.state?.from === 'string' ? location.state.from : null;
  const signupEmail = typeof location.state?.email === 'string' ? location.state.email : '';
  const signupSuccess = Boolean(location.state?.signupSuccess);
  const defaultUserType: 'client' | 'admin' = redirectTo?.startsWith('/admin') ? 'admin' : 'client';
  const [email, setEmail] = useState(signupEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'client' | 'admin'>(defaultUserType);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setUserType(defaultUserType);
  }, [defaultUserType]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');
      const session = await login({ email, password, roleHint: userType });
      const fallbackPath = session.role === 'admin' ? '/admin' : '/dashboard';
      const nextPath =
        redirectTo &&
        ((session.role === 'admin' && redirectTo.startsWith('/admin')) ||
          (session.role === 'client' && redirectTo.startsWith('/dashboard')))
          ? redirectTo
          : fallbackPath;
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a] flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#3b82f6] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#0a0e1a]" />
            </div>
            <span className="font-heading" style={{ fontSize: '28px', color: '#c9a84c' }}>
              Fintech
            </span>
          </Link>
          <h1 className="font-heading mb-2" style={{ fontSize: '32px', color: '#ffffff' }}>
            {userType === 'admin' ? 'Admin Sign In' : 'Welcome Back'}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {userType === 'admin' ? 'Sign in to the admin portal' : 'Sign in to your account'}
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/80 to-[#0a0e1a]/80 backdrop-blur-xl border border-[#c9a84c]/20">
          {/* User Type Toggle */}
          {signupSuccess && (
            <div className="mb-4 rounded-lg border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-3 text-sm text-[#86efac]">
              Account created successfully. Sign in to continue.
            </div>
          )}

          <div className="flex gap-2 mb-6 p-1 rounded-lg bg-white/5">
            <button
              type="button"
              onClick={() => setUserType('client')}
              className={`flex-1 py-2 rounded-md transition-all ${
                userType === 'client'
                  ? 'bg-[#c9a84c] text-[#0a0e1a]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 py-2 rounded-md transition-all ${
                userType === 'admin'
                  ? 'bg-[#c9a84c] text-[#0a0e1a]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#c9a84c]/20" />
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Remember me
                </span>
              </label>
              <a href="#" className="text-[#c9a84c] hover:text-[#b89640] transition-colors" style={{ fontSize: '14px' }}>
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105"
            >
              {isSubmitting ? 'Signing In...' : userType === 'admin' ? 'Sign In as Admin' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Don't have an account? </span>
            <Link to="/signup" className="text-[#c9a84c] hover:text-[#b89640] transition-colors">
              Sign up
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-white/60 hover:text-[#c9a84c] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
