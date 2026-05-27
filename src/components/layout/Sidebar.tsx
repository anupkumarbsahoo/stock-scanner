'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ScanSearch, Star, TrendingUp, Newspaper,
  BarChart3, Zap, Bell, Briefcase, Settings, Activity, ChevronLeft, ChevronRight,
  Waves,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scanner', label: 'Market Scanner', icon: ScanSearch },
  { href: '/whale', label: 'Whale Money', icon: Waves },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
  { href: '/news', label: 'AI News Terminal', icon: Newspaper },
  { href: '/technical', label: 'Technical Analysis', icon: TrendingUp },
  { href: '/options', label: 'Options Flow', icon: BarChart3 },
  { href: '/backtesting', label: 'Backtesting', icon: Activity },
  { href: '/alerts', label: 'Alerts Center', icon: Bell },
  { href: '/portfolio', label: 'Portfolio Tracker', icon: Briefcase },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const unreadCount = useStore((s) => s.unreadAlertCount());
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col h-full bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Zap className="text-emerald-400" size={20} />
            <span className="text-sm font-bold text-white tracking-wider">AI SCANNER</span>
          </div>
        )}
        {collapsed && <Zap className="text-emerald-400 mx-auto" size={20} />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-300 transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg my-0.5 transition-all group relative ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
              )}
              {label === 'Alerts Center' && unreadCount > 0 && (
                <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-600 text-center">
            <p className="text-emerald-500 font-semibold">AI SCANNER v1.0</p>
            <p className="mt-1">Not financial advice</p>
          </div>
        </div>
      )}
    </aside>
  );
}
