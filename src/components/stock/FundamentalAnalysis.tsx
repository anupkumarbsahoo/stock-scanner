'use client';

import { StockDetail } from '@/types';
import { ScoreBar } from '@/components/ui/ScoreBadge';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { BarChart3 } from 'lucide-react';

interface FundamentalAnalysisProps {
  stock: StockDetail;
}

function MetricRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const color = positive === undefined ? 'text-gray-300' : positive ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800/50">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs font-mono font-medium ${color}`}>{value}</span>
    </div>
  );
}

export default function FundamentalAnalysis({ stock }: FundamentalAnalysisProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
        <BarChart3 size={16} className="text-blue-400" />
        <h3 className="text-sm font-bold text-white">FUNDAMENTAL ANALYSIS</h3>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Growth metrics */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Growth</p>
          <MetricRow label="Revenue Growth" value={formatPercent(stock.revenueGrowth)} positive={stock.revenueGrowth > 0} />
          <MetricRow label="EPS Growth" value={formatPercent(stock.epsGrowth)} positive={stock.epsGrowth > 0} />
          <MetricRow label="Gross Margin" value={formatPercent(stock.grossMargin || 0)} positive={(stock.grossMargin || 0) > 30} />
          <MetricRow label="Operating Margin" value={formatPercent(stock.operatingMargin || 0)} positive={(stock.operatingMargin || 0) > 10} />
          <MetricRow label="Net Margin" value={formatPercent(stock.netMargin || 0)} positive={(stock.netMargin || 0) > 0} />
          <MetricRow label="ROE" value={`${(stock.roe || 0).toFixed(1)}%`} positive={(stock.roe || 0) > 15} />
          <MetricRow label="Free Cash Flow" value={formatCurrency(stock.freeCashFlow || 0)} positive={(stock.freeCashFlow || 0) > 0} />

          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 mt-4">Valuation</p>
          <MetricRow label="P/E Ratio" value={stock.pe > 0 ? stock.pe.toFixed(1) : 'N/A'} positive={stock.pe > 0 && stock.pe < 40} />
          <MetricRow label="Forward P/E" value={stock.forwardPE > 0 ? (stock.forwardPE || 0).toFixed(1) : 'N/A'} positive={(stock.forwardPE || 0) > 0 && (stock.forwardPE || 0) < 35} />
          <MetricRow label="PEG Ratio" value={(stock.pegRatio || 0).toFixed(2)} positive={(stock.pegRatio || 0) > 0 && (stock.pegRatio || 0) < 2} />
          <MetricRow label="D/E Ratio" value={(stock.debtToEquity || 0).toFixed(2)} positive={(stock.debtToEquity || 0) < 1} />
        </div>

        {/* Ownership + Scores */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Ownership</p>
          <MetricRow label="Institutional" value={`${stock.institutionalOwnership.toFixed(1)}%`} positive={stock.institutionalOwnership > 50} />
          <MetricRow label="Insider Buying" value={stock.insiderBuying} positive={stock.insiderBuying === 'Positive'} />
          <MetricRow label="Analyst Rating" value={stock.analystRating} positive={['Strong Buy', 'Buy'].includes(stock.analystRating)} />
          <MetricRow label="Price Target" value={`$${stock.priceTarget.toFixed(2)}`} positive={stock.priceTarget > stock.price} />
          <MetricRow label="Upside" value={formatPercent(((stock.priceTarget - stock.price) / stock.price) * 100)} positive={stock.priceTarget > stock.price} />
          <MetricRow label="Short Float" value={`${stock.shortFloat.toFixed(1)}%`} positive={stock.shortFloat < 5} />
          <MetricRow label="Beta" value={stock.beta.toFixed(2)} />

          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 mt-4">Fundamental Scores</p>
          <div className="space-y-2">
            <ScoreBar score={stock.fundamentalScore} label="Overall" />
            <ScoreBar score={stock.institutionalScore} label="Institutional" />
          </div>

          {/* Earnings history */}
          {stock.earningsHistory && stock.earningsHistory.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Earnings History</p>
              <div className="space-y-1">
                {stock.earningsHistory.slice(0, 4).map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{e.date}</span>
                    <span className="text-gray-400">Est: {e.estimate.toFixed(2)}</span>
                    <span className={e.actual >= e.estimate ? 'text-emerald-400' : 'text-red-400'}>
                      Act: {e.actual.toFixed(2)}
                    </span>
                    <span className={e.surprisePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {e.surprisePercent >= 0 ? '+' : ''}{e.surprisePercent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
