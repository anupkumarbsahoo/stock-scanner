'use client';

import { useState } from 'react';
import { Bot, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { StockDetail } from '@/types';

interface AIExplanationCardProps {
  stock: StockDetail;
}

export default function AIExplanationCard({ stock }: AIExplanationCardProps) {
  const [aiText, setAiText] = useState(stock.aiExplanation || '');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const bulletPoints = [
    stock.epsGrowth > 20 && 'Strong earnings growth',
    stock.revenueGrowth > 15 && 'Revenue acceleration',
    stock.institutionalOwnership > 60 && 'Institutional accumulation detected',
    stock.relativeVolume > 1.5 && `Relative volume ${stock.relativeVolume.toFixed(1)}x average`,
    stock.optionsFlowScore > 75 && 'Bullish options flow',
    stock.ema9 > stock.ema21 && 'EMA crossover confirmed',
    stock.rsi > 50 && stock.rsi < 70 && 'RSI in healthy momentum zone',
    stock.pattern !== 'Consolidation' && `${stock.pattern} pattern detected`,
    stock.insiderBuying === 'Positive' && 'Positive insider buying',
    stock.technicalScore > 80 && 'Strong technical setup',
  ].filter(Boolean) as string[];

  const fetchAIExplanation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: stock.ticker, stock }),
      });
      const data = await res.json();
      setAiText(data.explanation || 'No explanation available.');
    } catch {
      setAiText('AI explanation service unavailable. Please check your API key configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="text-emerald-400" size={16} />
          <h3 className="text-sm font-bold text-white">AI EXPLANATION ENGINE</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAIExplanation}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
            {loading ? 'Analyzing...' : 'Refresh AI'}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-gray-300">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4">
          {/* Bullish checklist */}
          {bulletPoints.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">
                WHY THIS STOCK IS {stock.aiScore >= 60 ? 'BULLISH' : 'NOTABLE'}
              </p>
              <div className="space-y-1">
                {bulletPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 text-xs mt-0.5">✓</span>
                    <span className="text-xs text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI narrative */}
          {aiText ? (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-300 leading-relaxed">{aiText}</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-center">
              <Bot className="mx-auto text-gray-600 mb-2" size={24} />
              <p className="text-xs text-gray-500">Click &quot;Refresh AI&quot; for Gemini-powered analysis</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
