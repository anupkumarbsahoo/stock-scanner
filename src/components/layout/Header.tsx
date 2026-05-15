'use client';

import { useState, useCallback } from 'react';
import { Search, Bell, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { getChangeColor } from '@/lib/utils/formatters';

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const marketOverview = useStore((s) => s.marketOverview);
  const unreadCount = useStore((s) => s.unreadAlertCount());
  const isLoading = useStore((s) => s.isLoading);
  const setSearchQuery = useStore((s) => s.setSearchQuery);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        const ticker = query.trim().toUpperCase();
        if (ticker.length <= 5) {
          router.push(`/stock/${ticker}`);
        } else {
          setSearchQuery(ticker);
          router.push('/scanner');
        }
      }
    },
    [query, router, setSearchQuery]
  );

  const indices = [
    { label: 'SPY', data: marketOverview.spy },
    { label: 'QQQ', data: marketOverview.qqq },
    { label: 'DIA', data: marketOverview.dia },
    { label: 'VIX', data: marketOverview.vix },
  ];

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center gap-4">
      {/* Market Status */}
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            marketOverview.status === 'OPEN' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
          }`}
        />
        <span
          className={`text-xs font-bold ${
            marketOverview.status === 'OPEN' ? 'text-emerald-400' : 'text-gray-500'
          }`}
        >
          {marketOverview.status}
        </span>
      </div>

      {/* Index Prices */}
      <div className="hidden md:flex items-center gap-4">
        {indices.map(({ label, data }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">{label}</span>
            <span className="text-xs text-white font-mono">{data.price.toFixed(2)}</span>
            <span className={`text-xs font-mono ${getChangeColor(data.changePercent)}`}>
              {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="Search ticker or company..."
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm pl-9 pr-4 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 placeholder-gray-600"
          />
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {isLoading && (
          <RefreshCw size={14} className="text-emerald-400 animate-spin" />
        )}
        <button
          onClick={() => router.push('/alerts')}
          className="relative text-gray-400 hover:text-gray-200 transition-colors p-1"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
