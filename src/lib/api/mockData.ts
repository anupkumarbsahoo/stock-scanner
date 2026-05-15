import { Stock, MarketOverview, Alert, NewsItem, Candle } from '@/types';

// Realistic mock stock data used as fallback when API limits are hit
export const MOCK_STOCKS: Stock[] = [
  // ── Technology / Semiconductors ──────────────────────────────────────────
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

  // ── Consumer Discretionary ───────────────────────────────────────────────
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
    ticker: 'AMZN', company: 'Amazon.com Inc.', price: 198.40, change: 4.60, changePercent: 2.38,
    volume: 42000000, avgVolume: 36000000, relativeVolume: 1.17, marketCap: 2080000000000,
    sector: 'Consumer Discretionary', industry: 'E-Commerce', aiScore: 87, technicalScore: 84,
    fundamentalScore: 89, sentimentScore: 88, momentumScore: 85, optionsFlowScore: 84,
    institutionalScore: 90, buyProbability: 86, pattern: 'Bull Flag', trend: 'Strong Bullish',
    rsi: 63, macd: 5.8, ema9: 196, ema21: 190, ema50: 180, ema200: 158, vwap: 197, atr: 5.5,
    shortFloat: 0.7, beta: 1.14, high52w: 215, low52w: 118, pe: 52, eps: 3.81,
    revenueGrowth: 13, epsGrowth: 87, institutionalOwnership: 64, insiderBuying: 'Neutral',
    analystRating: 'Strong Buy', priceTarget: 240,
  },
  {
    ticker: 'HD', company: 'The Home Depot Inc.', price: 362.80, change: 5.10, changePercent: 1.43,
    volume: 4200000, avgVolume: 3800000, relativeVolume: 1.11, marketCap: 360000000000,
    sector: 'Consumer Discretionary', industry: 'Home Improvement Retail', aiScore: 75, technicalScore: 74,
    fundamentalScore: 78, sentimentScore: 72, momentumScore: 74, optionsFlowScore: 70,
    institutionalScore: 80, buyProbability: 74, pattern: 'EMA Crossover', trend: 'Bullish',
    rsi: 57, macd: 6.2, ema9: 360, ema21: 352, ema50: 338, ema200: 315, vwap: 361, atr: 8.2,
    shortFloat: 1.0, beta: 1.04, high52w: 395, low52w: 274, pe: 24, eps: 15.12,
    revenueGrowth: 4, epsGrowth: 8, institutionalOwnership: 72, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 405,
  },
  {
    ticker: 'NKE', company: 'Nike Inc.', price: 92.15, change: -1.85, changePercent: -1.97,
    volume: 8500000, avgVolume: 7500000, relativeVolume: 1.13, marketCap: 140000000000,
    sector: 'Consumer Discretionary', industry: 'Footwear & Apparel', aiScore: 62, technicalScore: 55,
    fundamentalScore: 68, sentimentScore: 60, momentumScore: 52, optionsFlowScore: 58,
    institutionalScore: 70, buyProbability: 58, pattern: 'Consolidation', trend: 'Bearish',
    rsi: 42, macd: -1.8, ema9: 94, ema21: 97, ema50: 102, ema200: 112, vwap: 93, atr: 2.8,
    shortFloat: 2.5, beta: 0.92, high52w: 118, low52w: 70, pe: 28, eps: 3.29,
    revenueGrowth: -4, epsGrowth: -12, institutionalOwnership: 65, insiderBuying: 'Negative',
    analystRating: 'Hold', priceTarget: 98,
  },

  // ── Healthcare ────────────────────────────────────────────────────────────
  {
    ticker: 'LLY', company: 'Eli Lilly and Company', price: 782.60, change: 22.40, changePercent: 2.95,
    volume: 3800000, avgVolume: 2900000, relativeVolume: 1.31, marketCap: 742000000000,
    sector: 'Healthcare', industry: 'Pharmaceuticals', aiScore: 89, technicalScore: 87,
    fundamentalScore: 90, sentimentScore: 92, momentumScore: 88, optionsFlowScore: 85,
    institutionalScore: 82, buyProbability: 88, pattern: 'Breakout', trend: 'Strong Bullish',
    rsi: 66, macd: 24.5, ema9: 772, ema21: 748, ema50: 700, ema200: 580, vwap: 778, atr: 22.5,
    shortFloat: 0.9, beta: 0.62, high52w: 972, low52w: 524, pe: 68, eps: 11.51,
    revenueGrowth: 28, epsGrowth: 85, institutionalOwnership: 82, insiderBuying: 'Positive',
    analystRating: 'Strong Buy', priceTarget: 950,
  },
  {
    ticker: 'UNH', company: 'UnitedHealth Group Inc.', price: 528.90, change: 8.20, changePercent: 1.57,
    volume: 3100000, avgVolume: 2700000, relativeVolume: 1.15, marketCap: 488000000000,
    sector: 'Healthcare', industry: 'Managed Care', aiScore: 82, technicalScore: 80,
    fundamentalScore: 85, sentimentScore: 78, momentumScore: 79, optionsFlowScore: 75,
    institutionalScore: 88, buyProbability: 80, pattern: 'Ascending Triangle', trend: 'Bullish',
    rsi: 59, macd: 11.2, ema9: 524, ema21: 515, ema50: 498, ema200: 468, vwap: 526, atr: 12.8,
    shortFloat: 0.6, beta: 0.72, high52w: 570, low52w: 430, pe: 22, eps: 24.04,
    revenueGrowth: 9, epsGrowth: 12, institutionalOwnership: 88, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 590,
  },
  {
    ticker: 'ABBV', company: 'AbbVie Inc.', price: 178.30, change: 2.80, changePercent: 1.59,
    volume: 4800000, avgVolume: 4200000, relativeVolume: 1.14, marketCap: 315000000000,
    sector: 'Healthcare', industry: 'Biopharmaceuticals', aiScore: 77, technicalScore: 75,
    fundamentalScore: 80, sentimentScore: 76, momentumScore: 74, optionsFlowScore: 72,
    institutionalScore: 78, buyProbability: 76, pattern: 'EMA Crossover', trend: 'Bullish',
    rsi: 58, macd: 3.5, ema9: 177, ema21: 173, ema50: 166, ema200: 152, vwap: 177, atr: 4.2,
    shortFloat: 0.7, beta: 0.55, high52w: 192, low52w: 134, pe: 18, eps: 9.91,
    revenueGrowth: 14, epsGrowth: 22, institutionalOwnership: 74, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 200,
  },
  {
    ticker: 'MRK', company: 'Merck & Co. Inc.', price: 128.45, change: 1.95, changePercent: 1.54,
    volume: 6200000, avgVolume: 5800000, relativeVolume: 1.07, marketCap: 325000000000,
    sector: 'Healthcare', industry: 'Pharmaceuticals', aiScore: 78, technicalScore: 76,
    fundamentalScore: 82, sentimentScore: 74, momentumScore: 76, optionsFlowScore: 72,
    institutionalScore: 82, buyProbability: 76, pattern: 'Bull Flag', trend: 'Bullish',
    rsi: 57, macd: 2.8, ema9: 127, ema21: 124, ema50: 118, ema200: 108, vwap: 128, atr: 3.4,
    shortFloat: 0.5, beta: 0.46, high52w: 137, low52w: 100, pe: 16, eps: 8.03,
    revenueGrowth: 7, epsGrowth: 18, institutionalOwnership: 80, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 148,
  },
  {
    ticker: 'JNJ', company: 'Johnson & Johnson', price: 158.20, change: 1.40, changePercent: 0.89,
    volume: 7200000, avgVolume: 6800000, relativeVolume: 1.06, marketCap: 382000000000,
    sector: 'Healthcare', industry: 'Medical Devices & Pharma', aiScore: 70, technicalScore: 68,
    fundamentalScore: 74, sentimentScore: 66, momentumScore: 65, optionsFlowScore: 64,
    institutionalScore: 84, buyProbability: 68, pattern: 'Consolidation', trend: 'Neutral',
    rsi: 50, macd: 1.2, ema9: 158, ema21: 157, ema50: 155, ema200: 152, vwap: 158, atr: 3.0,
    shortFloat: 0.4, beta: 0.52, high52w: 168, low52w: 143, pe: 15, eps: 10.55,
    revenueGrowth: 5, epsGrowth: 8, institutionalOwnership: 72, insiderBuying: 'Neutral',
    analystRating: 'Hold', priceTarget: 170,
  },

  // ── Financials ────────────────────────────────────────────────────────────
  {
    ticker: 'JPM', company: 'JPMorgan Chase & Co.', price: 198.70, change: 3.50, changePercent: 1.79,
    volume: 9800000, avgVolume: 8500000, relativeVolume: 1.15, marketCap: 572000000000,
    sector: 'Financials', industry: 'Banking', aiScore: 81, technicalScore: 79,
    fundamentalScore: 84, sentimentScore: 80, momentumScore: 78, optionsFlowScore: 76,
    institutionalScore: 86, buyProbability: 80, pattern: 'Bull Flag', trend: 'Bullish',
    rsi: 60, macd: 4.2, ema9: 197, ema21: 193, ema50: 184, ema200: 168, vwap: 198, atr: 4.8,
    shortFloat: 0.5, beta: 1.12, high52w: 212, low52w: 148, pe: 12, eps: 16.56,
    revenueGrowth: 22, epsGrowth: 35, institutionalOwnership: 72, insiderBuying: 'Positive',
    analystRating: 'Strong Buy', priceTarget: 228,
  },
  {
    ticker: 'V', company: 'Visa Inc.', price: 278.50, change: 4.20, changePercent: 1.53,
    volume: 7200000, avgVolume: 6400000, relativeVolume: 1.13, marketCap: 562000000000,
    sector: 'Financials', industry: 'Payment Processing', aiScore: 83, technicalScore: 82,
    fundamentalScore: 86, sentimentScore: 82, momentumScore: 80, optionsFlowScore: 78,
    institutionalScore: 88, buyProbability: 82, pattern: 'Ascending Triangle', trend: 'Bullish',
    rsi: 62, macd: 5.8, ema9: 276, ema21: 271, ema50: 260, ema200: 238, vwap: 277, atr: 5.5,
    shortFloat: 0.4, beta: 0.92, high52w: 292, low52w: 214, pe: 32, eps: 8.70,
    revenueGrowth: 11, epsGrowth: 17, institutionalOwnership: 84, insiderBuying: 'Neutral',
    analystRating: 'Strong Buy', priceTarget: 315,
  },
  {
    ticker: 'MA', company: 'Mastercard Inc.', price: 472.30, change: 6.80, changePercent: 1.46,
    volume: 3600000, avgVolume: 3200000, relativeVolume: 1.13, marketCap: 442000000000,
    sector: 'Financials', industry: 'Payment Processing', aiScore: 82, technicalScore: 81,
    fundamentalScore: 85, sentimentScore: 80, momentumScore: 80, optionsFlowScore: 78,
    institutionalScore: 86, buyProbability: 81, pattern: 'EMA Crossover', trend: 'Bullish',
    rsi: 62, macd: 9.5, ema9: 469, ema21: 462, ema50: 444, ema200: 408, vwap: 471, atr: 9.2,
    shortFloat: 0.3, beta: 0.94, high52w: 498, low52w: 368, pe: 38, eps: 12.43,
    revenueGrowth: 12, epsGrowth: 18, institutionalOwnership: 86, insiderBuying: 'Neutral',
    analystRating: 'Strong Buy', priceTarget: 530,
  },
  {
    ticker: 'GS', company: 'Goldman Sachs Group Inc.', price: 498.60, change: 7.40, changePercent: 1.51,
    volume: 1900000, avgVolume: 1700000, relativeVolume: 1.12, marketCap: 168000000000,
    sector: 'Financials', industry: 'Investment Banking', aiScore: 74, technicalScore: 72,
    fundamentalScore: 76, sentimentScore: 74, momentumScore: 72, optionsFlowScore: 70,
    institutionalScore: 80, buyProbability: 73, pattern: 'Breakout', trend: 'Bullish',
    rsi: 58, macd: 10.2, ema9: 494, ema21: 485, ema50: 462, ema200: 415, vwap: 496, atr: 12.5,
    shortFloat: 0.8, beta: 1.38, high52w: 524, low52w: 340, pe: 14, eps: 35.61,
    revenueGrowth: 32, epsGrowth: 45, institutionalOwnership: 70, insiderBuying: 'Positive',
    analystRating: 'Buy', priceTarget: 560,
  },
  {
    ticker: 'BLK', company: 'BlackRock Inc.', price: 808.40, change: 10.20, changePercent: 1.28,
    volume: 680000, avgVolume: 620000, relativeVolume: 1.10, marketCap: 122000000000,
    sector: 'Financials', industry: 'Asset Management', aiScore: 76, technicalScore: 74,
    fundamentalScore: 80, sentimentScore: 74, momentumScore: 74, optionsFlowScore: 70,
    institutionalScore: 82, buyProbability: 75, pattern: 'Bull Flag', trend: 'Bullish',
    rsi: 58, macd: 14.5, ema9: 802, ema21: 790, ema50: 762, ema200: 710, vwap: 806, atr: 18.5,
    shortFloat: 0.6, beta: 1.18, high52w: 856, low52w: 634, pe: 22, eps: 36.75,
    revenueGrowth: 15, epsGrowth: 20, institutionalOwnership: 82, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 900,
  },

  // ── Energy ────────────────────────────────────────────────────────────────
  {
    ticker: 'XOM', company: 'Exxon Mobil Corporation', price: 112.80, change: 1.90, changePercent: 1.71,
    volume: 15800000, avgVolume: 14200000, relativeVolume: 1.11, marketCap: 448000000000,
    sector: 'Energy', industry: 'Integrated Oil & Gas', aiScore: 74, technicalScore: 72,
    fundamentalScore: 78, sentimentScore: 70, momentumScore: 72, optionsFlowScore: 68,
    institutionalScore: 76, buyProbability: 73, pattern: 'Ascending Triangle', trend: 'Bullish',
    rsi: 56, macd: 1.8, ema9: 112, ema21: 110, ema50: 106, ema200: 102, vwap: 112, atr: 2.4,
    shortFloat: 0.5, beta: 0.72, high52w: 124, low52w: 94, pe: 14, eps: 8.06,
    revenueGrowth: 2, epsGrowth: 10, institutionalOwnership: 68, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 128,
  },
  {
    ticker: 'CVX', company: 'Chevron Corporation', price: 152.40, change: 2.10, changePercent: 1.40,
    volume: 7800000, avgVolume: 7200000, relativeVolume: 1.08, marketCap: 286000000000,
    sector: 'Energy', industry: 'Integrated Oil & Gas', aiScore: 71, technicalScore: 69,
    fundamentalScore: 74, sentimentScore: 68, momentumScore: 70, optionsFlowScore: 66,
    institutionalScore: 74, buyProbability: 70, pattern: 'EMA Crossover', trend: 'Bullish',
    rsi: 54, macd: 2.4, ema9: 151, ema21: 149, ema50: 144, ema200: 138, vwap: 151, atr: 3.2,
    shortFloat: 0.6, beta: 0.76, high52w: 168, low52w: 132, pe: 13, eps: 11.72,
    revenueGrowth: -2, epsGrowth: 5, institutionalOwnership: 70, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 172,
  },
  {
    ticker: 'OXY', company: 'Occidental Petroleum Corp.', price: 58.70, change: 1.80, changePercent: 3.17,
    volume: 14200000, avgVolume: 11800000, relativeVolume: 1.20, marketCap: 54000000000,
    sector: 'Energy', industry: 'Oil & Gas Exploration', aiScore: 78, technicalScore: 76,
    fundamentalScore: 78, sentimentScore: 80, momentumScore: 76, optionsFlowScore: 74,
    institutionalScore: 72, buyProbability: 77, pattern: 'Bull Flag', trend: 'Bullish',
    rsi: 60, macd: 1.2, ema9: 58, ema21: 56.5, ema50: 53, ema200: 48, vwap: 58, atr: 1.6,
    shortFloat: 2.8, beta: 1.44, high52w: 68, low52w: 44, pe: 12, eps: 4.89,
    revenueGrowth: -5, epsGrowth: 15, institutionalOwnership: 62, insiderBuying: 'Positive',
    analystRating: 'Buy', priceTarget: 72,
  },
  {
    ticker: 'VST', company: 'Vistra Corp.', price: 98.40, change: 4.20, changePercent: 4.46,
    volume: 8800000, avgVolume: 5200000, relativeVolume: 1.69, marketCap: 28000000000,
    sector: 'Energy', industry: 'Power Generation', aiScore: 88, technicalScore: 86,
    fundamentalScore: 84, sentimentScore: 90, momentumScore: 88, optionsFlowScore: 82,
    institutionalScore: 74, buyProbability: 87, pattern: 'Momentum Squeeze', trend: 'Strong Bullish',
    rsi: 69, macd: 4.8, ema9: 96, ema21: 90, ema50: 80, ema200: 58, vwap: 97, atr: 3.8,
    shortFloat: 5.2, beta: 1.62, high52w: 179, low52w: 38, pe: 25, eps: 3.94,
    revenueGrowth: 42, epsGrowth: 180, institutionalOwnership: 52, insiderBuying: 'Positive',
    analystRating: 'Strong Buy', priceTarget: 125,
  },

  // ── Consumer Staples ──────────────────────────────────────────────────────
  {
    ticker: 'WMT', company: 'Walmart Inc.', price: 68.40, change: 0.80, changePercent: 1.18,
    volume: 28000000, avgVolume: 24000000, relativeVolume: 1.17, marketCap: 548000000000,
    sector: 'Consumer Staples', industry: 'Discount Retail', aiScore: 80, technicalScore: 78,
    fundamentalScore: 82, sentimentScore: 78, momentumScore: 78, optionsFlowScore: 72,
    institutionalScore: 84, buyProbability: 79, pattern: 'Ascending Triangle', trend: 'Bullish',
    rsi: 60, macd: 1.2, ema9: 68, ema21: 66.5, ema50: 63, ema200: 57, vwap: 68, atr: 1.4,
    shortFloat: 0.4, beta: 0.52, high52w: 72, low52w: 52, pe: 28, eps: 2.44,
    revenueGrowth: 5, epsGrowth: 14, institutionalOwnership: 76, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 78,
  },
  {
    ticker: 'COST', company: 'Costco Wholesale Corp.', price: 848.90, change: 12.60, changePercent: 1.51,
    volume: 2100000, avgVolume: 1900000, relativeVolume: 1.11, marketCap: 374000000000,
    sector: 'Consumer Staples', industry: 'Warehouse Retail', aiScore: 85, technicalScore: 83,
    fundamentalScore: 88, sentimentScore: 84, momentumScore: 82, optionsFlowScore: 78,
    institutionalScore: 88, buyProbability: 84, pattern: 'EMA Crossover', trend: 'Strong Bullish',
    rsi: 64, macd: 18.5, ema9: 843, ema21: 828, ema50: 792, ema200: 722, vwap: 846, atr: 18.5,
    shortFloat: 0.3, beta: 0.74, high52w: 898, low52w: 658, pe: 52, eps: 16.32,
    revenueGrowth: 6, epsGrowth: 18, institutionalOwnership: 84, insiderBuying: 'Positive',
    analystRating: 'Strong Buy', priceTarget: 950,
  },
  {
    ticker: 'PG', company: 'Procter & Gamble Co.', price: 168.30, change: 1.20, changePercent: 0.72,
    volume: 6800000, avgVolume: 6400000, relativeVolume: 1.06, marketCap: 396000000000,
    sector: 'Consumer Staples', industry: 'Household Products', aiScore: 70, technicalScore: 68,
    fundamentalScore: 74, sentimentScore: 68, momentumScore: 66, optionsFlowScore: 64,
    institutionalScore: 80, buyProbability: 69, pattern: 'Consolidation', trend: 'Neutral',
    rsi: 52, macd: 1.5, ema9: 168, ema21: 167, ema50: 165, ema200: 160, vwap: 168, atr: 2.8,
    shortFloat: 0.4, beta: 0.52, high52w: 178, low52w: 148, pe: 27, eps: 6.23,
    revenueGrowth: 3, epsGrowth: 7, institutionalOwnership: 70, insiderBuying: 'Neutral',
    analystRating: 'Hold', priceTarget: 178,
  },

  // ── Industrials ───────────────────────────────────────────────────────────
  {
    ticker: 'GE', company: 'GE Aerospace', price: 168.50, change: 5.80, changePercent: 3.57,
    volume: 7800000, avgVolume: 5800000, relativeVolume: 1.34, marketCap: 182000000000,
    sector: 'Industrials', industry: 'Aerospace & Defense', aiScore: 84, technicalScore: 82,
    fundamentalScore: 84, sentimentScore: 86, momentumScore: 84, optionsFlowScore: 80,
    institutionalScore: 80, buyProbability: 83, pattern: 'Breakout', trend: 'Strong Bullish',
    rsi: 64, macd: 5.2, ema9: 166, ema21: 160, ema50: 148, ema200: 120, vwap: 167, atr: 4.8,
    shortFloat: 1.4, beta: 1.22, high52w: 182, low52w: 106, pe: 38, eps: 4.43,
    revenueGrowth: 18, epsGrowth: 65, institutionalOwnership: 76, insiderBuying: 'Positive',
    analystRating: 'Strong Buy', priceTarget: 200,
  },
  {
    ticker: 'CAT', company: 'Caterpillar Inc.', price: 352.40, change: 5.60, changePercent: 1.62,
    volume: 2400000, avgVolume: 2100000, relativeVolume: 1.14, marketCap: 178000000000,
    sector: 'Industrials', industry: 'Construction Machinery', aiScore: 79, technicalScore: 78,
    fundamentalScore: 80, sentimentScore: 76, momentumScore: 78, optionsFlowScore: 72,
    institutionalScore: 80, buyProbability: 78, pattern: 'Ascending Triangle', trend: 'Bullish',
    rsi: 60, macd: 7.8, ema9: 349, ema21: 342, ema50: 328, ema200: 298, vwap: 351, atr: 8.4,
    shortFloat: 0.8, beta: 0.98, high52w: 388, low52w: 272, pe: 18, eps: 19.58,
    revenueGrowth: 3, epsGrowth: 9, institutionalOwnership: 76, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 395,
  },
  {
    ticker: 'RTX', company: 'RTX Corporation', price: 124.80, change: 2.20, changePercent: 1.79,
    volume: 5400000, avgVolume: 4800000, relativeVolume: 1.13, marketCap: 166000000000,
    sector: 'Industrials', industry: 'Aerospace & Defense', aiScore: 76, technicalScore: 74,
    fundamentalScore: 78, sentimentScore: 76, momentumScore: 74, optionsFlowScore: 70,
    institutionalScore: 80, buyProbability: 75, pattern: 'Bull Flag', trend: 'Bullish',
    rsi: 58, macd: 2.4, ema9: 124, ema21: 121, ema50: 115, ema200: 104, vwap: 124, atr: 2.8,
    shortFloat: 0.6, beta: 0.94, high52w: 132, low52w: 88, pe: 36, eps: 3.47,
    revenueGrowth: 12, epsGrowth: 18, institutionalOwnership: 78, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 142,
  },
  {
    ticker: 'DE', company: 'Deere & Company', price: 388.20, change: 4.80, changePercent: 1.25,
    volume: 1800000, avgVolume: 1650000, relativeVolume: 1.09, marketCap: 108000000000,
    sector: 'Industrials', industry: 'Agricultural Machinery', aiScore: 73, technicalScore: 71,
    fundamentalScore: 76, sentimentScore: 70, momentumScore: 72, optionsFlowScore: 68,
    institutionalScore: 78, buyProbability: 72, pattern: 'Consolidation', trend: 'Bullish',
    rsi: 55, macd: 5.2, ema9: 386, ema21: 380, ema50: 368, ema200: 352, vwap: 387, atr: 8.8,
    shortFloat: 0.7, beta: 0.92, high52w: 448, low52w: 328, pe: 14, eps: 27.73,
    revenueGrowth: -4, epsGrowth: 2, institutionalOwnership: 76, insiderBuying: 'Neutral',
    analystRating: 'Hold', priceTarget: 415,
  },

  // ── Communication Services ────────────────────────────────────────────────
  {
    ticker: 'NFLX', company: 'Netflix Inc.', price: 648.50, change: 18.20, changePercent: 2.89,
    volume: 5800000, avgVolume: 4800000, relativeVolume: 1.21, marketCap: 280000000000,
    sector: 'Communication Services', industry: 'Streaming', aiScore: 86, technicalScore: 84,
    fundamentalScore: 86, sentimentScore: 88, momentumScore: 85, optionsFlowScore: 82,
    institutionalScore: 82, buyProbability: 85, pattern: 'Momentum Squeeze', trend: 'Strong Bullish',
    rsi: 65, macd: 16.8, ema9: 641, ema21: 622, ema50: 582, ema200: 488, vwap: 645, atr: 18.5,
    shortFloat: 1.8, beta: 1.22, high52w: 698, low52w: 344, pe: 48, eps: 13.51,
    revenueGrowth: 15, epsGrowth: 78, institutionalOwnership: 80, insiderBuying: 'Neutral',
    analystRating: 'Strong Buy', priceTarget: 740,
  },
  {
    ticker: 'DIS', company: 'The Walt Disney Company', price: 108.40, change: -1.20, changePercent: -1.09,
    volume: 9800000, avgVolume: 9200000, relativeVolume: 1.07, marketCap: 198000000000,
    sector: 'Communication Services', industry: 'Entertainment', aiScore: 68, technicalScore: 65,
    fundamentalScore: 70, sentimentScore: 68, momentumScore: 62, optionsFlowScore: 65,
    institutionalScore: 72, buyProbability: 66, pattern: 'Consolidation', trend: 'Neutral',
    rsi: 48, macd: -0.8, ema9: 109, ema21: 111, ema50: 114, ema200: 108, vwap: 109, atr: 3.2,
    shortFloat: 1.5, beta: 1.08, high52w: 124, low52w: 84, pe: 42, eps: 2.58,
    revenueGrowth: 4, epsGrowth: 145, institutionalOwnership: 68, insiderBuying: 'Neutral',
    analystRating: 'Hold', priceTarget: 120,
  },

  // ── Materials ─────────────────────────────────────────────────────────────
  {
    ticker: 'LIN', company: 'Linde plc', price: 448.20, change: 5.40, changePercent: 1.22,
    volume: 1400000, avgVolume: 1280000, relativeVolume: 1.09, marketCap: 212000000000,
    sector: 'Materials', industry: 'Industrial Gases', aiScore: 75, technicalScore: 74,
    fundamentalScore: 78, sentimentScore: 72, momentumScore: 74, optionsFlowScore: 70,
    institutionalScore: 82, buyProbability: 74, pattern: 'Ascending Triangle', trend: 'Bullish',
    rsi: 58, macd: 7.8, ema9: 446, ema21: 440, ema50: 428, ema200: 405, vwap: 447, atr: 8.5,
    shortFloat: 0.4, beta: 0.84, high52w: 468, low52w: 378, pe: 30, eps: 14.94,
    revenueGrowth: 6, epsGrowth: 12, institutionalOwnership: 80, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 500,
  },
  {
    ticker: 'FCX', company: 'Freeport-McMoRan Inc.', price: 42.80, change: 1.40, changePercent: 3.38,
    volume: 18500000, avgVolume: 14800000, relativeVolume: 1.25, marketCap: 62000000000,
    sector: 'Materials', industry: 'Copper Mining', aiScore: 73, technicalScore: 72,
    fundamentalScore: 74, sentimentScore: 74, momentumScore: 72, optionsFlowScore: 68,
    institutionalScore: 68, buyProbability: 72, pattern: 'Bull Flag', trend: 'Bullish',
    rsi: 58, macd: 0.8, ema9: 42.2, ema21: 40.8, ema50: 38.5, ema200: 35.2, vwap: 42.5, atr: 1.2,
    shortFloat: 2.8, beta: 1.72, high52w: 52, low52w: 32, pe: 22, eps: 1.95,
    revenueGrowth: 8, epsGrowth: 25, institutionalOwnership: 60, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 52,
  },

  // ── Utilities ─────────────────────────────────────────────────────────────
  {
    ticker: 'NEE', company: 'NextEra Energy Inc.', price: 72.40, change: 0.90, changePercent: 1.26,
    volume: 9200000, avgVolume: 8500000, relativeVolume: 1.08, marketCap: 147000000000,
    sector: 'Utilities', industry: 'Electric Utilities', aiScore: 74, technicalScore: 72,
    fundamentalScore: 76, sentimentScore: 72, momentumScore: 72, optionsFlowScore: 68,
    institutionalScore: 78, buyProbability: 73, pattern: 'Ascending Triangle', trend: 'Bullish',
    rsi: 56, macd: 1.2, ema9: 72, ema21: 70.5, ema50: 67, ema200: 62, vwap: 72, atr: 1.6,
    shortFloat: 0.8, beta: 0.52, high52w: 78, low52w: 56, pe: 22, eps: 3.29,
    revenueGrowth: 12, epsGrowth: 10, institutionalOwnership: 72, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 82,
  },

  // ── Real Estate ───────────────────────────────────────────────────────────
  {
    ticker: 'AMT', company: 'American Tower Corp.', price: 198.40, change: 2.80, changePercent: 1.43,
    volume: 2100000, avgVolume: 1950000, relativeVolume: 1.08, marketCap: 92000000000,
    sector: 'Real Estate', industry: 'Telecom REITs', aiScore: 68, technicalScore: 66,
    fundamentalScore: 72, sentimentScore: 66, momentumScore: 65, optionsFlowScore: 63,
    institutionalScore: 75, buyProbability: 67, pattern: 'Consolidation', trend: 'Neutral',
    rsi: 52, macd: 2.4, ema9: 198, ema21: 195, ema50: 190, ema200: 182, vwap: 198, atr: 4.5,
    shortFloat: 1.2, beta: 0.82, high52w: 218, low52w: 162, pe: 40, eps: 4.96,
    revenueGrowth: 4, epsGrowth: 8, institutionalOwnership: 88, insiderBuying: 'Neutral',
    analystRating: 'Hold', priceTarget: 220,
  },
  {
    ticker: 'PLD', company: 'Prologis Inc.', price: 118.60, change: 1.60, changePercent: 1.37,
    volume: 3200000, avgVolume: 2900000, relativeVolume: 1.10, marketCap: 112000000000,
    sector: 'Real Estate', industry: 'Industrial REITs', aiScore: 71, technicalScore: 70,
    fundamentalScore: 74, sentimentScore: 70, momentumScore: 69, optionsFlowScore: 66,
    institutionalScore: 78, buyProbability: 70, pattern: 'EMA Crossover', trend: 'Bullish',
    rsi: 54, macd: 2.0, ema9: 118, ema21: 115.5, ema50: 111, ema200: 105, vwap: 118, atr: 2.8,
    shortFloat: 0.9, beta: 0.88, high52w: 132, low52w: 98, pe: 48, eps: 2.47,
    revenueGrowth: 8, epsGrowth: 12, institutionalOwnership: 90, insiderBuying: 'Neutral',
    analystRating: 'Buy', priceTarget: 135,
  },
];

export const MOCK_MARKET_OVERVIEW: MarketOverview = {
  spy: { price: 524.85, change: 8.45, changePercent: 1.64 },
  qqq: { price: 448.20, change: 9.82, changePercent: 2.24 },
  dia: { price: 388.50, change: 3.20, changePercent: 0.83 },
  vix: { price: 13.82, change: -0.95, changePercent: -6.43 },
  status: 'OPEN',
};

// Generate alerts dynamically from real stock data
export function generateAlertsFromStocks(stocks: Stock[]): Alert[] {
  const alerts: Alert[] = [];
  const now = Date.now() / 1000;

  for (const stock of stocks) {
    if (stock.aiScore >= 88) {
      alerts.push({
        id: `ai-${stock.ticker}`,
        ticker: stock.ticker,
        type: 'ai_score',
        message: `${stock.ticker} AI Score ${stock.aiScore} — ${stock.trend} with ${stock.pattern} pattern`,
        timestamp: now - Math.random() * 600,
        severity: stock.aiScore >= 92 ? 'high' : 'medium',
        read: false,
      });
    }
    if (stock.pattern === 'Breakout' || stock.pattern === 'Momentum Squeeze') {
      alerts.push({
        id: `breakout-${stock.ticker}`,
        ticker: stock.ticker,
        type: 'breakout',
        message: `${stock.ticker} ${stock.pattern} detected — price $${stock.price.toFixed(2)}, up ${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`,
        timestamp: now - Math.random() * 900,
        severity: stock.changePercent > 4 ? 'high' : 'medium',
        read: false,
      });
    }
    if (stock.relativeVolume >= 1.6) {
      alerts.push({
        id: `vol-${stock.ticker}`,
        ticker: stock.ticker,
        type: 'momentum',
        message: `${stock.ticker} unusual volume — ${stock.relativeVolume.toFixed(2)}x avg, ${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}% move`,
        timestamp: now - Math.random() * 1200,
        severity: stock.relativeVolume >= 1.8 ? 'high' : 'medium',
        read: false,
      });
    }
  }

  // Deduplicate (keep one alert per ticker, the highest severity one)
  const byTicker = new Map<string, Alert>();
  for (const alert of alerts) {
    const existing = byTicker.get(alert.ticker);
    if (!existing || (alert.severity === 'high' && existing.severity !== 'high')) {
      byTicker.set(alert.ticker, alert);
    }
  }

  return [...byTicker.values()]
    .sort((a, b) => {
      if (a.severity === b.severity) return b.timestamp - a.timestamp;
      return a.severity === 'high' ? -1 : 1;
    })
    .slice(0, 20);
}

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
