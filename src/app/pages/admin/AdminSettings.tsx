import { useEffect, useState } from 'react';
import { Shield, Bell, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { adminService } from '../../lib/services';

export function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: 'Fintech',
    supportEmail: 'support@fintech.com',
    adminEmail: 'admin@fintech.com',
    emailNotifications: true,
    withdrawalManualThreshold: '10000',
    autoApproveEnabled: false,
    autoApproveMaxAmount: '1000',
    sessionTimeoutMinutes: 30,
    apiRateLimitPerHour: 1000,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    void adminService
      .getSettings()
      .then((data) => {
        if (active) {
          setSettings(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load admin settings.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function saveSettings() {
    try {
      setError('');
      await adminService.updateSettings(settings);
      setSuccess('Settings saved.');
      window.setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings.');
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading mb-2" style={{ fontSize: '36px', color: '#ffffff' }}>
          Admin Settings
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Configure platform settings</p>
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

      <div className="max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              Security Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Withdrawal Approval Threshold
              </label>
              <input
                type="number"
                value={settings.withdrawalManualThreshold}
                onChange={(event) => setSettings((current) => ({ ...current, withdrawalManualThreshold: event.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
                Withdrawals above this amount require manual approval
              </p>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-white/10">
              <div>
                <div style={{ color: '#ffffff' }} className="mb-1">
                  Auto-approve Small Withdrawals
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Automatically approve withdrawals under {settings.autoApproveMaxAmount}
                </div>
              </div>
              <button
                onClick={() => setSettings((current) => ({ ...current, autoApproveEnabled: !current.autoApproveEnabled }))}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  settings.autoApproveEnabled ? 'bg-[#c9a84c]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    settings.autoApproveEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Auto-approve Max Amount
              </label>
              <input
                type="number"
                value={settings.autoApproveMaxAmount}
                onChange={(event) => setSettings((current) => ({ ...current, autoApproveMaxAmount: event.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeoutMinutes}
                onChange={(event) => setSettings((current) => ({ ...current, sessionTimeoutMinutes: Number(event.target.value) }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
                  Receive alerts for important events
                </div>
              </div>
              <button
                onClick={() =>
                  setSettings((current) => ({
                    ...current,
                    emailNotifications: !current.emailNotifications,
                  }))
                }
                className={`relative w-12 h-6 rounded-full transition-all ${
                  settings.emailNotifications ? 'bg-[#c9a84c]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    settings.emailNotifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Admin Email
              </label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(event) => setSettings((current) => ({ ...current, adminEmail: event.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-[#c9a84c]" />
            <h2 className="font-heading" style={{ fontSize: '24px', color: '#ffffff' }}>
              System
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(event) => setSettings((current) => ({ ...current, platformName: event.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(event) => setSettings((current) => ({ ...current, supportEmail: event.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                API Rate Limit (requests/hour)
              </label>
              <input
                type="number"
                value={settings.apiRateLimitPerHour}
                onChange={(event) => setSettings((current) => ({ ...current, apiRateLimitPerHour: Number(event.target.value) }))}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>

            <button onClick={() => void saveSettings()} className="w-full px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105">
              Save All Settings
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
