'use client';

import { SmartMoneyData } from '@/types';
import { DollarSign, Eye, TrendingUp } from 'lucide-react';

interface SmartMoneyFlowProps {
  data: SmartMoneyData;
}

function FlowBadge({ value }: { value: string }) {
  const isBullish = value.toLowerCase().includes('bullish') || value.toLowerCase().includes('increasing') || value.toLowerCase().includes('call');
  const isBearish = value.toLowerCase().includes('bearish') || value.toLowerCase().includes('decreasing') || value.toLowerCase().includes('put');
  const style = isBullish
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    : isBearish
    ? 'bg-red-500/20 text-red-400 border-red-500/40'
    : 'bg-gray-700/50 text-gray-400 border-gray-600';
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${style}`}>{value}</span>
  );
}

export default function SmartMoneyFlow({ data }: SmartMoneyFlowProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
        <Eye size={16} className="text-purple-400" />
        <h3 className="text-sm font-bold text-white">SMART MONEY FLOW</h3>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
            <span className="text-xs text-gray-400">Dark Pool Activity</span>
            <FlowBadge value={data.darkPoolActivity} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
            <span className="text-xs text-gray-400">Options Flow</span>
            <FlowBadge value={data.optionsFlow} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
            <span className="text-xs text-gray-400">Call/Put Ratio</span>
            <span className={`text-xs font-mono font-bold ${data.callPutRatio > 1 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.callPutRatio.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
            <span className="text-xs text-gray-400">Institutional</span>
            <FlowBadge value={data.institutionalBuying} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-gray-400">Hedge Fund Sentiment</span>
            <FlowBadge value={data.hedgeFundSentiment} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
            <span className="text-xs text-gray-400">Unusual Activity</span>
            <span className={`text-xs font-bold ${data.unusualActivity ? 'text-yellow-400' : 'text-gray-500'}`}>
              {data.unusualActivity ? '⚡ YES' : 'None'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
            <span className="text-xs text-gray-400">Block Trades</span>
            <span className="text-xs font-mono text-gray-300">{data.blockTrades}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-gray-400">Whale Activity</span>
            <span className={`text-xs font-bold ${data.whaleActivity ? 'text-purple-400' : 'text-gray-500'}`}>
              {data.whaleActivity ? '🐋 Detected' : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Insider Transactions */}
      {data.insiderTransactions && data.insiderTransactions.length > 0 && (
        <div className="border-t border-gray-700 px-4 py-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Insider Transactions</p>
          <div className="space-y-1.5">
            {data.insiderTransactions.slice(0, 4).map((txn, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-300 font-medium">{txn.name}</span>
                  <span className="text-gray-600 ml-1">({txn.title})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={txn.type === 'Buy' ? 'text-emerald-400' : 'text-red-400'}>
                    {txn.type}
                  </span>
                  <span className="text-gray-400">{txn.shares.toLocaleString()} shares</span>
                  <span className="text-gray-500">{txn.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
