'use client';

import { useState } from 'react';
import { Settings, Key, Bell, RefreshCw, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [finnhubKey, setFinnhubKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [refreshInterval, setRefreshInterval] = useState('60');
  const [notifications, setNotifications] = useState({ breakouts: true, highScore: true, earnings: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto h-full overflow-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={18} className="text-gray-400" />
        <h1 className="text-lg font-bold text-white">Settings</h1>
      </div>

      {/* API Keys */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} className="text-emerald-400" />
          <h2 className="text-sm font-bold text-white">API Keys</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          ⚠️ API keys are stored in server environment variables (.env.local). The fields below are for reference only — configure keys in your deployment settings or .env.local file.
        </p>

        {[
          { label: 'Finnhub API Key', placeholder: 'c_xxxxxxxxxxxxxxxx', key: 'finnhub', value: finnhubKey, onChange: setFinnhubKey, desc: 'For real-time stock data, quotes, news. Free tier: 60 req/min.' },
          { label: 'Anthropic (Claude) API Key', placeholder: 'sk-ant-xxxxxxxx', key: 'anthropic', value: anthropicKey, onChange: setAnthropicKey, desc: 'For AI-powered stock analysis and explanations.' },
        ].map(({ label, placeholder, key, value, onChange, desc }) => (
          <div key={key} className="mb-4">
            <label className="text-xs text-gray-400 block mb-1">{label}</label>
            <input
              type="password"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
            />
            <p className="text-xs text-gray-600 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      {/* Scanner Settings */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw size={16} className="text-blue-400" />
          <h2 className="text-sm font-bold text-white">Scanner Settings</h2>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-2">Refresh Interval (seconds)</label>
          <div className="flex items-center gap-3">
            {['30', '60', '120', '300'].map((val) => (
              <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="refreshInterval"
                  value={val}
                  checked={refreshInterval === val}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  className="accent-emerald-500"
                />
                <span className="text-xs text-gray-400">{val}s</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-yellow-400" />
          <h2 className="text-sm font-bold text-white">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { key: 'breakouts', label: 'Breakout alerts', desc: 'Notify when a stock breaks out' },
            { key: 'highScore', label: 'High AI score alerts', desc: 'Notify when score exceeds 85' },
            { key: 'earnings', label: 'Earnings alerts', desc: 'Notify before earnings dates' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">{label}</p>
                <p className="text-xs text-gray-600">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-900 rounded-lg border border-yellow-500/30 p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-yellow-400" />
          <h2 className="text-sm font-bold text-yellow-400">Disclaimer</h2>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          This platform is for informational and educational purposes only. It does not constitute financial advice.
          AI scores and signals are algorithmic outputs and should not be the sole basis for investment decisions.
          Past performance is not indicative of future results. Always conduct your own research and consult a
          licensed financial advisor before investing.
        </p>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded transition-colors"
      >
        {saved ? '✓ Saved' : 'Save Settings'}
      </button>
    </div>
  );
}
