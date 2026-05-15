'use client';

import { Stock } from '@/types';

interface SectorData {
  sector: string;
  avgChange: number;
  count: number;
}

interface SectorHeatmapProps {
  stocks: Stock[];
}

function getSectorColor(change: number): string {
  if (change >= 3) return 'bg-emerald-600 border-emerald-500';
  if (change >= 1.5) return 'bg-emerald-700 border-emerald-600';
  if (change >= 0.5) return 'bg-emerald-900 border-emerald-800';
  if (change >= 0) return 'bg-gray-700 border-gray-600';
  if (change >= -0.5) return 'bg-red-900 border-red-800';
  if (change >= -1.5) return 'bg-red-800 border-red-700';
  return 'bg-red-700 border-red-600';
}

export default function SectorHeatmap({ stocks }: SectorHeatmapProps) {
  const sectorMap = new Map<string, { total: number; count: number }>();

  for (const stock of stocks) {
    const existing = sectorMap.get(stock.sector) || { total: 0, count: 0 };
    sectorMap.set(stock.sector, {
      total: existing.total + stock.changePercent,
      count: existing.count + 1,
    });
  }

  const sectorData: SectorData[] = Array.from(sectorMap.entries()).map(([sector, { total, count }]) => ({
    sector,
    avgChange: total / count,
    count,
  }));

  sectorData.sort((a, b) => b.avgChange - a.avgChange);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
      {sectorData.map(({ sector, avgChange, count }) => (
        <div
          key={sector}
          className={`${getSectorColor(avgChange)} border rounded-lg p-2 text-center cursor-default transition-transform hover:scale-105`}
        >
          <p className="text-xs font-semibold text-white truncate">{sector}</p>
          <p className={`text-sm font-mono font-bold mt-0.5 ${avgChange >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
            {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{count} stocks</p>
        </div>
      ))}
    </div>
  );
}
