'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import ScannerTable from '@/components/scanner/ScannerTable';
import FilterPanel from '@/components/scanner/FilterPanel';
import { RefreshCw, ScanSearch, Zap } from 'lucide-react';

export default function ScannerPage() {
  const stocks = useStore((s) => s.stocks);
  const filteredStocks = useStore((s) => s.filteredStocks);
  const isLoading = useStore((s) => s.isLoading);
  const setLoading = useStore((s) => s.setLoading);
  const setStocks = useStore((s) => s.setStocks);
  const setMarketOverview = useStore((s) => s.setMarketOverview);
  const lastUpdated = useStore((s) => s.lastUpdated);

  const refresh = async () => {
    setLoading(true);
    try {
      const [scanRes, mktRes] = await Promise.all([
        fetch('/api/scanner'),
        fetch('/api/market'),
      ]);
      if (scanRes.ok) {
        const { stocks: newStocks } = await scanRes.json();
        setStocks(newStocks);
      }
      if (mktRes.ok) {
        const overview = await mktRes.json();
        setMarketOverview(overview);
      }
    } finally {
      setLoading(false);
    }
  };

  const lastUpdateTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Loading...';

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left filter panel */}
      <FilterPanel />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ScanSearch size={16} className="text-emerald-400" />
            <h1 className="text-sm font-bold text-white">MARKET SCANNER</h1>
            <span className="text-xs text-gray-500">
              {filteredStocks.length} stocks
            </span>
            {isLoading && <Zap size={14} className="text-emerald-400 animate-pulse" />}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">Updated: {lastUpdateTime}</span>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScannerTable />
        </div>
      </div>
    </div>
  );
}
