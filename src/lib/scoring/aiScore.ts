import { Stock } from '@/types';

interface ScoreFactors {
  technicalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
  institutionalScore: number;
  relativeStrengthScore: number;
  earningsMomentumScore: number;
  volumeScore: number;
  optionsFlowScore: number;
}

const WEIGHTS = {
  technicalScore: 0.25,
  fundamentalScore: 0.20,
  sentimentScore: 0.15,
  earningsMomentumScore: 0.15,
  institutionalScore: 0.10,
  optionsFlowScore: 0.10,
  relativeStrengthScore: 0.03,
  volumeScore: 0.02,
};

export function calcTechnicalScore(params: {
  rsi: number;
  macd: number;
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  price: number;
  vwap: number;
  relativeVolume: number;
  atr: number;
  pattern: string;
}): number {
  let score = 0;

  // RSI (ideal zone 50-70)
  if (params.rsi >= 50 && params.rsi <= 70) score += 25;
  else if (params.rsi > 70 && params.rsi <= 80) score += 15;
  else if (params.rsi >= 40 && params.rsi < 50) score += 10;
  else score += 0;

  // EMA alignment
  if (params.ema9 > params.ema21 && params.ema21 > params.ema50 && params.ema50 > params.ema200) {
    score += 30;
  } else if (params.ema9 > params.ema21 && params.ema21 > params.ema50) {
    score += 20;
  } else if (params.ema9 > params.ema21) {
    score += 10;
  }

  // MACD bullish
  if (params.macd > 0) score += 15;
  else score += 5;

  // Price above VWAP
  if (params.vwap > 0 && params.price > params.vwap) score += 10;

  // Relative volume
  if (params.relativeVolume >= 2.0) score += 15;
  else if (params.relativeVolume >= 1.5) score += 10;
  else if (params.relativeVolume >= 1.0) score += 5;

  // Pattern bonus
  const patternBonus: Record<string, number> = {
    Breakout: 5,
    'Bull Flag': 4,
    'Cup & Handle': 4,
    'EMA Crossover': 3,
    'Ascending Triangle': 3,
    'Momentum Squeeze': 2,
  };
  score += patternBonus[params.pattern] || 0;

  return Math.min(100, score);
}

export function calcFundamentalScore(params: {
  revenueGrowth: number;
  epsGrowth: number;
  pe: number;
  institutionalOwnership: number;
  insiderBuying: string;
  analystRating: string;
}): number {
  let score = 0;

  // Revenue growth
  if (params.revenueGrowth >= 30) score += 25;
  else if (params.revenueGrowth >= 15) score += 18;
  else if (params.revenueGrowth >= 5) score += 10;
  else score += 0;

  // EPS growth
  if (params.epsGrowth >= 50) score += 25;
  else if (params.epsGrowth >= 25) score += 18;
  else if (params.epsGrowth >= 10) score += 10;
  else score += 0;

  // PE ratio (reasonable valuation)
  if (params.pe > 0 && params.pe <= 25) score += 20;
  else if (params.pe > 25 && params.pe <= 40) score += 12;
  else if (params.pe > 40 && params.pe <= 60) score += 6;
  else score += 0;

  // Institutional ownership
  if (params.institutionalOwnership >= 70) score += 15;
  else if (params.institutionalOwnership >= 50) score += 10;
  else if (params.institutionalOwnership >= 30) score += 5;

  // Insider buying
  if (params.insiderBuying === 'Positive') score += 10;
  else if (params.insiderBuying === 'Neutral') score += 5;

  // Analyst rating
  if (params.analystRating === 'Strong Buy') score += 5;
  else if (params.analystRating === 'Buy') score += 3;

  return Math.min(100, score);
}

export function calcFinalAIScore(factors: ScoreFactors): number {
  let score = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    score += (factors[key as keyof ScoreFactors] || 0) * weight;
  }
  return Math.round(Math.min(100, Math.max(0, score)));
}

export function calcBuyProbability(aiScore: number, trend: string): number {
  let base = aiScore;
  if (trend === 'Strong Bullish') base = Math.min(99, base + 5);
  else if (trend === 'Bearish') base = Math.max(1, base - 10);
  else if (trend === 'Strong Bearish') base = Math.max(1, base - 20);
  return Math.round(base);
}

export function getTrend(ema9: number, ema21: number, ema50: number, ema200: number): Stock['trend'] {
  if (ema9 > ema21 && ema21 > ema50 && ema50 > ema200) return 'Strong Bullish';
  if (ema9 > ema21 && ema21 > ema50) return 'Bullish';
  if (ema9 < ema21 && ema21 < ema50 && ema50 < ema200) return 'Strong Bearish';
  if (ema9 < ema21 && ema21 < ema50) return 'Bearish';
  return 'Neutral';
}
