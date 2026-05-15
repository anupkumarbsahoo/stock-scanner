export interface Stock {
  ticker: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  relativeVolume: number;
  marketCap: number;
  sector: string;
  industry: string;
  aiScore: number;
  technicalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
  momentumScore: number;
  optionsFlowScore: number;
  institutionalScore: number;
  buyProbability: number;
  pattern: string;
  trend: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish';
  rsi: number;
  macd: number;
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  vwap: number;
  atr: number;
  shortFloat: number;
  beta: number;
  high52w: number;
  low52w: number;
  pe: number;
  eps: number;
  revenueGrowth: number;
  epsGrowth: number;
  institutionalOwnership: number;
  insiderBuying: 'Positive' | 'Neutral' | 'Negative';
  analystRating: string;
  priceTarget: number;
}

export interface StockDetail extends Stock {
  description: string;
  website: string;
  ceo: string;
  employees: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roe: number;
  debtToEquity: number;
  freeCashFlow: number;
  forwardPE: number;
  pegRatio: number;
  dividendYield: number;
  earningsHistory: EarningsRecord[];
  news: NewsItem[];
  smartMoney: SmartMoneyData;
  aiExplanation: string;
  supportLevels: number[];
  resistanceLevels: number[];
  candles: Candle[];
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

export interface EarningsRecord {
  date: string;
  actual: number;
  estimate: number;
  surprise: number;
  surprisePercent: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  impactScore: number;
  category: string;
}

export interface SmartMoneyData {
  darkPoolActivity: 'Bullish' | 'Bearish' | 'Neutral';
  darkPoolVolume: number;
  optionsFlow: 'Aggressive CALL buying' | 'Aggressive PUT buying' | 'Mixed' | 'Neutral';
  callPutRatio: number;
  unusualActivity: boolean;
  institutionalBuying: 'Increasing' | 'Decreasing' | 'Stable';
  hedgeFundSentiment: 'Bullish' | 'Bearish' | 'Neutral';
  insiderTransactions: InsiderTransaction[];
  blockTrades: number;
  whaleActivity: boolean;
}

export interface InsiderTransaction {
  date: string;
  name: string;
  title: string;
  type: 'Buy' | 'Sell';
  shares: number;
  price: number;
  value: number;
}

export interface MarketOverview {
  spy: { price: number; change: number; changePercent: number };
  qqq: { price: number; change: number; changePercent: number };
  dia: { price: number; change: number; changePercent: number };
  vix: { price: number; change: number; changePercent: number };
  status: 'OPEN' | 'CLOSED' | 'PRE-MARKET' | 'AFTER-HOURS';
}

export interface Alert {
  id: string;
  ticker: string;
  type: 'breakout' | 'earnings' | 'options' | 'institutional' | 'momentum' | 'ai_score';
  message: string;
  timestamp: number;
  severity: 'high' | 'medium' | 'low';
  read: boolean;
}

export interface WatchlistItem {
  ticker: string;
  addedAt: number;
  targetPrice?: number;
  stopLoss?: number;
  notes?: string;
}

export interface ScannerFilters {
  sectors: string[];
  minMarketCap: number;
  maxMarketCap: number;
  minAiScore: number;
  minRsi: number;
  maxRsi: number;
  minRelativeVolume: number;
  patterns: string[];
  trend: string[];
  minPrice: number;
  maxPrice: number;
}

export interface BacktestResult {
  id: string;
  name: string;
  strategy: string;
  startDate: string;
  endDate: string;
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgGain: number;
  avgLoss: number;
  trades: BacktestTrade[];
}

export interface BacktestTrade {
  ticker: string;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  return: number;
  aiScore: number;
}
