'use client';

import { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, ExternalLink, TrendingUp } from 'lucide-react';
import { NewsItem } from '@/types';
import { SentimentBadge } from '@/components/ui/ScoreBadge';
import { formatDate, formatTime } from '@/lib/utils/formatters';
import { generateMockNews } from '@/lib/api/mockData';

const TICKERS = ['NVDA', 'MU', 'PLTR', 'META', 'SMCI', 'AMD', 'GOOGL', 'MSFT'];

export default function NewsPage() {
  const [news, setNews] = useState<(NewsItem & { ticker: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');

  useEffect(() => {
    const allNews: (NewsItem & { ticker: string })[] = [];
    for (const ticker of TICKERS) {
      const tickerNews = generateMockNews(ticker).map((n) => ({ ...n, ticker }));
      allNews.push(...tickerNews);
    }
    // Sort by datetime descending
    allNews.sort((a, b) => b.datetime - a.datetime);
    setNews(allNews);
  }, []);

  const filteredNews = news.filter((item) => {
    if (selectedTicker !== 'ALL' && item.ticker !== selectedTicker) return false;
    if (selectedSentiment !== 'ALL' && item.sentiment !== selectedSentiment) return false;
    return true;
  });

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper size={18} className="text-yellow-400" />
          <h1 className="text-lg font-bold text-white">AI News Terminal</h1>
        </div>
        <button
          onClick={() => {}}
          className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-3 py-1.5 rounded"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Ticker:</span>
          {['ALL', ...TICKERS].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTicker(t)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                selectedTicker === t
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'text-gray-500 border-gray-700 hover:border-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Sentiment:</span>
          {['ALL', 'Bullish', 'Bearish', 'Neutral'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSentiment(s)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                selectedSentiment === s
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : 'text-gray-500 border-gray-700 hover:border-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* News grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 p-4 transition-colors"
          >
            <div className="flex items-start gap-2 mb-2">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                item.ticker === 'NVDA' ? 'bg-green-500/20 text-green-400' :
                item.ticker === 'MU' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-700 text-gray-400'
              }`}>
                {item.ticker.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-white">{item.ticker}</span>
                  <SentimentBadge sentiment={item.sentiment} />
                  <span className="text-xs text-gray-600">{item.source}</span>
                  <span className="text-xs text-gray-700 ml-auto flex-shrink-0">{formatDate(item.datetime)}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-200 mb-1 line-clamp-2">{item.headline}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{item.summary}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Impact:</span>
                <div className="w-20 bg-gray-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${item.impactScore >= 70 ? 'bg-emerald-500' : item.impactScore >= 40 ? 'bg-yellow-500' : 'bg-gray-600'}`}
                    style={{ width: `${item.impactScore}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500">{item.impactScore}/100</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{formatTime(item.datetime)}</span>
                {item.url && item.url !== '#' && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
