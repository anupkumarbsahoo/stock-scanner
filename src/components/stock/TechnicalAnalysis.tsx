'use client';

import { StockDetail } from '@/types';
import { ScoreBar } from '@/components/ui/ScoreBadge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TechnicalAnalysisProps {
  stock: StockDetail;
}

function IndicatorRow({ label, value, status }: { label: string; value: string; status: 'bullish' | 'bearish' | 'neutral' }) {
  const statusColor = status === 'bullish' ? 'text-emerald-400' : status === 'bearish' ? 'text-red-400' : 'text-yellow-400';
  const StatusIcon = status === 'bullish' ? TrendingUp : status === 'bearish' ? TrendingDown : Minus;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800/50">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <StatusIcon size={12} className={statusColor} />
        <span className={`text-xs font-mono font-medium ${statusColor}`}>{value}</span>
      </div>
    </div>
  );
}

export default function TechnicalAnalysis({ stock }: TechnicalAnalysisProps) {
  const emaAligned = stock.ema9 > stock.ema21 && stock.ema21 > stock.ema50;
  const bullishMacd = stock.macd > 0;
  const healthyRsi = stock.rsi >= 45 && stock.rsi <= 75;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-bold text-white">TECHNICAL ANALYSIS</h3>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Indicators */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Indicators</p>
          <div className="space-y-0.5">
            <IndicatorRow
              label="Pattern"
              value={stock.pattern}
              status={['Breakout', 'Bull Flag', 'Cup & Handle', 'EMA Crossover', 'Ascending Triangle'].includes(stock.pattern) ? 'bullish' : 'neutral'}
            />
            <IndicatorRow
              label="Trend"
              value={stock.trend}
              status={stock.trend.includes('Bullish') ? 'bullish' : stock.trend.includes('Bearish') ? 'bearish' : 'neutral'}
            />
            <IndicatorRow
              label="EMA Stack"
              value={emaAligned ? 'EMA 9 > 21 > 50' : 'Misaligned'}
              status={emaAligned ? 'bullish' : 'bearish'}
            />
            <IndicatorRow
              label="EMA 9"
              value={`$${stock.ema9.toFixed(2)}`}
              status={stock.price > stock.ema9 ? 'bullish' : 'bearish'}
            />
            <IndicatorRow
              label="EMA 21"
              value={`$${stock.ema21.toFixed(2)}`}
              status={stock.price > stock.ema21 ? 'bullish' : 'bearish'}
            />
            <IndicatorRow
              label="EMA 50"
              value={`$${stock.ema50.toFixed(2)}`}
              status={stock.price > stock.ema50 ? 'bullish' : 'bearish'}
            />
            <IndicatorRow
              label="EMA 200"
              value={`$${stock.ema200.toFixed(2)}`}
              status={stock.price > stock.ema200 ? 'bullish' : 'bearish'}
            />
            <IndicatorRow
              label="RSI (14)"
              value={stock.rsi.toFixed(1)}
              status={healthyRsi ? 'bullish' : stock.rsi > 75 ? 'bearish' : 'neutral'}
            />
            <IndicatorRow
              label="MACD"
              value={bullishMacd ? 'Bullish' : 'Bearish'}
              status={bullishMacd ? 'bullish' : 'bearish'}
            />
            <IndicatorRow
              label="VWAP"
              value={`$${stock.vwap.toFixed(2)}`}
              status={stock.price > stock.vwap ? 'bullish' : 'bearish'}
            />
            <IndicatorRow
              label="Volume Surge"
              value={stock.relativeVolume >= 1.5 ? 'YES' : 'NO'}
              status={stock.relativeVolume >= 1.5 ? 'bullish' : 'neutral'}
            />
            <IndicatorRow
              label="ATR"
              value={`$${stock.atr.toFixed(2)}`}
              status="neutral"
            />
            <IndicatorRow
              label="Rel. Strength"
              value={`${stock.momentumScore}`}
              status={stock.momentumScore >= 60 ? 'bullish' : stock.momentumScore < 40 ? 'bearish' : 'neutral'}
            />
          </div>
        </div>

        {/* Right: Scores + Levels */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Score Breakdown</p>
          <div className="space-y-2 mb-6">
            <ScoreBar score={stock.technicalScore} label="Technical" />
            <ScoreBar score={stock.momentumScore} label="Momentum" />
            <ScoreBar score={stock.optionsFlowScore} label="Options" />
            <ScoreBar score={stock.sentimentScore} label="Sentiment" />
          </div>

          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Price Levels</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">52W High</span>
              <span className="text-xs font-mono text-red-400">${stock.high52w.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Current</span>
              <span className="text-xs font-mono text-white font-bold">${stock.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">52W Low</span>
              <span className="text-xs font-mono text-emerald-400">${stock.low52w.toFixed(2)}</span>
            </div>
            <div className="mt-3 space-y-1">
              {stock.resistanceLevels?.map((level, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-red-400">Resistance {i + 1}</span>
                  <span className="text-xs font-mono text-red-400">${level.toFixed(2)}</span>
                </div>
              ))}
              {stock.supportLevels?.map((level, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400">Support {i + 1}</span>
                  <span className="text-xs font-mono text-emerald-400">${level.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
