'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { ScoreBadge, TrendBadge } from '@/components/ui/ScoreBadge';
import { formatPercent, getChangeColor, formatCurrency } from '@/lib/utils/formatters';
import { Star, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

export default function WatchlistPage() {
  const router = useRouter();
  const watchlist = useStore((s) => s.watchlist);
  const stocks = useStore((s) => s.stocks);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);

  const watchlistStocks = watchlist
    .map((item) => ({
      ...item,
      stock: stocks.find((s) => s.ticker === item.ticker),
    }))
    .filter((item) => item.stock);

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <Star size={18} className="text-yellow-400 fill-yellow-400" />
        <h1 className="text-lg font-bold text-white">Watchlist</h1>
        <span className="text-sm text-gray-500">— {watchlist.length} stocks</span>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Star size={40} className="text-gray-700 mb-4" />
          <p className="text-gray-400 text-lg font-medium">Your watchlist is empty</p>
          <p className="text-gray-600 text-sm mt-2">Click the star icon on any stock in the scanner to add it here</p>
          <button
            onClick={() => router.push('/scanner')}
            className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm border border-emerald-500/30 px-4 py-2 rounded"
          >
            Go to Scanner
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 border-b border-gray-800">
              <tr>
                {['Ticker', 'Price', 'Change', 'AI Score', 'Trend', 'Pattern', 'Market Cap', 'RSI', 'Added', ''].map((col) => (
                  <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {watchlistStocks.map(({ ticker, addedAt, stock }) => {
                if (!stock) return null;
                return (
                  <tr
                    key={ticker}
                    onClick={() => router.push(`/stock/${ticker}`)}
                    className="hover:bg-gray-800/40 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-white">{stock.ticker}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[120px]">{stock.company}</p>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-mono ${stock.isLivePrice ? 'text-white' : 'text-orange-400'}`}>${stock.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-0.5 font-mono text-xs ${getChangeColor(stock.changePercent)}`}>
                        {stock.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {formatPercent(stock.changePercent)}
                      </span>
                    </td>
                    <td className="px-4 py-3"><ScoreBadge score={stock.aiScore} /></td>
                    <td className="px-4 py-3"><TrendBadge trend={stock.trend} /></td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                        {stock.pattern}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{formatCurrency(stock.marketCap)}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-300">{stock.rsi.toFixed(1)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(addedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromWatchlist(ticker); }}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
