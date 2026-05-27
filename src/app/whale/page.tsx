'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Waves, TrendingUp, AlertTriangle, RefreshCw, ChevronUp, ChevronDown,
  Building2, Zap, ShieldAlert, Target, BarChart3, Eye, DollarSign,
} from 'lucide-react';
import { Stock } from '@/types';

// ─── Badge helpers ────────────────────────────────────────────────────────────

function AccumulationBadge({ label }: { label: string }) {
  const map: Record<string, string> = {
    'Whale Accumulation':    'bg-purple-500/20 text-purple-300 border-purple-500/40',
    'Stealth Accumulation':  'bg-blue-500/20 text-blue-300 border-blue-500/40',
    'Retail Momentum':       'bg-green-500/20 text-green-300 border-green-500/40',
    'Distribution Detected': 'bg-red-500/20 text-red-300 border-red-500/40',
    'Neutral':               'bg-gray-700/40 text-gray-400 border-gray-600/40',
  };
  const icons: Record<string, string> = {
    'Whale Accumulation':    '🐋',
    'Stealth Accumulation':  '🕵️',
    'Retail Momentum':       '🚀',
    'Distribution Detected': '🔴',
    'Neutral':               '⚪',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${map[label] ?? map['Neutral']}`}>
      <span>{icons[label] ?? '⚪'}</span>
      {label}
    </span>
  );
}

function RecoBadge({ label }: { label: string }) {
  const map: Record<string, string> = {
    'Buy Now':         'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    'Buy on Pullback': 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    'Watchlist':       'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    'Risky Momentum':  'bg-orange-500/20 text-orange-300 border-orange-500/40',
    'Avoid':           'bg-red-500/20 text-red-300 border-red-500/40',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${map[label] ?? map['Watchlist']}`}>
      {label}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    'Low':       'text-green-400',
    'Medium':    'text-yellow-400',
    'High':      'text-orange-400',
    'Very High': 'text-red-400',
  };
  return <span className={`text-xs font-semibold ${map[level] ?? 'text-gray-400'}`}>{level}</span>;
}

function ScoreBar({ value, color = 'purple' }: { value: number; color?: string }) {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-500',
    blue:   'bg-blue-500',
    emerald:'bg-emerald-500',
    orange: 'bg-orange-500',
  };
  const bgMap: Record<string, string> = {
    purple: 'bg-purple-900/30',
    blue:   'bg-blue-900/30',
    emerald:'bg-emerald-900/30',
    orange: 'bg-orange-900/30',
  };
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className={`flex-1 h-1.5 rounded-full ${bgMap[color] ?? bgMap.purple} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${colorMap[color] ?? colorMap.purple} transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="text-xs font-bold text-white tabular-nums w-6 text-right">{value}</span>
    </div>
  );
}

// ─── Mini top-card stock row ──────────────────────────────────────────────────

function TopStockRow({ stock, rank, scoreField, color }: {
  stock: Stock;
  rank: number;
  scoreField: 'whaleScore' | 'growthScore' | 'relativeVolume';
  color: string;
}) {
  const val = scoreField === 'relativeVolume'
    ? parseFloat((stock.relativeVolume ?? 0).toFixed(2))
    : (stock[scoreField] as number) ?? 0;
  const displayVal = scoreField === 'relativeVolume' ? `${val}×` : `${val}`;

  return (
    <Link href={`/stock/${stock.ticker}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-800/60 transition-colors group">
      <span className="text-xs text-gray-600 w-4 shrink-0">{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{stock.ticker}</span>
          <span className={`text-xs font-semibold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{stock.company}</p>
      </div>
      <ScoreBar value={scoreField === 'relativeVolume' ? Math.min(100, val * 30) : val} color={color} />
      <span className={`text-xs font-bold tabular-nums shrink-0 ${color === 'purple' ? 'text-purple-400' : color === 'emerald' ? 'text-emerald-400' : 'text-orange-400'}`}>
        {displayVal}
      </span>
    </Link>
  );
}

type SortKey = 'whaleScore' | 'growthScore' | 'aiScore' | 'relativeVolume' | 'changePercent' | 'price';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WhalePage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Filters
  const [minWhaleScore, setMinWhaleScore] = useState(40);
  const [minGrowthScore, setMinGrowthScore] = useState(0);
  const [accFilter, setAccFilter] = useState('All');
  const [recoFilter, setRecoFilter] = useState('All');
  const [sectorFilter, setSectorFilter] = useState('All');

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('whaleScore');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scanner');
      if (res.ok) {
        const { stocks: data } = await res.json();
        setStocks(data);
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStocks(); }, []);

  // Derived lists
  const sectors = useMemo(() => ['All', ...Array.from(new Set(stocks.map((s) => s.sector))).sort()], [stocks]);

  const whaleStocks = useMemo(() => stocks.filter((s) => (s.whaleScore ?? 0) >= 60), [stocks]);

  const filtered = useMemo(() => {
    let result = stocks.filter((s) => {
      if ((s.whaleScore ?? 0) < minWhaleScore) return false;
      if ((s.growthScore ?? 0) < minGrowthScore) return false;
      if (accFilter !== 'All' && s.accumulationLabel !== accFilter) return false;
      if (recoFilter !== 'All' && s.recommendation !== recoFilter) return false;
      if (sectorFilter !== 'All' && s.sector !== sectorFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      const av = (a[sortKey] as number) ?? 0;
      const bv = (b[sortKey] as number) ?? 0;
      return sortDir === 'desc' ? bv - av : av - bv;
    });

    return result;
  }, [stocks, minWhaleScore, minGrowthScore, accFilter, recoFilter, sectorFilter, sortKey, sortDir]);

  const topWhale    = useMemo(() => [...whaleStocks].sort((a, b) => (b.whaleScore ?? 0) - (a.whaleScore ?? 0)).slice(0, 6), [whaleStocks]);
  const topGrowth   = useMemo(() => [...stocks].filter(s => (s.growthScore ?? 0) >= 65 && (s.trend === 'Bullish' || s.trend === 'Strong Bullish')).sort((a, b) => (b.growthScore ?? 0) - (a.growthScore ?? 0)).slice(0, 6), [stocks]);
  const topVolume   = useMemo(() => [...stocks].sort((a, b) => b.relativeVolume - a.relativeVolume).slice(0, 6), [stocks]);

  const avgWhaleScore = whaleStocks.length > 0
    ? Math.round(whaleStocks.reduce((s, x) => s + (x.whaleScore ?? 0), 0) / whaleStocks.length)
    : 0;

  const topSector = useMemo(() => {
    const counts: Record<string, number> = {};
    whaleStocks.forEach((s) => { counts[s.sector] = (counts[s.sector] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';
  }, [whaleStocks]);

  const buyNowCount = stocks.filter((s) => s.recommendation === 'Buy Now').length;

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortIcon({ field }: { field: SortKey }) {
    if (sortKey !== field) return <ChevronDown size={12} className="text-gray-600" />;
    return sortDir === 'desc' ? <ChevronDown size={12} className="text-purple-400" /> : <ChevronUp size={12} className="text-purple-400" />;
  }

  const fmt = (n: number) => n >= 1e12 ? `$${(n / 1e12).toFixed(1)}T` : n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : `$${(n / 1e6).toFixed(0)}M`;

  return (
    <div className="flex flex-col h-full overflow-auto bg-gray-950">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Waves className="text-purple-400" size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">WHALE MONEY INTELLIGENCE</h1>
            <p className="text-xs text-gray-500">Institutional accumulation · Smart money flow · Growth prediction</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-gray-600">Updated: {lastUpdated}</span>}
          <button
            onClick={fetchStocks}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/40 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* ── Summary Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Whale Activity Stocks',
              value: loading ? '...' : whaleStocks.length,
              sub: 'WhaleScore ≥ 60',
              icon: <Waves size={16} className="text-purple-400" />,
              accent: 'purple',
            },
            {
              label: 'Avg Whale Score',
              value: loading ? '...' : avgWhaleScore,
              sub: 'Among whale stocks',
              icon: <BarChart3 size={16} className="text-blue-400" />,
              accent: 'blue',
            },
            {
              label: 'Top Whale Sector',
              value: loading ? '...' : topSector,
              sub: 'Most institutional activity',
              icon: <Building2 size={16} className="text-emerald-400" />,
              accent: 'emerald',
            },
            {
              label: 'Buy Now Signals',
              value: loading ? '...' : buyNowCount,
              sub: 'High conviction entries',
              icon: <Zap size={16} className="text-yellow-400" />,
              accent: 'yellow',
            },
          ].map(({ label, value, sub, icon, accent }) => (
            <div key={label} className={`bg-gray-900 border border-gray-800 rounded-xl p-4 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5 ${
                accent === 'purple' ? 'bg-purple-500' :
                accent === 'blue' ? 'bg-blue-500' :
                accent === 'emerald' ? 'bg-emerald-500' : 'bg-yellow-500'
              }`} />
              <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs text-gray-500 font-medium">{label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-600 mt-1">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Three Highlight Columns ────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Top Whale Stocks */}
          <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Waves size={15} className="text-purple-400" />
              <h3 className="text-sm font-bold text-purple-400">Top Whale Stocks</h3>
            </div>
            <div className="space-y-1">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-11 bg-gray-800/50 rounded-lg animate-pulse" />
                  ))
                : topWhale.map((s, i) => (
                    <TopStockRow key={s.ticker} stock={s} rank={i + 1} scoreField="whaleScore" color="purple" />
                  ))}
            </div>
          </div>

          {/* Top Growth Stocks */}
          <div className="bg-gray-900 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-400">Growth Momentum</h3>
            </div>
            <div className="space-y-1">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-11 bg-gray-800/50 rounded-lg animate-pulse" />
                  ))
                : topGrowth.map((s, i) => (
                    <TopStockRow key={s.ticker} stock={s} rank={i + 1} scoreField="growthScore" color="emerald" />
                  ))}
            </div>
          </div>

          {/* Unusual Volume */}
          <div className="bg-gray-900 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={15} className="text-orange-400" />
              <h3 className="text-sm font-bold text-orange-400">Unusual Volume Spikes</h3>
            </div>
            <div className="space-y-1">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-11 bg-gray-800/50 rounded-lg animate-pulse" />
                  ))
                : topVolume.map((s, i) => (
                    <TopStockRow key={s.ticker} stock={s} rank={i + 1} scoreField="relativeVolume" color="orange" />
                  ))}
            </div>
          </div>
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-48">
              <label className="text-xs text-gray-500 block mb-1">Min Whale Score: <span className="text-purple-400 font-bold">{minWhaleScore}</span></label>
              <input
                type="range" min={0} max={100} value={minWhaleScore}
                onChange={(e) => setMinWhaleScore(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
            <div className="min-w-48">
              <label className="text-xs text-gray-500 block mb-1">Min Growth Score: <span className="text-emerald-400 font-bold">{minGrowthScore}</span></label>
              <input
                type="range" min={0} max={100} value={minGrowthScore}
                onChange={(e) => setMinGrowthScore(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Accumulation</label>
              <select
                value={accFilter}
                onChange={(e) => setAccFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-purple-500"
              >
                {['All', 'Whale Accumulation', 'Stealth Accumulation', 'Retail Momentum', 'Distribution Detected', 'Neutral'].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Recommendation</label>
              <select
                value={recoFilter}
                onChange={(e) => setRecoFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-purple-500"
              >
                {['All', 'Buy Now', 'Buy on Pullback', 'Watchlist', 'Risky Momentum', 'Avoid'].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Sector</label>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-purple-500"
              >
                {sectors.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="ml-auto text-xs text-gray-500">
              Showing <span className="text-white font-bold">{filtered.length}</span> of {stocks.length} stocks
            </div>
          </div>
        </div>

        {/* ── Main Table ─────────────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80">
                  <th className="text-left px-3 py-2.5 text-gray-500 font-medium w-8">#</th>
                  <th className="text-left px-3 py-2.5 text-gray-500 font-medium min-w-32">Ticker</th>
                  <th className="text-right px-3 py-2.5 text-gray-500 font-medium cursor-pointer hover:text-gray-300" onClick={() => handleSort('price')}>
                    <span className="flex items-center justify-end gap-1">Price <SortIcon field="price" /></span>
                  </th>
                  <th className="text-right px-3 py-2.5 text-gray-500 font-medium cursor-pointer hover:text-gray-300" onClick={() => handleSort('changePercent')}>
                    <span className="flex items-center justify-end gap-1">Chg% <SortIcon field="changePercent" /></span>
                  </th>
                  <th className="px-3 py-2.5 text-gray-500 font-medium cursor-pointer hover:text-gray-300 min-w-36" onClick={() => handleSort('whaleScore')}>
                    <span className="flex items-center gap-1 text-purple-400">Whale Score <SortIcon field="whaleScore" /></span>
                  </th>
                  <th className="px-3 py-2.5 text-gray-500 font-medium cursor-pointer hover:text-gray-300 min-w-36" onClick={() => handleSort('growthScore')}>
                    <span className="flex items-center gap-1 text-emerald-400">Growth Score <SortIcon field="growthScore" /></span>
                  </th>
                  <th className="px-3 py-2.5 text-gray-500 font-medium cursor-pointer hover:text-gray-300 min-w-36" onClick={() => handleSort('aiScore')}>
                    <span className="flex items-center gap-1">AI Score <SortIcon field="aiScore" /></span>
                  </th>
                  <th className="px-3 py-2.5 text-gray-500 font-medium min-w-44">Accumulation</th>
                  <th className="px-3 py-2.5 text-gray-500 font-medium min-w-36">Recommendation</th>
                  <th className="px-3 py-2.5 text-gray-500 font-medium">Risk</th>
                  <th className="text-right px-3 py-2.5 text-gray-500 font-medium cursor-pointer hover:text-gray-300" onClick={() => handleSort('relativeVolume')}>
                    <span className="flex items-center justify-end gap-1">RVOL <SortIcon field="relativeVolume" /></span>
                  </th>
                  <th className="text-right px-3 py-2.5 text-gray-500 font-medium">Entry Zone</th>
                  <th className="text-right px-3 py-2.5 text-gray-500 font-medium">Stop Loss</th>
                  <th className="text-right px-3 py-2.5 text-gray-500 font-medium">R/R</th>
                  <th className="px-3 py-2.5 text-gray-500 font-medium">Sector</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 15 }).map((__, j) => (
                          <td key={j} className="px-3 py-3">
                            <div className="h-4 bg-gray-800 rounded w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : filtered.map((stock, idx) => {
                      const ws = stock.whaleScore ?? 0;
                      const gs = stock.growthScore ?? 0;
                      const aiS = stock.aiScore;
                      return (
                        <tr
                          key={stock.ticker}
                          className={`hover:bg-gray-800/40 transition-colors ${
                            stock.recommendation === 'Buy Now' ? 'border-l-2 border-l-emerald-500' :
                            stock.accumulationLabel === 'Whale Accumulation' ? 'border-l-2 border-l-purple-500' : ''
                          }`}
                        >
                          <td className="px-3 py-2.5 text-gray-600">{idx + 1}</td>
                          <td className="px-3 py-2.5">
                            <div>
                              <Link href={`/stock/${stock.ticker}`} className="font-bold text-white hover:text-purple-400 transition-colors">
                                {stock.ticker}
                              </Link>
                              <div className="text-gray-600 truncate max-w-28">{stock.company}</div>
                            </div>
                          </td>
                          <td className={`px-3 py-2.5 text-right font-mono ${stock.isLivePrice ? 'text-white' : 'text-orange-400'}`}>
                            ${stock.price.toFixed(2)}
                          </td>
                          <td className={`px-3 py-2.5 text-right font-semibold ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                          </td>
                          {/* Whale Score */}
                          <td className="px-3 py-2.5 min-w-36">
                            <ScoreBar value={ws} color={ws >= 70 ? 'purple' : ws >= 50 ? 'blue' : 'orange'} />
                          </td>
                          {/* Growth Score */}
                          <td className="px-3 py-2.5 min-w-36">
                            <ScoreBar value={gs} color="emerald" />
                          </td>
                          {/* AI Score */}
                          <td className="px-3 py-2.5 min-w-36">
                            <ScoreBar value={aiS} color={aiS >= 80 ? 'emerald' : aiS >= 60 ? 'blue' : 'orange'} />
                          </td>
                          <td className="px-3 py-2.5">
                            <AccumulationBadge label={stock.accumulationLabel ?? 'Neutral'} />
                          </td>
                          <td className="px-3 py-2.5">
                            <RecoBadge label={stock.recommendation ?? 'Watchlist'} />
                          </td>
                          <td className="px-3 py-2.5">
                            <RiskBadge level={stock.riskLevel ?? 'Medium'} />
                          </td>
                          <td className={`px-3 py-2.5 text-right font-semibold ${stock.relativeVolume >= 2 ? 'text-orange-400' : stock.relativeVolume >= 1.5 ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {stock.relativeVolume?.toFixed(2)}×
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-400 font-mono whitespace-nowrap">
                            {stock.entryLow != null && stock.entryHigh != null
                              ? `$${stock.entryLow.toFixed(2)}–$${stock.entryHigh.toFixed(2)}`
                              : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-right text-red-400 font-mono">
                            {stock.stopLoss != null ? `$${stock.stopLoss.toFixed(2)}` : '—'}
                          </td>
                          <td className={`px-3 py-2.5 text-right font-bold ${
                            (stock.riskReward ?? 0) >= 3 ? 'text-emerald-400' :
                            (stock.riskReward ?? 0) >= 2 ? 'text-yellow-400' : 'text-gray-500'
                          }`}>
                            {stock.riskReward != null ? `${stock.riskReward}:1` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{stock.sector}</td>
                          <td className="px-3 py-2.5">
                            <Link
                              href={`/stock/${stock.ticker}`}
                              className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-700 text-gray-600 hover:text-purple-400 transition-colors"
                            >
                              <Eye size={12} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                <Waves size={32} className="mb-3 text-gray-700" />
                <p className="font-semibold">No stocks match your filters</p>
                <p className="text-xs mt-1">Try lowering the minimum whale or growth score</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Disclaimer ─────────────────────────────────────────────────── */}
        <div className="flex items-start gap-2 p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
          <ShieldAlert size={14} className="text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-600">
            <span className="text-yellow-500 font-semibold">Risk Disclaimer:</span> Whale scores and recommendations are
            algorithmic signals based on price/volume patterns, not actual dark-pool or options order-flow data. They do
            not constitute financial advice. Always do your own research and manage position sizing appropriately.
            Past performance of any signal does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  );
}
