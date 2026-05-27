'use client';

import { useRouter } from 'next/navigation';
import { Star, StarOff, ChevronUp, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Stock } from '@/types';
import { ScoreBadge, TrendBadge } from '@/components/ui/ScoreBadge';
import {
  formatCurrency, formatPercent, formatVolume, formatRelativeVolume,
  formatNumber, getChangeColor,
} from '@/lib/utils/formatters';

const COLUMNS: { key: keyof Stock; label: string; sortable?: boolean }[] = [
  { key: 'ticker', label: 'Ticker', sortable: true },
  { key: 'price', label: 'Price', sortable: true },
  { key: 'changePercent', label: 'Change %', sortable: true },
  { key: 'aiScore', label: 'AI Score', sortable: true },
  { key: 'technicalScore', label: 'Technical', sortable: true },
  { key: 'fundamentalScore', label: 'Fundamental', sortable: true },
  { key: 'sentimentScore', label: 'Sentiment', sortable: true },
  { key: 'pattern', label: 'Pattern', sortable: false },
  { key: 'trend', label: 'Trend', sortable: false },
  { key: 'relativeVolume', label: 'Rel.Vol', sortable: true },
  { key: 'rsi', label: 'RSI', sortable: true },
  { key: 'buyProbability', label: 'Buy Prob.', sortable: true },
  { key: 'marketCap', label: 'Mkt Cap', sortable: true },
  { key: 'sector', label: 'Sector', sortable: true },
];

function SortIcon({ field, sortBy, sortDir }: { field: keyof Stock; sortBy: keyof Stock; sortDir: 'asc' | 'desc' }) {
  if (sortBy !== field) return <ChevronUp className="text-gray-700" size={12} />;
  return sortDir === 'asc'
    ? <ChevronUp className="text-emerald-400" size={12} />
    : <ChevronDown className="text-emerald-400" size={12} />;
}

function RSIBadge({ rsi }: { rsi: number }) {
  let color = 'text-gray-300';
  if (rsi >= 70) color = 'text-red-400';
  else if (rsi >= 60) color = 'text-yellow-400';
  else if (rsi <= 30) color = 'text-blue-400';
  else if (rsi >= 50) color = 'text-emerald-400';
  return <span className={`font-mono text-xs ${color}`}>{rsi.toFixed(1)}</span>;
}

export default function ScannerTable() {
  const router = useRouter();
  const filteredStocks = useStore((s) => s.filteredStocks);
  const sortBy = useStore((s) => s.sortBy);
  const sortDir = useStore((s) => s.sortDir);
  const setSortBy = useStore((s) => s.setSortBy);
  const addToWatchlist = useStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);
  const isInWatchlist = useStore((s) => s.isInWatchlist);
  const isLoading = useStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Scanning market...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm min-w-[1200px]">
        <thead className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800">
          <tr>
            <th className="w-8 px-2 py-2" />
            {COLUMNS.map(({ key, label, sortable }) => (
              <th
                key={key}
                className={`px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                  sortable ? 'cursor-pointer hover:text-gray-200 select-none' : ''
                }`}
                onClick={sortable ? () => setSortBy(key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {label}
                  {sortable && <SortIcon field={key} sortBy={sortBy} sortDir={sortDir} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {filteredStocks.map((stock, idx) => {
            const inWatchlist = isInWatchlist(stock.ticker);
            return (
              <tr
                key={stock.ticker}
                className="hover:bg-gray-800/40 transition-colors cursor-pointer group"
                onClick={() => router.push(`/stock/${stock.ticker}`)}
              >
                {/* Rank + Watchlist */}
                <td className="px-2 py-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs text-gray-600 font-mono">{idx + 1}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        inWatchlist ? removeFromWatchlist(stock.ticker) : addToWatchlist(stock.ticker);
                      }}
                      className="text-gray-600 hover:text-yellow-400 transition-colors"
                    >
                      {inWatchlist ? (
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff size={12} />
                      )}
                    </button>
                  </div>
                </td>

                {/* Ticker */}
                <td className="px-3 py-2">
                  <div>
                    <span className="font-bold text-white">{stock.ticker}</span>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{stock.company}</p>
                  </div>
                </td>

                {/* Price */}
                <td className={`px-3 py-2 font-mono ${stock.isLivePrice ? 'text-white' : 'text-orange-400'}`}>
                  ${stock.price.toFixed(2)}
                </td>

                {/* Change % */}
                <td className="px-3 py-2">
                  <span className={`flex items-center gap-0.5 font-mono text-xs ${getChangeColor(stock.changePercent)}`}>
                    {stock.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {formatPercent(stock.changePercent)}
                  </span>
                </td>

                {/* AI Score */}
                <td className="px-3 py-2">
                  <ScoreBadge score={stock.aiScore} />
                </td>

                {/* Technical */}
                <td className="px-3 py-2">
                  <ScoreBadge score={stock.technicalScore} size="sm" />
                </td>

                {/* Fundamental */}
                <td className="px-3 py-2">
                  <ScoreBadge score={stock.fundamentalScore} size="sm" />
                </td>

                {/* Sentiment */}
                <td className="px-3 py-2">
                  <ScoreBadge score={stock.sentimentScore} size="sm" />
                </td>

                {/* Pattern */}
                <td className="px-3 py-2">
                  <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded whitespace-nowrap">
                    {stock.pattern}
                  </span>
                </td>

                {/* Trend */}
                <td className="px-3 py-2">
                  <TrendBadge trend={stock.trend} />
                </td>

                {/* Relative Volume */}
                <td className="px-3 py-2">
                  <span className={`font-mono text-xs ${stock.relativeVolume >= 1.5 ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {formatRelativeVolume(stock.relativeVolume)}
                  </span>
                </td>

                {/* RSI */}
                <td className="px-3 py-2">
                  <RSIBadge rsi={stock.rsi} />
                </td>

                {/* Buy Probability */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 bg-gray-800 rounded-full h-1">
                      <div
                        className="h-1 rounded-full bg-emerald-500"
                        style={{ width: `${stock.buyProbability}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-emerald-400">{stock.buyProbability}%</span>
                  </div>
                </td>

                {/* Market Cap */}
                <td className="px-3 py-2 text-xs text-gray-400 font-mono">
                  {formatCurrency(stock.marketCap)}
                </td>

                {/* Sector */}
                <td className="px-3 py-2 text-xs text-gray-500">{stock.sector}</td>
              </tr>
            );
          })}
          {filteredStocks.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length + 1} className="px-4 py-12 text-center text-gray-500">
                No stocks match the current filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
