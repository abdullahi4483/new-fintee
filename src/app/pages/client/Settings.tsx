import { useEffect, useState } from 'react';
import { User, Bell, Shield, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { authService, customerService } from '../../lib/services';
import { useAuth } from '../../lib/auth';

export function Settings() {
  const { session, updateSessionUser } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '' });
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError('');
        const [nextProfile, security, notifications, preferences] = await Promise.all([
          customerService.getProfile(),
          customerService.getSecurity(),
          customerService.getNotifications(),
          customerService.getPreferences(),
        ]);

        if (!active) {
          return;
        }

        setProfile(nextProfile);
        setTwoFactorEnabled(security.twoFactorEnabled);
        setEmailNotifications(notifications.emailNotifications);
        setPushNotifications(notifications.pushNotifications);
        setLanguage(preferences.language);
        setCurrency(preferences.currency);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load settings.');
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

  function showSuccess(message: string) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(''), 3000);
  }

  async function saveProfile() {
    try {
      setError('');
      await customerService.updateProfile(profile);
      updateSessionUser({ ...session?.user, ...profile });
      showSuccess('Profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile.');
    }
  }

  async function saveSecurity() {
    try {
      setError('');
      await customerService.updateSecurity({ twoFactorEnabled });
      if (currentPassword && newPassword) {
        await authService.changePassword({ currentPassword, newPassword });
        setCurrentPassword('');
        setNewPassword('');
      }
      showSuccess('Security settings updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save security settings.');
    }
  }

  async function saveNotifications() {
    try {
      setError('');
      await customerService.updateNotifications({ emailNotifications, pushNotifications });
      showSuccess('Notification preferences updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save notification preferences.');
    }
  }

  async function savePreferences() {
    try {
      setError('');
      await customerService.updatePreferences({ language, currency });
      showSuccess('Preferences updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save preferences.');
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Settings
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage your account settings</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#fca5a5]">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-3 text-[#86efac]">
          {success}
        </div>
      )}
      {loading && <div className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading settings...</div>}

      <div className="max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Profile Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
            <button onClick={() => void saveProfile()} className="px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105">
              Save Changes
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Security
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div>
                <div style={{ color: '#ffffff' }} className="mb-1">
                  Two-Factor Authentication
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Add an extra layer of security
                </div>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  twoFactorEnabled ? 'bg-[#c9a84c]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    twoFactorEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Current password"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/30 focus:border-[#c9a84c] focus:outline-none transition-all"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/30 focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>

            <button onClick={() => void saveSecurity()} className="w-full px-6 py-3 border border-[#c9a84c]/40 text-white rounded-lg hover:border-[#c9a84c] transition-all">
              Save Security Settings
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div>
                <div style={{ color: '#ffffff' }} className="mb-1">
                  Email Notifications
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Receive transaction alerts via email
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  emailNotifications ? 'bg-[#c9a84c]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    emailNotifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div style={{ color: '#ffffff' }} className="mb-1">
                  Push Notifications
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Receive notifications on your device
                </div>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  pushNotifications ? 'bg-[#c9a84c]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    pushNotifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <button onClick={() => void saveNotifications()} className="w-full px-6 py-3 border border-[#c9a84c]/40 text-white rounded-lg hover:border-[#c9a84c] transition-all">
              Save Notifications
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Preferences
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Language
              </label>
              <select value={language} onChange={(event) => setLanguage(event.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Currency
              </label>
              <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <button onClick={() => void savePreferences()} className="w-full px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105">
              Save Preferences
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
