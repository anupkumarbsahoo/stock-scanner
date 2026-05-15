'use client';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getScoreStyle(score: number): { text: string; bg: string; border: string } {
  if (score >= 85) return { text: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50' };
  if (score >= 70) return { text: 'text-green-300', bg: 'bg-green-500/20', border: 'border-green-500/50' };
  if (score >= 55) return { text: 'text-yellow-300', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' };
  if (score >= 40) return { text: 'text-orange-300', bg: 'bg-orange-500/20', border: 'border-orange-500/50' };
  return { text: 'text-red-300', bg: 'bg-red-500/20', border: 'border-red-500/50' };
}

export function ScoreBadge({ score, size = 'md', showLabel = false }: ScoreBadgeProps) {
  const { text, bg, border } = getScoreStyle(score);
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${bg} ${text} border ${border} rounded font-mono font-bold ${sizeClasses[size]}`}>
      {score}
      {showLabel && <span className="text-xs opacity-70">/100</span>}
    </span>
  );
}

interface ScoreBarProps {
  score: number;
  label?: string;
  className?: string;
}

export function ScoreBar({ score, label, className = '' }: ScoreBarProps) {
  const { text, bg } = getScoreStyle(score);
  const barBg = bg.replace('/20', '');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-xs text-gray-500 w-20 flex-shrink-0">{label}</span>}
      <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barBg.replace('bg-', 'bg-').replace('/20', '')}`}
          style={{ width: `${score}%`, backgroundColor: getBarColor(score) }}
        />
      </div>
      <span className={`text-xs font-mono font-bold ${text} w-8 text-right`}>{score}</span>
    </div>
  );
}

function getBarColor(score: number): string {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#22c55e';
  if (score >= 55) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

interface TrendBadgeProps {
  trend: string;
}

export function TrendBadge({ trend }: TrendBadgeProps) {
  const styleMap: Record<string, string> = {
    'Strong Bullish': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    'Bullish': 'bg-green-500/20 text-green-400 border-green-500/40',
    'Neutral': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    'Bearish': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    'Strong Bearish': 'bg-red-500/20 text-red-400 border-red-500/40',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${styleMap[trend] || styleMap['Neutral']}`}>
      {trend}
    </span>
  );
}

interface SentimentBadgeProps {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const styleMap = {
    Bullish: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    Bearish: 'bg-red-500/20 text-red-400 border-red-500/40',
    Neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${styleMap[sentiment]}`}>
      {sentiment}
    </span>
  );
}
