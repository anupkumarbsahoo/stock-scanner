'use client';

import { useState } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils/formatters';

interface Position {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

const DEMO_POSITIONS: Position[] = [
  { ticker: 'NVDA', shares: 10, avgCost: 720, currentPrice: 875.40, marketValue: 8754, gainLoss: 1554, gainLossPercent: 21.58 },
  { ticker: 'MU', shares: 50, avgCost: 98, currentPrice: 142.55, marketValue: 7127.5, gainLoss: 2227.5, gainLossPercent: 45.46 },
  { ticker: 'PLTR', shares: 200, avgCost: 18.50, currentPrice: 24.82, marketValue: 4964, gainLoss: 1264, gainLossPercent: 34.16 },
  { ticker: 'META', shares: 8, avgCost: 420, currentPrice: 512.30, marketValue: 4098.4, gainLoss: 738.4, gainLossPercent: 21.98 },
];

export default function PortfolioPage() {
  const [positions] = useState<Position[]>(DEMO_POSITIONS);
  const totalValue = positions.reduce((acc, p) => acc + p.marketValue, 0);
  const totalGainLoss = positions.reduce((acc, p) => acc + p.gainLoss, 0);
  const totalCost = positions.reduce((acc, p) => acc + p.avgCost * p.shares, 0);
  const totalReturn = (totalGainLoss / totalCost) * 100;

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase size={18} className="text-blue-400" />
          <h1 className="text-lg font-bold text-white">Portfolio Tracker</h1>
        </div>
        <button className="flex items-center gap-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded">
          <Plus size={12} /> Add Position
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Portfolio Value', value: formatCurrency(totalValue) },
          { label: 'Total Return', value: formatPercent(totalReturn), positive: totalReturn >= 0 },
          { label: 'Total Gain/Loss', value: formatCurrency(totalGainLoss), positive: totalGainLoss >= 0 },
          { label: 'Positions', value: positions.length.toString() },
        ].map(({ label, value, positive }) => (
          <div key={label} className="bg-gray-900 rounded-lg border border-gray-800 p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-xl font-bold font-mono mt-1 ${positive === undefined ? 'text-white' : positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr>
              {['Ticker', 'Shares', 'Avg Cost', 'Current Price', 'Market Value', 'Gain/Loss', 'Return', 'Weight'].map((col) => (
                <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {positions.map((pos) => (
              <tr key={pos.ticker} className="hover:bg-gray-800/40">
                <td className="px-4 py-3 font-bold text-white">{pos.ticker}</td>
                <td className="px-4 py-3 text-gray-300 font-mono">{pos.shares}</td>
                <td className="px-4 py-3 text-gray-400 font-mono">${pos.avgCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-white font-mono">${pos.currentPrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-white font-mono">{formatCurrency(pos.marketValue)}</td>
                <td className={`px-4 py-3 font-mono font-bold ${getChangeColor(pos.gainLoss)}`}>
                  {pos.gainLoss >= 0 ? '+' : ''}{formatCurrency(pos.gainLoss)}
                </td>
                <td className={`px-4 py-3 font-mono font-bold ${getChangeColor(pos.gainLossPercent)}`}>
                  {formatPercent(pos.gainLossPercent)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 bg-gray-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${(pos.marketValue / totalValue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{((pos.marketValue / totalValue) * 100).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
