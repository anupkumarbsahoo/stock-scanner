'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Zap } from 'lucide-react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { formatPercent, getChangeColor } from '@/lib/utils/formatters';

export default function OptionsPage() {
  const stocks = useStore((s) => s.stocks);
  const router = useRouter();

  const optionFlowStocks = [...stocks]
    .sort((a, b) => b.optionsFlowScore - a.optionsFlowScore)
    .slice(0, 15);

  const mockFlowData = optionFlowStocks.map((s) => ({
    ...s,
    callVolume: Math.floor(Math.random() * 50000 + 5000),
    putVolume: Math.floor(Math.random() * 30000 + 2000),
    callOI: Math.floor(Math.random() * 200000 + 20000),
    putOI: Math.floor(Math.random() * 150000 + 15000),
    unusualFlow: Math.random() > 0.6,
    flowType: Math.random() > 0.4 ? 'Aggressive CALL buying' : Math.random() > 0.5 ? 'Mixed' : 'Aggressive PUT buying',
    impliedVol: (20 + Math.random() * 60).toFixed(1),
    ivRank: Math.floor(Math.random() * 100),
  }));

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-purple-400" />
        <h1 className="text-lg font-bold text-white">Options Flow</h1>
        <span className="text-xs text-gray-500">— Unusual activity detection</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-emerald-500/40 border border-emerald-500 rounded" />
          <span>Bullish call flow</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500/40 border border-red-500 rounded" />
          <span>Bearish put flow</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap size={12} className="text-yellow-400" />
          <span>Unusual activity</span>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800 bg-gray-900">
            <tr>
              {['Ticker', 'Change', 'Options Score', 'Flow Type', 'Call Vol', 'Put Vol', 'C/P Ratio', 'IV', 'IV Rank', 'Unusual'].map((col) => (
                <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {mockFlowData.map((stock) => {
              const cpRatio = (stock.callVolume / stock.putVolume).toFixed(2);
              const isBullish = stock.flowType.includes('CALL');
              return (
                <tr
                  key={stock.ticker}
                  onClick={() => router.push(`/stock/${stock.ticker}`)}
                  className={`hover:bg-gray-800/40 cursor-pointer ${
                    isBullish ? 'border-l-2 border-l-emerald-500/40' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-white">{stock.ticker}</p>
                      <p className="text-xs text-gray-600 truncate max-w-[100px]">{stock.company}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono ${getChangeColor(stock.changePercent)}`}>
                      {formatPercent(stock.changePercent)}
                    </span>
                  </td>
                  <td className="px-4 py-3"><ScoreBadge score={stock.optionsFlowScore} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                      isBullish
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : stock.flowType === 'Mixed'
                        ? 'bg-gray-700/50 text-gray-400 border-gray-600'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}>
                      {stock.flowType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-300">
                    {(stock.callVolume / 1000).toFixed(0)}K
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-300">
                    {(stock.putVolume / 1000).toFixed(0)}K
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono font-bold ${parseFloat(cpRatio) > 1.5 ? 'text-emerald-400' : parseFloat(cpRatio) < 0.8 ? 'text-red-400' : 'text-gray-400'}`}>
                      {cpRatio}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{stock.impliedVol}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-12 bg-gray-800 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${stock.ivRank > 70 ? 'bg-red-500' : stock.ivRank > 40 ? 'bg-yellow-500' : 'bg-gray-600'}`}
                          style={{ width: `${stock.ivRank}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-500">{stock.ivRank}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stock.unusualFlow && <Zap size={14} className="text-yellow-400 mx-auto" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
