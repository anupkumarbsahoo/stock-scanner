'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, AlertTriangle, Zap, TrendingUp, BarChart3, DollarSign, Building } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils/formatters';
import { Alert } from '@/types';

const ALERT_ICONS: Record<Alert['type'], React.ElementType> = {
  breakout: TrendingUp,
  earnings: Zap,
  options: BarChart3,
  institutional: Building,
  momentum: TrendingUp,
  ai_score: Zap,
};

const ALERT_COLORS: Record<Alert['severity'], string> = {
  high: 'border-red-500/30 bg-red-500/5',
  medium: 'border-yellow-500/30 bg-yellow-500/5',
  low: 'border-gray-700 bg-gray-800/30',
};

export default function AlertsPage() {
  const router = useRouter();
  const alerts = useStore((s) => s.alerts);
  const markAlertRead = useStore((s) => s.markAlertRead);
  const clearAlerts = useStore((s) => s.clearAlerts);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-yellow-400" />
          <h1 className="text-lg font-bold text-white">Alerts Center</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button
            onClick={clearAlerts}
            className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={12} /> Clear all
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Bell size={40} className="text-gray-700 mb-4" />
          <p className="text-gray-400 text-lg font-medium">No alerts yet</p>
          <p className="text-gray-600 text-sm mt-2">Alerts will appear here for breakouts, high AI scores, and unusual activity</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const Icon = ALERT_ICONS[alert.type] || AlertTriangle;
            return (
              <div
                key={alert.id}
                className={`rounded-lg border p-3 flex items-start gap-3 ${ALERT_COLORS[alert.severity]} ${!alert.read ? 'ring-1 ring-emerald-500/20' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  alert.severity === 'high' ? 'bg-red-500/20' :
                  alert.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-gray-700'
                }`}>
                  <Icon size={16} className={
                    alert.severity === 'high' ? 'text-red-400' :
                    alert.severity === 'medium' ? 'text-yellow-400' : 'text-gray-400'
                  } />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <button
                      onClick={() => router.push(`/stock/${alert.ticker}`)}
                      className="font-bold text-white text-sm hover:text-emerald-400 transition-colors"
                    >
                      {alert.ticker}
                    </button>
                    <span className={`text-xs px-1.5 py-0.5 rounded uppercase font-medium ${
                      alert.severity === 'high' ? 'text-red-400 bg-red-500/20' :
                      alert.severity === 'medium' ? 'text-yellow-400 bg-yellow-500/20' :
                      'text-gray-400 bg-gray-700'
                    }`}>{alert.severity}</span>
                    <span className="text-xs text-gray-600 bg-gray-800 px-1.5 rounded">
                      {alert.type.replace('_', ' ')}
                    </span>
                    {!alert.read && (
                      <span className="ml-auto w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-300">{alert.message}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatDate(alert.timestamp)} at {formatTime(alert.timestamp)}
                  </p>
                </div>

                {!alert.read && (
                  <button
                    onClick={() => markAlertRead(alert.id)}
                    className="flex-shrink-0 text-gray-600 hover:text-emerald-400 transition-colors"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
