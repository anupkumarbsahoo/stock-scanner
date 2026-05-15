'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StockDetail } from '@/types';
import { useStore } from '@/store/useStore';
import TradingChart from '@/components/charts/TradingChart';
import TechnicalAnalysis from '@/components/stock/TechnicalAnalysis';
import FundamentalAnalysis from '@/components/stock/FundamentalAnalysis';
import NewsIntelligence from '@/components/stock/NewsIntelligence';
import SmartMoneyFlow from '@/components/stock/SmartMoneyFlow';
import AIExplanationCard from '@/components/stock/AIExplanationCard';
import { ScoreBadge, TrendBadge } from '@/components/ui/ScoreBadge';
import { ScoreBar } from '@/components/ui/ScoreBadge';
import { formatCurrency, formatVolume, formatRelativeVolume, formatPercent, getChangeColor } from '@/lib/utils/formatters';
import { ArrowLeft, Star, StarOff, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

export default function StockDetailPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const router = useRouter();
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'fundamental' | 'news' | 'smartmoney'>('overview');

  const addToWatchlist = useStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);
  const isInWatchlist = useStore((s) => s.isInWatchlist);
  const inWatchlist = isInWatchlist(ticker);

  useEffect(() => {
    const fetchStock = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stock/${ticker}`);
        if (!res.ok) throw new Error('Failed to fetch stock data');
        const data = await res.json();
        setStock(data);
      } catch (err) {
        setError('Failed to load stock data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (ticker) fetchStock();
  }, [ticker]);

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'technical', label: 'Technical' },
    { id: 'fundamental', label: 'Fundamental' },
    { id: 'news', label: 'News' },
    { id: 'smartmoney', label: 'Smart Money' },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading {ticker}...</p>
        </div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Stock not found'}</p>
          <button onClick={() => router.back()} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2">
            <ArrowLeft size={16} /> Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-950 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-300">
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{stock.ticker}</h1>
              <span className={`text-2xl font-bold font-mono ${getChangeColor(stock.changePercent)}`}>
                ${stock.price.toFixed(2)}
              </span>
              <span className={`flex items-center gap-1 text-sm font-mono ${getChangeColor(stock.changePercent)}`}>
                {stock.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {formatPercent(stock.changePercent)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{stock.company} · {stock.sector}</p>
          </div>

          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <TrendBadge trend={stock.trend} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">AI Score</span>
              <ScoreBadge score={stock.aiScore} size="lg" showLabel />
            </div>
            <button
              onClick={() => inWatchlist ? removeFromWatchlist(stock.ticker) : addToWatchlist(stock.ticker)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors ${
                inWatchlist
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-yellow-500/40'
              }`}
            >
              {inWatchlist ? <Star size={12} className="fill-yellow-400" /> : <StarOff size={12} />}
              {inWatchlist ? 'Watching' : 'Watch'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Market Cap', value: formatCurrency(stock.marketCap) },
                { label: 'Volume', value: formatVolume(stock.volume) },
                { label: 'Rel. Volume', value: formatRelativeVolume(stock.relativeVolume) },
                { label: 'Buy Probability', value: `${stock.buyProbability}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-900 rounded-lg border border-gray-800 p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-lg font-bold font-mono text-white mt-1">{value}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <TradingChart candles={stock.candles} ticker={stock.ticker} height={380} />

            {/* Score breakdown */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Score Breakdown</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ScoreBar score={stock.technicalScore} label="Technical" />
                <ScoreBar score={stock.fundamentalScore} label="Fundamental" />
                <ScoreBar score={stock.sentimentScore} label="Sentiment" />
                <ScoreBar score={stock.institutionalScore} label="Institutional" />
                <ScoreBar score={stock.momentumScore} label="Momentum" />
                <ScoreBar score={stock.optionsFlowScore} label="Options Flow" />
              </div>
            </div>

            {/* AI Explanation */}
            <AIExplanationCard stock={stock} />
          </>
        )}

        {/* Technical Tab */}
        {activeTab === 'technical' && (
          <>
            <TradingChart candles={stock.candles} ticker={stock.ticker} height={380} />
            <TechnicalAnalysis stock={stock} />
          </>
        )}

        {/* Fundamental Tab */}
        {activeTab === 'fundamental' && <FundamentalAnalysis stock={stock} />}

        {/* News Tab */}
        {activeTab === 'news' && (
          <>
            <AIExplanationCard stock={stock} />
            <NewsIntelligence news={stock.news} ticker={stock.ticker} />
          </>
        )}

        {/* Smart Money Tab */}
        {activeTab === 'smartmoney' && <SmartMoneyFlow data={stock.smartMoney} />}
      </div>
    </div>
  );
}
