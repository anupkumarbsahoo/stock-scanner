import { Stock, MarketOverview, Alert, NewsItem, Candle } from '@/types';

// Realistic mock stock data used as fallback when API limits are hit
export const MOCK_STOCKS: Stock[] = [
  {
    ticker: 'NVDA', company: 'NVIDIA Corporation', price: 875.40, change: 23.15, changePercent: 2.71,
    volume: 48250000, avgVolume: 32000000, relativeVolume: 1.51, marketCap: 2150000000000,
    sector: 'Technology', industry: 'Semiconductors', aiScore: 94, technicalScore: 91,
    fundamentalScore: 92, sentimentScore: 96, momentumScore: 89, optionsFlowScore: 88,
    institutionalScore: 85, buyProbability: 92, pattern: 'Breakout', trend: 'Strong Bullish',
    rsi: 68, macd: 12.5, ema9: 862, ema21: 845, ema50: 810, ema200: 720, vwap: 870, atr: 28,
    shortFloat: 1.2, beta: 1.72, high52w: 974, low52w: 435, pe: 62, eps: 14.10,
    revenueGrowth: 122, epsGrowth: 265, institutionalOwnership: 68, insiderBuying: 'Positive',
    analystRating: 'Strong Buy', priceTarget: 1050,
  },
  {
    ticker: 'MU', company: 'Micron Technology', price: 142.55, change: 7.02, changePercent: 5.18,
    volume: 28500000, avgVolume: 18000000, relativeVolume: 1.58, marketCap: 157000000000,
    sector: 'Technology', industry: 'Semiconductors', aiScore: 96, technicalScore: 93,
    fundamentalScore: 88, sentimentScore: 92, momentumScore: 91, optionsFlowScore: 90,
    institutionalScore: 82, buyProbability: 94, pattern: 'Cup & Handle', trend: 'Strong Bullish',
    rsi: 67, macd: 8.3, ema9: 139, ema21: 134, ema50: 121, ema200: 98, vwap: 140, atr: 5.2,
    shortFloat: 2.1, beta: 1.85, high52w: 157, low52w: 68, pe: 28, eps: 5.09,
    revenueGrowth: 38, epsGrowth: 52, institutionalOwnership: 74, insiderBuying: 'Positive',
    analystRating: 'Strong Buy', priceTarget: 175,
  },
  {
    ticker: 'PLTR', company: 'Palantir Technologies', price: 24.82, change: 1.15, changePercent: 4.86,
    volume: 89500000, avgVolume: 52000000, relativeVolume: 1.72, marketCap: 53000000000,
    sector: 'Technology', industry: 'Software', aiScore: 92, technicalScore: 88,
    fundamentalScore: 72, sentimentScore: 94, momentumScore: 90, optionsFlowScore: 92,
    institutionalScore: 68, buyProbability: 90, pattern: 'Bull Flag', trend: 'Strong Bullish',
    rsi: 65, macd: 0.85, ema9: 23.9, ema21: 22.8, ema50: 20.5, ema200: 17.2, vwap: 24.4, atr: 0.9,
    shortFloat: 4.8, beta: 2.1, high52w: 27.5, low52w: 12.3, pe: 85, eps: 0.29,
    revenueGrowth: 27, epsGrowth: 180, institutionalOwnership: 42, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 32,
  },
  {
    ticker: 'META', company: 'Meta Platforms', price: 512.30, change: 15.80, changePercent: 3.18,
    volume: 18200000, avgVolume: 14500000, relativeVolume: 1.25, marketCap: 1310000000000,
    sector: 'Technology', industry: 'Social Media', aiScore: 88, technicalScore: 85,
    fundamentalScore: 90, sentimentScore: 86, momentumScore: 84, optionsFlowScore: 82,
    institutionalScore: 88, buyProbability: 86, pattern: 'EMA Crossover', trend: 'Strong Bullish',
    rsi: 62, macd: 18.2, ema9: 505, ema21: 492, ema50: 468, ema200: 390, vwap: 508, atr: 15.2,
    shortFloat: 0.8, beta: 1.28, high52w: 531, low52w: 274, pe: 24, eps: 21.36,
    revenueGrowth: 25, epsGrowth: 114, institutionalOwnership: 78, insiderBuying: 'Positive',
    analystRating: 'Strong Buy', priceTarget: 600,
  },
  {
    ticker: 'SMCI', company: 'Super Micro Computer', price: 892.50, change: 45.20, changePercent: 5.34,
    volume: 6800000, avgVolume: 3500000, relativeVolume: 1.94, marketCap: 52000000000,
    sector: 'Technology', industry: 'Computer Hardware', aiScore: 91, technicalScore: 94,
    fundamentalScore: 85, sentimentScore: 88, momentumScore: 93, optionsFlowScore: 87,
    institutionalScore: 72, buyProbability: 89, pattern: 'Momentum Squeeze', trend: 'Strong Bullish',
    rsi: 71, macd: 45.8, ema9: 875, ema21: 842, ema50: 780, ema200: 580, vwap: 885, atr: 38.5,
    shortFloat: 6.2, beta: 2.45, high52w: 1229, low52w: 225, pe: 35, eps: 25.50,
    revenueGrowth: 103, epsGrowth: 82, institutionalOwnership: 56, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 1100,
  },
  {
    ticker: 'AMD', company: 'Advanced Micro Devices', price: 165.20, change: 4.85, changePercent: 3.02,
    volume: 52000000, avgVolume: 42000000, relativeVolume: 1.24, marketCap: 266000000000,
    sector: 'Technology', industry: 'Semiconductors', aiScore: 82, technicalScore: 80,
    fundamentalScore: 76, sentimentScore: 84, momentumScore: 78, optionsFlowScore: 80,
    institutionalScore: 76, buyProbability: 80, pattern: 'Ascending Triangle', trend: 'Bullish',
    rsi: 58, macd: 5.2, ema9: 163, ema21: 158, ema50: 148, ema200: 132, vwap: 164, atr: 6.8,
    shortFloat: 2.8, beta: 1.62, high52w: 228, low52w: 93, pe: 48, eps: 3.44,
    revenueGrowth: 18, epsGrowth: 35, institutionalOwnership: 72, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 210,
  },
  {
    ticker: 'MSFT', company: 'Microsoft Corporation', price: 418.75, change: 6.20, changePercent: 1.50,
    volume: 22000000, avgVolume: 20000000, relativeVolume: 1.10, marketCap: 3110000000000,
    sector: 'Technology', industry: 'Software', aiScore: 80, technicalScore: 78,
    fundamentalScore: 88, sentimentScore: 82, momentumScore: 75, optionsFlowScore: 76,
    institutionalScore: 91, buyProbability: 78, pattern: 'Consolidation', trend: 'Bullish',
    rsi: 55, macd: 8.5, ema9: 415, ema21: 408, ema50: 392, ema200: 365, vwap: 416, atr: 10.2,
    shortFloat: 0.5, beta: 0.88, high52w: 468, low52w: 309, pe: 36, eps: 11.63,
    revenueGrowth: 17, epsGrowth: 20, institutionalOwnership: 74, insiderBuying: 'Neutral',
    analystRating: 'Strong Buy', priceTarget: 500,
  },
  {
    ticker: 'TSLA', company: 'Tesla Inc.', price: 248.50, change: -8.30, changePercent: -3.23,
    volume: 125000000, avgVolume: 95000000, relativeVolume: 1.32, marketCap: 790000000000,
    sector: 'Consumer Discretionary', industry: 'Electric Vehicles', aiScore: 58, technicalScore: 42,
    fundamentalScore: 55, sentimentScore: 62, momentumScore: 40, optionsFlowScore: 65,
    institutionalScore: 52, buyProbability: 45, pattern: 'Consolidation', trend: 'Bearish',
    rsi: 38, macd: -5.8, ema9: 252, ema21: 261, ema50: 275, ema200: 234, vwap: 253, atr: 12.5,
    shortFloat: 3.8, beta: 2.32, high52w: 299, low52w: 138, pe: 60, eps: 4.14,
    revenueGrowth: 3, epsGrowth: -25, institutionalOwnership: 44, insiderBuying: 'Negative',
    analystRating: 'Hold', priceTarget: 255,
  },
  {
    ticker: 'GOOGL', company: 'Alphabet Inc.', price: 175.85, change: 3.45, changePercent: 2.00,
    volume: 28500000, avgVolume: 24000000, relativeVolume: 1.19, marketCap: 2190000000000,
    sector: 'Technology', industry: 'Internet', aiScore: 84, technicalScore: 82,
    fundamentalScore: 87, sentimentScore: 80, momentumScore: 80, optionsFlowScore: 78,
    institutionalScore: 85, buyProbability: 82, pattern: 'Bull Flag', trend: 'Bullish',
    rsi: 60, macd: 4.2, ema9: 174, ema21: 170, ema50: 163, ema200: 148, vwap: 175, atr: 5.2,
    shortFloat: 0.4, beta: 1.05, high52w: 193, low52w: 120, pe: 25, eps: 7.03,
    revenueGrowth: 15, epsGrowth: 52, institutionalOwnership: 80, insiderBuying: 'Neutral',
    analystRating: 'Strong Buy', priceTarget: 220,
  },
  {
    ticker: 'AVGO', company: 'Broadcom Inc.', price: 1425.00, change: 38.50, changePercent: 2.78,
    volume: 4200000, avgVolume: 3800000, relativeVolume: 1.11, marketCap: 662000000000,
    sector: 'Technology', industry: 'Semiconductors', aiScore: 86, technicalScore: 84,
    fundamentalScore: 86, sentimentScore: 82, momentumScore: 85, optionsFlowScore: 82,
    institutionalScore: 84, buyProbability: 84, pattern: 'EMA Crossover', trend: 'Strong Bullish',
    rsi: 64, macd: 28.5, ema9: 1410, ema21: 1380, ema50: 1320, ema200: 1150, vwap: 1418, atr: 42.5,
    shortFloat: 0.9, beta: 1.12, high52w: 1977, low52w: 750, pe: 42, eps: 33.93,
    revenueGrowth: 51, epsGrowth: 68, institutionalOwnership: 78, insiderBuying: 'Positive',
    analystRating: 'Strong Buy', priceTarget: 1800,
  },
  {
    ticker: 'ORCL', company: 'Oracle Corporation', price: 142.80, change: 5.20, changePercent: 3.78,
    volume: 18500000, avgVolume: 12000000, relativeVolume: 1.54, marketCap: 392000000000,
    sector: 'Technology', industry: 'Software', aiScore: 78, technicalScore: 76,
    fundamentalScore: 80, sentimentScore: 78, momentumScore: 76, optionsFlowScore: 74,
    institutionalScore: 80, buyProbability: 76, pattern: 'Breakout', trend: 'Bullish',
    rsi: 62, macd: 3.8, ema9: 141, ema21: 136, ema50: 128, ema200: 112, vwap: 141, atr: 4.2,
    shortFloat: 1.5, beta: 0.98, high52w: 148, low52w: 85, pe: 30, eps: 4.76,
    revenueGrowth: 18, epsGrowth: 28, institutionalOwnership: 76, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 165,
  },
  {
    ticker: 'CRM', company: 'Salesforce Inc.', price: 278.40, change: -2.80, changePercent: -0.99,
    volume: 8500000, avgVolume: 7200000, relativeVolume: 1.18, marketCap: 268000000000,
    sector: 'Technology', industry: 'Software', aiScore: 65, technicalScore: 60,
    fundamentalScore: 72, sentimentScore: 68, momentumScore: 58, optionsFlowScore: 62,
    institutionalScore: 78, buyProbability: 62, pattern: 'Consolidation', trend: 'Neutral',
    rsi: 46, macd: -1.2, ema9: 280, ema21: 283, ema50: 278, ema200: 265, vwap: 280, atr: 8.5,
    shortFloat: 1.8, beta: 1.22, high52w: 318, low52w: 212, pe: 48, eps: 5.80,
    revenueGrowth: 11, epsGrowth: 42, institutionalOwnership: 80, insiderBuying: 'Neutral',
    analystRating: 'Hold', priceTarget: 295,
  },
];

export const MOCK_MARKET_OVERVIEW: MarketOverview = {
  spy: { price: 524.85, change: 8.45, changePercent: 1.64 },
  qqq: { price: 448.20, change: 9.82, changePercent: 2.24 },
  dia: { price: 388.50, change: 3.20, changePercent: 0.83 },
  vix: { price: 13.82, change: -0.95, changePercent: -6.43 },
  status: 'OPEN',
};

export const MOCK_ALERTS: Alert[] = [
  {
    id: '1', ticker: 'MU', type: 'breakout',
    message: 'MU breaking out above $140 resistance with 1.6x relative volume',
    timestamp: Date.now() / 1000 - 300, severity: 'high', read: false,
  },
  {
    id: '2', ticker: 'NVDA', type: 'options',
    message: 'Unusual CALL buying detected — 5,000 NVDA $900 calls expiring this week',
    timestamp: Date.now() / 1000 - 600, severity: 'high', read: false,
  },
  {
    id: '3', ticker: 'PLTR', type: 'momentum',
    message: 'PLTR AI score surged to 92 — momentum accelerating',
    timestamp: Date.now() / 1000 - 900, severity: 'medium', read: true,
  },
  {
    id: '4', ticker: 'SMCI', type: 'ai_score',
    message: 'SMCI AI Score hit 91 — institutional accumulation + technical breakout convergence',
    timestamp: Date.now() / 1000 - 1200, severity: 'high', read: false,
  },
  {
    id: '5', ticker: 'META', type: 'institutional',
    message: 'Large institutional block trade detected in META — $85M purchase',
    timestamp: Date.now() / 1000 - 1800, severity: 'medium', read: true,
  },
];

export function generateCandles(basePrice: number, count = 90): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice * 0.75;
  const now = Math.floor(Date.now() / 1000);
  const daySeconds = 86400;

  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.45) * price * 0.03;
    const open = price;
    price = Math.max(price * 0.5, price + change);
    const high = Math.max(open, price) * (1 + Math.random() * 0.01);
    const low = Math.min(open, price) * (1 - Math.random() * 0.01);
    candles.push({
      time: now - i * daySeconds,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 30000000 + 5000000),
    });
  }
  return candles;
}

export function generateMockNews(ticker: string): NewsItem[] {
  const headlines = [
    { h: `${ticker} Reports Strong Quarterly Earnings Beat`, s: 'Bullish' as const, impact: 85 },
    { h: `Institutional Investors Increase ${ticker} Position by 12%`, s: 'Bullish' as const, impact: 72 },
    { h: `${ticker} Announces New AI Partnership Deal`, s: 'Bullish' as const, impact: 68 },
    { h: `Analyst Upgrades ${ticker} to Strong Buy, Raises PT`, s: 'Bullish' as const, impact: 78 },
    { h: `${ticker} CEO Discusses Expansion Plans in Interview`, s: 'Neutral' as const, impact: 45 },
    { h: `Market Volatility Could Impact ${ticker} Short-Term`, s: 'Bearish' as const, impact: 35 },
  ];

  return headlines.map((item, idx) => ({
    id: `${ticker}-news-${idx}`,
    headline: item.h,
    summary: `Detailed analysis of ${item.h.toLowerCase()}. Industry experts weigh in on potential market impact and what this means for investors.`,
    source: ['Reuters', 'Bloomberg', 'CNBC', 'WSJ', 'Barron\'s', 'Benzinga'][idx % 6],
    url: '#',
    datetime: Math.floor(Date.now() / 1000) - idx * 3600,
    sentiment: item.s,
    impactScore: item.impact,
    category: 'company news',
  }));
}
