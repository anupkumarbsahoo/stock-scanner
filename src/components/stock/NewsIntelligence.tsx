'use client';

import { NewsItem } from '@/types';
import { SentimentBadge } from '@/components/ui/ScoreBadge';
import { formatDate, formatTime } from '@/lib/utils/formatters';
import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsIntelligenceProps {
  news: NewsItem[];
  ticker: string;
}

export default function NewsIntelligence({ news, ticker }: NewsIntelligenceProps) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
        <Newspaper size={16} className="text-yellow-400" />
        <h3 className="text-sm font-bold text-white">NEWS & CATALYSTS</h3>
        <span className="text-xs text-gray-500 ml-1">— {ticker}</span>
      </div>

      <div className="divide-y divide-gray-800/50">
        {news.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Newspaper className="mx-auto text-gray-700 mb-2" size={24} />
            <p className="text-xs text-gray-500">No recent news available</p>
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="px-4 py-3 hover:bg-gray-800/30 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <SentimentBadge sentiment={item.sentiment} />
                    <span className="text-xs text-gray-600">{item.source}</span>
                    <span className="text-xs text-gray-600 ml-auto flex-shrink-0">
                      {formatDate(item.datetime)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-200 mb-1 group-hover:text-white transition-colors">
                    {item.headline}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.summary}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">Impact:</span>
                      <div className="w-16 bg-gray-800 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${item.impactScore >= 60 ? 'bg-emerald-500' : item.impactScore >= 40 ? 'bg-yellow-500' : 'bg-gray-600'}`}
                          style={{ width: `${item.impactScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-500">{item.impactScore}</span>
                    </div>
                    {item.url && item.url !== '#' && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-0.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Read more <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
