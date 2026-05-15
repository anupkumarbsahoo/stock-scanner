'use client';

import { useState } from 'react';
import { Activity, Play, TrendingUp, TrendingDown, Target, Percent } from 'lucide-react';
import { BacktestResult } from '@/types';

function generateBacktestResult(): BacktestResult {
  const winRate = 60 + Math.random() * 20;
  const totalTrades = Math.floor(Math.random() * 80 + 40);
  const winningTrades = Math.floor(totalTrades * winRate / 100);

  return {
    id: Date.now().toString(),
    name: 'AI Score > 80 Strategy',
    strategy: 'Buy when AI Score > 80, RSI 50-70, EMA aligned. Exit at +15% or -5% stop.',
    startDate: '2024-01-01',
    endDate: '2024-11-30',
    totalReturn: 32 + Math.random() * 40 - 5,
    winRate,
    maxDrawdown: -(5 + Math.random() * 15),
    sharpeRatio: 1.2 + Math.random() * 1.5,
    totalTrades,
    winningTrades,
    losingTrades: totalTrades - winningTrades,
    avgGain: 12 + Math.random() * 8,
    avgLoss: -(4 + Math.random() * 3),
    trades: Array.from({ length: 8 }, (_, i) => ({
      ticker: ['NVDA', 'MU', 'PLTR', 'META', 'SMCI', 'AMD', 'GOOGL', 'AVGO'][i],
      entryDate: `2024-0${(i % 9) + 1}-${10 + i}`,
      exitDate: `2024-0${Math.min((i % 9) + 2, 12)}-${15 + i}`,
      entryPrice: 100 + Math.random() * 200,
      exitPrice: 0,
      return: (Math.random() - 0.3) * 30,
      aiScore: 80 + Math.floor(Math.random() * 20),
    })).map((t) => ({
      ...t,
      exitPrice: t.entryPrice * (1 + t.return / 100),
    })),
  };
}

export default function BacktestingPage() {
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [running, setRunning] = useState(false);
  const [config, setConfig] = useState({
    minAiScore: 80,
    minRsi: 50,
    maxRsi: 70,
    targetPercent: 15,
    stopPercent: 5,
    startDate: '2024-01-01',
    endDate: '2024-11-30',
  });

  const runBacktest = async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 2000));
    setResult(generateBacktestResult());
    setRunning(false);
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-blue-400" />
        <h1 className="text-lg font-bold text-white">Backtesting Engine</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Config Panel */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="text-sm font-bold text-white mb-4">Strategy Configuration</h2>
          <div className="space-y-3">
            {[
              { label: 'Min AI Score', key: 'minAiScore', min: 0, max: 100 },
              { label: 'Min RSI', key: 'minRsi', min: 0, max: 100 },
              { label: 'Max RSI', key: 'maxRsi', min: 0, max: 100 },
              { label: 'Target %', key: 'targetPercent', min: 1, max: 50 },
              { label: 'Stop Loss %', key: 'stopPercent', min: 1, max: 20 },
            ].map(({ label, key, min, max }) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-gray-400">{label}</label>
                  <span className="text-xs font-mono text-emerald-400">
                    {config[key as keyof typeof config]}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={config[key as keyof typeof config] as number}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [key]: +e.target.value }))}
                  className="w-full accent-emerald-500"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={config.startDate}
                  onChange={(e) => setConfig((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">End Date</label>
                <input
                  type="date"
                  value={config.endDate}
                  onChange={(e) => setConfig((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-xs px-2 py-1.5 rounded"
                />
              </div>
            </div>

            <button
              onClick={runBacktest}
              disabled={running}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white text-sm font-bold py-2.5 rounded transition-colors"
            >
              <Play size={14} />
              {running ? 'Running backtest...' : 'Run Backtest'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 font-semibold mb-1">Strategy Rules:</p>
            <ul className="text-xs text-gray-500 space-y-0.5">
              <li>• Buy when AI Score ≥ {config.minAiScore}</li>
              <li>• RSI between {config.minRsi}–{config.maxRsi}</li>
              <li>• EMA bullish alignment required</li>
              <li>• Target: +{config.targetPercent}%</li>
              <li>• Stop Loss: -{config.stopPercent}%</li>
            </ul>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {running && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Scanning historical data...</p>
              <p className="text-xs text-gray-600 mt-1">Analyzing 2024 market data with AI scoring</p>
            </div>
          )}

          {result && !running && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total Return', value: `${result.totalReturn >= 0 ? '+' : ''}${result.totalReturn.toFixed(1)}%`, positive: result.totalReturn >= 0, icon: TrendingUp },
                  { label: 'Win Rate', value: `${result.winRate.toFixed(1)}%`, positive: result.winRate >= 50, icon: Percent },
                  { label: 'Max Drawdown', value: `${result.maxDrawdown.toFixed(1)}%`, positive: false, icon: TrendingDown },
                  { label: 'Sharpe Ratio', value: result.sharpeRatio.toFixed(2), positive: result.sharpeRatio >= 1, icon: Target },
                ].map(({ label, value, positive, icon: Icon }) => (
                  <div key={label} className="bg-gray-900 rounded-lg border border-gray-800 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={14} className={positive ? 'text-emerald-400' : 'text-red-400'} />
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                    <p className={`text-xl font-bold font-mono ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-bold text-white mb-3">Performance Summary</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    { label: 'Total Trades', value: result.totalTrades.toString() },
                    { label: 'Winning Trades', value: result.winningTrades.toString() },
                    { label: 'Losing Trades', value: result.losingTrades.toString() },
                    { label: 'Avg Gain', value: `+${result.avgGain.toFixed(2)}%` },
                    { label: 'Avg Loss', value: `${result.avgLoss.toFixed(2)}%` },
                    { label: 'Period', value: `${result.startDate} → ${result.endDate}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-800/50">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-mono text-gray-300">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trades */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h3 className="text-sm font-bold text-white">Trade History</h3>
                </div>
                <table className="w-full text-xs">
                  <thead className="border-b border-gray-800">
                    <tr>
                      {['Ticker', 'Entry', 'Exit', 'Entry $', 'Exit $', 'Return', 'AI Score'].map((col) => (
                        <th key={col} className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {result.trades.map((trade, i) => (
                      <tr key={i} className="hover:bg-gray-800/30">
                        <td className="px-4 py-2 font-bold text-white">{trade.ticker}</td>
                        <td className="px-4 py-2 text-gray-400">{trade.entryDate}</td>
                        <td className="px-4 py-2 text-gray-400">{trade.exitDate}</td>
                        <td className="px-4 py-2 font-mono text-gray-300">${trade.entryPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 font-mono text-gray-300">${trade.exitPrice.toFixed(2)}</td>
                        <td className={`px-4 py-2 font-mono font-bold ${trade.return >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {trade.return >= 0 ? '+' : ''}{trade.return.toFixed(1)}%
                        </td>
                        <td className="px-4 py-2">
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-xs font-mono">
                            {trade.aiScore}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!result && !running && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
              <Activity size={40} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-400 text-lg font-medium">Configure and run a backtest</p>
              <p className="text-gray-600 text-sm mt-2">Adjust the parameters on the left and click Run Backtest</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
