'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

const SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'Consumer Discretionary',
  'Energy', 'Industrials', 'Materials', 'Real Estate', 'Utilities',
];

const PATTERNS = [
  'Breakout', 'Bull Flag', 'Cup & Handle', 'EMA Crossover',
  'Ascending Triangle', 'Momentum Squeeze', 'Consolidation',
];

const TRENDS = ['Strong Bullish', 'Bullish', 'Neutral', 'Bearish', 'Strong Bearish'];

export default function FilterPanel() {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const filteredCount = useStore((s) => s.filteredStocks.length);
  const totalCount = useStore((s) => s.stocks.length);

  const [expanded, setExpanded] = useState({
    sector: true,
    scores: true,
    technical: false,
    price: false,
  });

  const toggleSection = (key: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleArrayFilter = (arr: string[], value: string, key: 'sectors' | 'patterns' | 'trend') => {
    const updated = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    setFilters({ [key]: updated });
  };

  const hasActiveFilters =
    filters.sectors.length > 0 ||
    filters.patterns.length > 0 ||
    filters.trend.length > 0 ||
    filters.minAiScore > 0 ||
    filters.minRelativeVolume > 0 ||
    filters.minRsi > 0 ||
    filters.maxRsi < 100;

  return (
    <div className="w-48 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-800">
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-emerald-400" />
          <span className="text-xs font-semibold text-gray-300">FILTERS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{filteredCount}/{totalCount}</span>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-red-400 hover:text-red-300">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Sector */}
      <FilterSection
        title="Sector"
        expanded={expanded.sector}
        onToggle={() => toggleSection('sector')}
      >
        <div className="space-y-0.5">
          {SECTORS.map((sector) => (
            <label key={sector} className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-gray-800 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 accent-emerald-500"
                checked={filters.sectors.includes(sector)}
                onChange={() => toggleArrayFilter(filters.sectors, sector, 'sectors')}
              />
              <span className="text-xs text-gray-400">{sector}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* AI Score */}
      <FilterSection
        title="Min AI Score"
        expanded={expanded.scores}
        onToggle={() => toggleSection('scores')}
      >
        <div className="space-y-2">
          {[0, 50, 60, 70, 80, 90].map((val) => (
            <label key={val} className="flex items-center gap-2 px-1 cursor-pointer">
              <input
                type="radio"
                name="minAiScore"
                className="accent-emerald-500"
                checked={filters.minAiScore === val}
                onChange={() => setFilters({ minAiScore: val })}
              />
              <span className="text-xs text-gray-400">{val === 0 ? 'Any' : `${val}+`}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Technical */}
      <FilterSection
        title="Pattern"
        expanded={expanded.technical}
        onToggle={() => toggleSection('technical')}
      >
        <div className="space-y-0.5">
          {PATTERNS.map((pattern) => (
            <label key={pattern} className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-gray-800 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 accent-emerald-500"
                checked={filters.patterns.includes(pattern)}
                onChange={() => toggleArrayFilter(filters.patterns, pattern, 'patterns')}
              />
              <span className="text-xs text-gray-400">{pattern}</span>
            </label>
          ))}
        </div>
        <div className="mt-3 space-y-0.5">
          <p className="text-xs text-gray-600 font-semibold uppercase px-1 mb-1">Trend</p>
          {TRENDS.map((trend) => (
            <label key={trend} className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-gray-800 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 accent-emerald-500"
                checked={filters.trend.includes(trend)}
                onChange={() => toggleArrayFilter(filters.trend, trend, 'trend')}
              />
              <span className="text-xs text-gray-400">{trend}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Relative Volume */}
      <FilterSection
        title="Min Rel. Volume"
        expanded={expanded.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-2">
          {[0, 1, 1.5, 2, 2.5, 3].map((val) => (
            <label key={val} className="flex items-center gap-2 px-1 cursor-pointer">
              <input
                type="radio"
                name="minRelVol"
                className="accent-emerald-500"
                checked={filters.minRelativeVolume === val}
                onChange={() => setFilters({ minRelativeVolume: val })}
              />
              <span className="text-xs text-gray-400">{val === 0 ? 'Any' : `${val}x+`}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-800">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-200 transition-colors uppercase tracking-wider"
      >
        {title}
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {expanded && <div className="px-2 pb-3">{children}</div>}
    </div>
  );
}
