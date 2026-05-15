'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { TrendingUp } from 'lucide-react';
import { ScoreBadge, TrendBadge } from '@/components/ui/ScoreBadge';
import { formatPercent, getChangeColor } from '@/lib/utils/formatters';

export default function TechnicalPage() {
  const stocks = useStore((s) => s.stocks);
  const router = useRouter();

  const sorted = [...stocks].sort((a, b) => b.technicalScore - a.technicalScore);

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-emerald-400" />
        <h1 className="text-lg font-bold text-white">Technical Analysis</h1>
        <span className="text-xs text-gray-500">— Sorted by technical score</span>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800 bg-gray-900">
            <tr>
              {['Ticker', 'Price', 'Change', 'Tech Score', 'Pattern', 'Trend', 'RSI', 'EMA Align', 'MACD', 'Rel.Vol', 'ATR'].map((col) => (
                <th key={col} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {sorted.map((stock) => {
              const emaAligned = stock.ema9 > stock.ema21 && stock.ema21 > stock.ema50;
              return (
                <tr
                  key={stock.ticker}
                  onClick={() => router.push(`/stock/${stock.ticker}`)}
                  className="hover:bg-gray-800/40 cursor-pointer"
                >
                  <td className="px-3 py-3">
                    <p className="font-bold text-white">{stock.ticker}</p>
                    <p className="text-xs text-gray-600 truncate max-w-[100px]">{stock.company}</p>
                  </td>
                  <td className="px-3 py-3 font-mono text-white text-sm">${stock.price.toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-mono ${getChangeColor(stock.changePercent)}`}>
                      {formatPercent(stock.changePercent)}
                    </span>
                  </td>
                  <td className="px-3 py-3"><ScoreBadge score={stock.technicalScore} /></td>
                  <td className="px-3 py-3">
                    <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                      {stock.pattern}
                    </span>
                  </td>
                  <td className="px-3 py-3"><TrendBadge trend={stock.trend} /></td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-mono font-bold ${stock.rsi >= 70 ? 'text-red-400' : stock.rsi >= 50 ? 'text-emerald-400' : stock.rsi <= 30 ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {stock.rsi.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium ${emaAligned ? 'text-emerald-400' : 'text-red-400'}`}>
                      {emaAligned ? '✓ Aligned' : '✗ Broken'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium ${stock.macd >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stock.macd >= 0 ? 'Bullish' : 'Bearish'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-mono ${stock.relativeVolume >= 1.5 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {stock.relativeVolume.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs font-mono text-gray-400">${stock.atr.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
