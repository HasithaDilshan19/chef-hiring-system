import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings, ShieldAlert, Check, Save } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    system_name: 'ChefHire',
    contact_email: 'support@chefhire.com',
    contact_phone: '+94 11 234 5678',
    commission_rate: '10',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      if (response.data.status === 'success' && Object.keys(response.data.settings).length > 0) {
        setSettings({ ...settings, ...response.data.settings });
      }
    } catch (err) {
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    
    try {
      const response = await api.put('/admin/settings', settings);
      if (response.data.status === 'success') {
        setSuccessMsg('Settings updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-950">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 mb-3 inline-block">
          System Configuration
        </span>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="text-amber-500" size={32} />
          General Settings
        </h1>
      </header>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex gap-2">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex gap-2">
          <Check size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-8 max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <h3 className="text-lg font-bold text-white mb-1 border-b border-slate-800 pb-2">Branding</h3>
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                System Name
              </label>
              <input
                type="text"
                name="system_name"
                value={settings.system_name}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. ChefHire"
              />
              <p className="text-xs text-slate-500 mt-2">This is the public-facing name of the application.</p>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-bold text-white mb-1 border-b border-slate-800 pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={settings.contact_email}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Support Phone Number
                </label>
                <input
                  type="text"
                  name="contact_phone"
                  value={settings.contact_phone}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="+94 77 ..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-bold text-white mb-1 border-b border-slate-800 pb-2">Financials</h3>
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Platform Commission Rate (%)
              </label>
              <input
                type="number"
                name="commission_rate"
                value={settings.commission_rate}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full md:w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                placeholder="10"
              />
              <p className="text-xs text-slate-500 mt-2">Percentage fee collected by the platform per booking.</p>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
