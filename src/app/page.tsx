'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { ScoreBadge, TrendBadge } from '@/components/ui/ScoreBadge';
import SectorHeatmap from '@/components/charts/SectorHeatmap';
import { formatPercent, getChangeColor } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, Zap, Activity, AlertCircle, Star } from 'lucide-react';

function StatCard({ label, value, change, positive }: { label: string; value: string; change?: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1 font-mono">{value}</p>
      {change && (
        <p className={`text-xs mt-0.5 ${positive === undefined ? 'text-gray-400' : positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {change}
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const stocks = useStore((s) => s.stocks);
  const marketOverview = useStore((s) => s.marketOverview);
  const alerts = useStore((s) => s.alerts);
  const watchlist = useStore((s) => s.watchlist);
  const isLoading = useStore((s) => s.isLoading);

  const topStocks = [...stocks].sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);
  const breakouts = stocks.filter((s) => s.pattern === 'Breakout' || s.changePercent > 4).slice(0, 5);
  const bullishStocks = stocks.filter((s) => s.trend === 'Strong Bullish').length;
  const avgScore = stocks.length > 0
    ? Math.round(stocks.reduce((acc, s) => acc + s.aiScore, 0) / stocks.length) : 0;

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Stocks Scanned" value={stocks.length.toString()} change={`${bullishStocks} bullish`} />
        <StatCard label="Avg AI Score" value={avgScore.toString()} change="Market-wide" />
        <StatCard
          label="SPY"
          value={`$${marketOverview.spy.price.toFixed(2)}`}
          change={`${marketOverview.spy.changePercent >= 0 ? '+' : ''}${marketOverview.spy.changePercent.toFixed(2)}%`}
          positive={marketOverview.spy.changePercent >= 0}
        />
        <StatCard
          label="VIX"
          value={marketOverview.vix.price.toFixed(2)}
          change={`Fear · ${marketOverview.vix.changePercent.toFixed(2)}%`}
          positive={marketOverview.vix.changePercent <= 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Ranked */}
        <div className="lg:col-span-2 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-white">TOP AI RANKED STOCKS</h2>
            </div>
            <button onClick={() => router.push('/scanner')} className="text-xs text-emerald-400 hover:text-emerald-300">
              View all →
            </button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {topStocks.map((stock, idx) => (
                <div
                  key={stock.ticker}
                  onClick={() => router.push(`/stock/${stock.ticker}`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/40 cursor-pointer"
                >
                  <span className="text-gray-600 text-xs w-4 font-mono">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{stock.ticker}</span>
                      <TrendBadge trend={stock.trend} />
                      <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                        {stock.pattern}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{stock.company}</p>
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-sm font-mono text-white">${stock.price.toFixed(2)}</p>
                    <p className={`text-xs font-mono ${getChangeColor(stock.changePercent)}`}>
                      {formatPercent(stock.changePercent)}
                    </p>
                  </div>
                  <ScoreBadge score={stock.aiScore} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
              <AlertCircle size={16} className="text-yellow-400" />
              <h2 className="text-sm font-bold text-white">LIVE ALERTS</h2>
              <span className="ml-auto text-xs text-gray-500">{alerts.filter((a) => !a.read).length} new</span>
            </div>
            <div className="divide-y divide-gray-800/50">
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => router.push(`/stock/${alert.ticker}`)}
                  className={`px-4 py-2.5 hover:bg-gray-800/40 cursor-pointer ${!alert.read ? 'border-l-2 border-emerald-500' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-white">{alert.ticker}</span>
                    <span className={`text-xs px-1.5 rounded font-medium ${
                      alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>{alert.severity}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Watchlist */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
              <Star size={16} className="text-yellow-400" />
              <h2 className="text-sm font-bold text-white">WATCHLIST</h2>
              <span className="ml-auto text-xs text-gray-500">{watchlist.length}</span>
            </div>
            {watchlist.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-gray-500">Star stocks in the scanner to watch them</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {watchlist.slice(0, 5).map((item) => {
                  const stock = stocks.find((s) => s.ticker === item.ticker);
                  return (
                    <div
                      key={item.ticker}
                      onClick={() => router.push(`/stock/${item.ticker}`)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-800/40 cursor-pointer"
                    >
                      <span className="text-sm font-bold text-white">{item.ticker}</span>
                      {stock && (
                        <div className="text-right">
                          <p className="text-xs font-mono text-white">${stock.price.toFixed(2)}</p>
                          <p className={`text-xs font-mono ${getChangeColor(stock.changePercent)}`}>
                            {formatPercent(stock.changePercent)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Indices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'S&P 500 (SPY)', data: marketOverview.spy },
          { label: 'NASDAQ (QQQ)', data: marketOverview.qqq },
          { label: 'DOW (DIA)', data: marketOverview.dia },
          { label: 'VIX', data: marketOverview.vix },
        ].map(({ label, data }) => (
          <div key={label} className="bg-gray-900 rounded-lg border border-gray-800 p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-bold font-mono text-white mt-1">${data.price.toFixed(2)}</p>
            <div className={`flex items-center gap-1 ${getChangeColor(data.changePercent)}`}>
              {data.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="text-xs font-mono">{formatPercent(data.changePercent)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sector Heatmap */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
          <Activity size={16} className="text-blue-400" />
          <h2 className="text-sm font-bold text-white">SECTOR HEATMAP</h2>
        </div>
        <div className="p-4">
          {stocks.length > 0 ? <SectorHeatmap stocks={stocks} /> : (
            <div className="text-center py-6 text-gray-500 text-sm">Loading...</div>
          )}
        </div>
      </div>

      {/* Breakouts */}
      {breakouts.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
            <TrendingUp size={16} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">TODAY&apos;S BREAKOUTS</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4">
            {breakouts.map((stock) => (
              <div
                key={stock.ticker}
                onClick={() => router.push(`/stock/${stock.ticker}`)}
                className="bg-gray-800/50 rounded-lg p-3 cursor-pointer hover:bg-gray-800 border border-gray-700 hover:border-emerald-500/40 transition-all"
              >
                <p className="font-bold text-white">{stock.ticker}</p>
                <p className={`text-sm font-mono font-bold ${getChangeColor(stock.changePercent)}`}>
                  {formatPercent(stock.changePercent)}
                </p>
                <div className="mt-1.5">
                  <ScoreBadge score={stock.aiScore} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
