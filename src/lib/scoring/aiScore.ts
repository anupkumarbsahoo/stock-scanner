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

// ─── Whale Money Detection ────────────────────────────────────────────────────

export function calcWhaleScore(params: {
  relativeVolume: number;
  institutionalScore: number;
  optionsFlowScore: number;
  trend: string;
  rsi: number;
  aiScore: number;
}): number {
  let score = 0;

  // Volume spike (25%) — primary whale signal
  if (params.relativeVolume >= 3.5) score += 25;
  else if (params.relativeVolume >= 2.5) score += 20;
  else if (params.relativeVolume >= 2.0) score += 15;
  else if (params.relativeVolume >= 1.5) score += 9;
  else if (params.relativeVolume >= 1.2) score += 4;

  // Institutional block trades proxy (20%)
  score += Math.min(20, (params.institutionalScore / 100) * 20);

  // Options flow activity (20%)
  score += Math.min(20, (params.optionsFlowScore / 100) * 20);

  // Price / trend strength (15%)
  if (params.trend === 'Strong Bullish') score += 15;
  else if (params.trend === 'Bullish') score += 10;
  else if (params.trend === 'Neutral') score += 5;

  // RSI in ideal accumulation zone (10%)
  if (params.rsi >= 55 && params.rsi <= 70) score += 10;
  else if (params.rsi >= 50 && params.rsi < 55) score += 6;
  else if (params.rsi > 70 && params.rsi <= 78) score += 4;

  // Overall AI quality confirmation (10%)
  score += Math.min(10, (params.aiScore / 100) * 10);

  return Math.round(Math.min(100, Math.max(0, score)));
}

// ─── Short-Term Growth Prediction ────────────────────────────────────────────

export function calcGrowthScore(params: {
  ema9: number;
  ema21: number;
  rsi: number;
  macd: number;
  relativeVolume: number;
  atr: number;
  price: number;
  trend: string;
  pattern: string;
}): number {
  let score = 0;

  // EMA 9 > EMA 21 crossover (15%)
  if (params.ema9 > params.ema21) score += 15;

  // RSI in sweet spot (20%)
  if (params.rsi >= 55 && params.rsi <= 70) score += 20;
  else if (params.rsi >= 50 && params.rsi < 55) score += 12;
  else if (params.rsi > 70 && params.rsi <= 78) score += 7;

  // MACD bullish (15%)
  if (params.macd > 0) score += 15;
  else score += 2;

  // Trend alignment (15%)
  if (params.trend === 'Strong Bullish') score += 15;
  else if (params.trend === 'Bullish') score += 10;
  else if (params.trend === 'Neutral') score += 5;

  // Volume confirmation (15%)
  if (params.relativeVolume >= 2.0) score += 15;
  else if (params.relativeVolume >= 1.5) score += 10;
  else if (params.relativeVolume >= 1.2) score += 5;

  // ATR expansion = volatility expansion for breakout (10%)
  const atrPct = params.price > 0 ? (params.atr / params.price) * 100 : 0;
  if (atrPct >= 4) score += 10;
  else if (atrPct >= 2.5) score += 7;
  else if (atrPct >= 1.5) score += 4;

  // Breakout pattern bonus (10%)
  const growthPatterns: Record<string, number> = {
    Breakout: 10,
    'Bull Flag': 8,
    'Cup & Handle': 8,
    'Momentum Squeeze': 7,
    'EMA Crossover': 5,
    'Ascending Triangle': 4,
  };
  score += growthPatterns[params.pattern] || 0;

  return Math.round(Math.min(100, Math.max(0, score)));
}

// ─── Accumulation Label ───────────────────────────────────────────────────────

export function getAccumulationLabel(params: {
  whaleScore: number;
  institutionalScore: number;
  relativeVolume: number;
  trend: string;
}): NonNullable<Stock['accumulationLabel']> {
  if (params.trend === 'Bearish' || params.trend === 'Strong Bearish') {
    return 'Distribution Detected';
  }
  if (params.whaleScore >= 70) return 'Whale Accumulation';
  // Quiet institutional buying — high inst score but not explosive volume
  if (params.institutionalScore >= 75 && params.relativeVolume < 1.6) {
    return 'Stealth Accumulation';
  }
  if (params.relativeVolume >= 2.0 && params.whaleScore < 60) {
    return 'Retail Momentum';
  }
  if (params.whaleScore >= 48 || params.institutionalScore >= 65) {
    return 'Stealth Accumulation';
  }
  return 'Neutral';
}

export function getGrowthPrediction(growthScore: number): NonNullable<Stock['growthPrediction']> {
  if (growthScore >= 80) return 'Strong Bullish';
  if (growthScore >= 65) return 'Bullish';
  if (growthScore >= 45) return 'Neutral';
  if (growthScore >= 28) return 'Weak';
  return 'Avoid';
}

// ─── AI Recommendation ───────────────────────────────────────────────────────

export function getRecommendation(params: {
  whaleScore: number;
  growthScore: number;
  aiScore: number;
  trend: string;
  rsi: number;
  relativeVolume: number;
  changePercent: number;
}): NonNullable<Stock['recommendation']> {
  const { whaleScore, growthScore, aiScore, trend, rsi, relativeVolume, changePercent } = params;

  if (trend === 'Bearish' || trend === 'Strong Bearish' || aiScore < 45) return 'Avoid';

  // Parabolic short-term — high risk
  if (relativeVolume >= 2.5 && changePercent > 6 && rsi > 73) return 'Risky Momentum';

  // Confirmed whale + growth alignment → strong entry signal
  if (whaleScore >= 70 && growthScore >= 65 && (trend === 'Strong Bullish' || trend === 'Bullish')) {
    return 'Buy Now';
  }

  // Good setup but stretched — wait for pullback
  if (aiScore >= 70 && (rsi > 70 || trend === 'Neutral')) return 'Buy on Pullback';

  // Watchlist-worthy
  if (aiScore >= 55 && whaleScore >= 42) return 'Watchlist';

  return 'Watchlist';
}

// ─── Risk Level ───────────────────────────────────────────────────────────────

export function calcRiskLevel(params: {
  beta: number;
  atr: number;
  price: number;
  shortFloat: number;
  trend: string;
}): NonNullable<Stock['riskLevel']> {
  const atrPct = params.price > 0 ? (params.atr / params.price) * 100 : 0;
  let pts = 0;

  if (params.beta >= 2.2) pts += 3;
  else if (params.beta >= 1.6) pts += 2;
  else if (params.beta >= 1.1) pts += 1;

  if (atrPct >= 5) pts += 3;
  else if (atrPct >= 3) pts += 2;
  else if (atrPct >= 1.5) pts += 1;

  if (params.shortFloat >= 10) pts += 2;
  else if (params.shortFloat >= 5) pts += 1;

  if (params.trend === 'Bearish' || params.trend === 'Strong Bearish') pts += 1;

  if (pts >= 7) return 'Very High';
  if (pts >= 4) return 'High';
  if (pts >= 2) return 'Medium';
  return 'Low';
}

// ─── Trade Metrics ────────────────────────────────────────────────────────────

export function calcTradeMetrics(params: {
  price: number;
  atr: number;
  trend: string;
}): {
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  target1: number;
  target2: number;
  target3: number;
  riskReward: number;
} {
  const { price, trend } = params;
  const atr = params.atr > 0 ? params.atr : price * 0.02;

  const pullback = trend === 'Strong Bullish' ? 0.005 : 0.012;
  const entryLow = parseFloat((price * (1 - pullback * 2)).toFixed(2));
  const entryHigh = parseFloat((price * (1 + pullback * 0.5)).toFixed(2));

  const stopMult = trend === 'Strong Bullish' ? 1.8 : 2.2;
  const stopLoss = parseFloat((price - atr * stopMult).toFixed(2));
  const target1 = parseFloat((price + atr * 2).toFixed(2));
  const target2 = parseFloat((price + atr * 4).toFixed(2));
  const target3 = parseFloat((price + atr * 7).toFixed(2));

  const entryMid = (entryLow + entryHigh) / 2;
  const risk = Math.max(0.01, entryMid - stopLoss);
  const riskReward = parseFloat(((target2 - entryMid) / risk).toFixed(1));

  return { entryLow, entryHigh, stopLoss, target1, target2, target3, riskReward };
}

// ─── Full Enhancement ─────────────────────────────────────────────────────────

export function enhanceStockWithWhaleData(stock: Stock): Stock {
  const whaleScore = calcWhaleScore({
    relativeVolume: stock.relativeVolume,
    institutionalScore: stock.institutionalScore,
    optionsFlowScore: stock.optionsFlowScore,
    trend: stock.trend,
    rsi: stock.rsi,
    aiScore: stock.aiScore,
  });

  const growthScore = calcGrowthScore({
    ema9: stock.ema9,
    ema21: stock.ema21,
    rsi: stock.rsi,
    macd: stock.macd,
    relativeVolume: stock.relativeVolume,
    atr: stock.atr,
    price: stock.price,
    trend: stock.trend,
    pattern: stock.pattern,
  });

  const accumulationLabel = getAccumulationLabel({
    whaleScore,
    institutionalScore: stock.institutionalScore,
    relativeVolume: stock.relativeVolume,
    trend: stock.trend,
  });

  const growthPrediction = getGrowthPrediction(growthScore);

  const recommendation = getRecommendation({
    whaleScore,
    growthScore,
    aiScore: stock.aiScore,
    trend: stock.trend,
    rsi: stock.rsi,
    relativeVolume: stock.relativeVolume,
    changePercent: stock.changePercent,
  });

  const confidencePercent = Math.round(whaleScore * 0.4 + growthScore * 0.3 + stock.aiScore * 0.3);

  const riskLevel = calcRiskLevel({
    beta: stock.beta,
    atr: stock.atr,
    price: stock.price,
    shortFloat: stock.shortFloat,
    trend: stock.trend,
  });

  const tradeMetrics = calcTradeMetrics({ price: stock.price, atr: stock.atr, trend: stock.trend });

  return { ...stock, whaleScore, growthScore, accumulationLabel, growthPrediction, recommendation, confidencePercent, riskLevel, ...tradeMetrics };
}
