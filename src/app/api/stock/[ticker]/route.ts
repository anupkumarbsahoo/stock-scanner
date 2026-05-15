import { NextResponse } from 'next/server';
import { MOCK_STOCKS, generateCandles, generateMockNews } from '@/lib/api/mockData';
import { getQuote, getCompanyProfile, getCompanyNews, getEarningsCalendar, getBasicFinancials, getRecommendations } from '@/lib/api/finnhub';
import { StockDetail } from '@/types';
import { calcTechnicalScore, calcFundamentalScore, calcFinalAIScore, calcBuyProbability, getTrend } from '@/lib/scoring/aiScore';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase();

  const mockBase = MOCK_STOCKS.find((s) => s.ticker === symbol);
  const mockNews = generateMockNews(symbol);

  const buildSmartMoney = (price: number) => ({
    darkPoolActivity: 'Bullish' as const,
    darkPoolVolume: Math.floor(Math.random() * 5000000 + 1000000),
    optionsFlow: 'Aggressive CALL buying' as const,
    callPutRatio: parseFloat((Math.random() * 1.5 + 0.8).toFixed(2)),
    unusualActivity: Math.random() > 0.5,
    institutionalBuying: 'Increasing' as const,
    hedgeFundSentiment: 'Bullish' as const,
    insiderTransactions: [
      { date: '2024-11-15', name: 'John Smith', title: 'CEO', type: 'Buy' as const, shares: 10000, price, value: 10000 * price },
      { date: '2024-10-22', name: 'Jane Doe', title: 'CFO', type: 'Buy' as const, shares: 5000, price: price * 0.95, value: 5000 * price * 0.95 },
    ],
    blockTrades: Math.floor(Math.random() * 10 + 1),
    whaleActivity: Math.random() > 0.4,
  });

  // No API key — return mock/default data
  if (!process.env.FINNHUB_API_KEY) {
    const p = mockBase?.price || 100;
    const base = mockBase || buildDefaultStock(symbol, p);
    const detail: StockDetail = {
      ...base,
      description: `${symbol} is a publicly traded company.`,
      website: '',
      ceo: '',
      employees: 0,
      grossMargin: 40,
      operatingMargin: 15,
      netMargin: 10,
      roe: 20,
      debtToEquity: 0.5,
      freeCashFlow: 0,
      forwardPE: (base.pe || 20) * 0.85,
      pegRatio: 1.5,
      dividendYield: 0,
      earningsHistory: [
        { date: 'Q3 2024', actual: 0.42, estimate: 0.38, surprise: 0.04, surprisePercent: 10.5 },
        { date: 'Q2 2024', actual: 0.35, estimate: 0.33, surprise: 0.02, surprisePercent: 6.1 },
        { date: 'Q1 2024', actual: 0.28, estimate: 0.30, surprise: -0.02, surprisePercent: -6.7 },
        { date: 'Q4 2023', actual: 0.20, estimate: 0.22, surprise: -0.02, surprisePercent: -9.1 },
      ],
      news: mockNews,
      smartMoney: buildSmartMoney(p),
      aiExplanation: `${symbol} is being tracked by the AI scanner. Connect your Finnhub API key for real-time analysis.`,
      supportLevels: [p * 0.95, p * 0.90],
      resistanceLevels: [p * 1.05, p * 1.10],
      candles: generateCandles(p),
    };
    return NextResponse.json(detail);
  }

  try {
    const [quote, profile, earnings, financials, recommendations] = await Promise.all([
      getQuote(symbol),
      getCompanyProfile(symbol),
      getEarningsCalendar(symbol),
      getBasicFinancials(symbol),
      getRecommendations(symbol),
    ]);

    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const news = await getCompanyNews(symbol, monthAgo, today);

    const metric = financials?.metric || {};
    const price = (quote?.c > 0 ? quote.c : null) ?? mockBase?.price ?? 100;

    // Calculate scores for live tickers not in mock list
    const rsi = mockBase?.rsi ?? 50;
    const macd = mockBase?.macd ?? 0;
    const ema9 = mockBase?.ema9 ?? price;
    const ema21 = mockBase?.ema21 ?? price;
    const ema50 = mockBase?.ema50 ?? price * 0.97;
    const ema200 = mockBase?.ema200 ?? price * 0.90;
    const vwap = mockBase?.vwap ?? price;
    const relativeVolume = mockBase?.relativeVolume ?? 1.0;
    const atr = mockBase?.atr ?? price * 0.03;
    const pattern = mockBase?.pattern ?? 'Consolidation';

    const revenueGrowth = Number(metric.revenueGrowthQuarterlyYoy) || mockBase?.revenueGrowth || 0;
    const epsGrowth = Number(metric.epsGrowthQuarterlyYoy) || mockBase?.epsGrowth || 0;
    const pe = Number(metric.peTTM) || mockBase?.pe || 0;
    const institutionalOwnership = mockBase?.institutionalOwnership ?? 0;
    const insiderBuying = mockBase?.insiderBuying ?? 'Neutral';
    const analystRating = recommendations ? getAnalystLabel(recommendations) : (mockBase?.analystRating ?? 'Hold');

    const technicalScore = mockBase?.technicalScore ?? calcTechnicalScore({
      rsi, macd, ema9, ema21, ema50, ema200, price, vwap, relativeVolume, atr, pattern,
    });

    const fundamentalScore = mockBase?.fundamentalScore ?? calcFundamentalScore({
      revenueGrowth, epsGrowth, pe, institutionalOwnership, insiderBuying, analystRating,
    });

    const sentimentScore = mockBase?.sentimentScore ?? 55;
    const optionsFlowScore = mockBase?.optionsFlowScore ?? 50;
    const institutionalScore = mockBase?.institutionalScore ?? 50;
    const momentumScore = mockBase?.momentumScore ?? technicalScore;

    const aiScore = mockBase?.aiScore ?? calcFinalAIScore({
      technicalScore, fundamentalScore, sentimentScore, institutionalScore,
      relativeStrengthScore: momentumScore,
      earningsMomentumScore: Math.min(100, Math.max(0, epsGrowth / 2 + 50)),
      volumeScore: Math.min(100, relativeVolume * 40),
      optionsFlowScore,
    });

    const trend = mockBase?.trend ?? getTrend(ema9, ema21, ema50, ema200);
    const buyProbability = mockBase?.buyProbability ?? calcBuyProbability(aiScore, trend);
    const priceTarget = mockBase?.priceTarget ?? (price * 1.15);

    const marketCap = profile?.marketCapitalization
      ? profile.marketCapitalization * 1e6
      : mockBase?.marketCap ?? 0;

    const high52w = Number(metric['52WeekHigh']) || mockBase?.high52w || price * 1.3;
    const low52w = Number(metric['52WeekLow']) || mockBase?.low52w || price * 0.7;
    const volume = quote?.v || mockBase?.volume || 0;
    const avgVolume = mockBase?.avgVolume || (volume > 0 ? volume : 0);

    const detail: StockDetail = {
      ticker: symbol,
      company: profile?.name || mockBase?.company || symbol,
      price,
      change: quote?.d ?? 0,
      changePercent: quote?.dp ?? 0,
      volume,
      avgVolume,
      relativeVolume,
      marketCap,
      sector: profile?.finnhubIndustry || mockBase?.sector || 'Unknown',
      industry: profile?.finnhubIndustry || mockBase?.industry || 'Unknown',
      aiScore,
      technicalScore,
      fundamentalScore,
      sentimentScore,
      momentumScore,
      optionsFlowScore,
      institutionalScore,
      buyProbability,
      pattern,
      trend,
      rsi,
      macd,
      ema9,
      ema21,
      ema50,
      ema200,
      vwap,
      atr,
      shortFloat: mockBase?.shortFloat ?? 0,
      beta: Number(metric.beta) || mockBase?.beta || 1,
      high52w,
      low52w,
      pe,
      eps: Number(metric.epsTTM) || mockBase?.eps || 0,
      revenueGrowth,
      epsGrowth,
      institutionalOwnership,
      insiderBuying,
      analystRating,
      priceTarget,
      // StockDetail extras
      description: profile?.description || '',
      website: profile?.weburl || '',
      ceo: '',
      employees: profile?.employeeTotal || 0,
      grossMargin: Number(metric.grossMarginTTM) || 0,
      operatingMargin: Number(metric.operatingMarginTTM) || 0,
      netMargin: Number(metric.netMarginTTM) || 0,
      roe: Number(metric.roeTTM) || 0,
      debtToEquity: (Number(metric.totalDebt) / Number(metric.totalEquity)) || 0,
      freeCashFlow: Number(metric.freeCashFlowTTM) || 0,
      forwardPE: Number(metric.peExclExtraTTM) || pe * 0.85,
      pegRatio: Number(metric.pegNormalizedAnnual) || 0,
      dividendYield: Number(metric.dividendYieldIndicatedAnnual) || 0,
      earningsHistory: earnings || [],
      news: news.length > 0 ? news : mockNews,
      smartMoney: buildSmartMoney(price),
      aiExplanation: '',
      supportLevels: [price * 0.95, price * 0.90],
      resistanceLevels: [price * 1.05, price * 1.10],
      candles: generateCandles(price),
    };

    return NextResponse.json(detail);
  } catch (err) {
    console.error(`Stock API error for ${symbol}:`, err);
    // Return a safe fallback so the page always renders
    const p = mockBase?.price || 100;
    const base = mockBase || buildDefaultStock(symbol, p);
    const detail: StockDetail = {
      ...base,
      description: '',
      website: '',
      ceo: '',
      employees: 0,
      grossMargin: 0,
      operatingMargin: 0,
      netMargin: 0,
      roe: 0,
      debtToEquity: 0,
      freeCashFlow: 0,
      forwardPE: 0,
      pegRatio: 0,
      dividendYield: 0,
      earningsHistory: [],
      news: mockNews,
      smartMoney: buildSmartMoney(p),
      aiExplanation: '',
      supportLevels: [p * 0.95, p * 0.90],
      resistanceLevels: [p * 1.05, p * 1.10],
      candles: generateCandles(p),
    };
    return NextResponse.json(detail);
  }
}

function buildDefaultStock(symbol: string, price: number) {
  return {
    ticker: symbol,
    company: symbol,
    price,
    change: 0,
    changePercent: 0,
    volume: 0,
    avgVolume: 0,
    relativeVolume: 1.0,
    marketCap: 0,
    sector: 'Unknown',
    industry: 'Unknown',
    aiScore: 50,
    technicalScore: 50,
    fundamentalScore: 50,
    sentimentScore: 50,
    momentumScore: 50,
    optionsFlowScore: 50,
    institutionalScore: 50,
    buyProbability: 50,
    pattern: 'Consolidation',
    trend: 'Neutral' as const,
    rsi: 50,
    macd: 0,
    ema9: price,
    ema21: price,
    ema50: price * 0.97,
    ema200: price * 0.90,
    vwap: price,
    atr: price * 0.03,
    shortFloat: 0,
    beta: 1,
    high52w: price * 1.3,
    low52w: price * 0.7,
    pe: 0,
    eps: 0,
    revenueGrowth: 0,
    epsGrowth: 0,
    institutionalOwnership: 0,
    insiderBuying: 'Neutral' as const,
    analystRating: 'Hold',
    priceTarget: price * 1.15,
  };
}

function getAnalystLabel(rec: { strongBuy: number; buy: number; hold: number; sell: number; strongSell: number }): string {
  const total = rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell;
  if (total === 0) return 'Hold';
  const ratio = (rec.strongBuy + rec.buy) / total;
  if (ratio >= 0.7) return 'Strong Buy';
  if (ratio >= 0.5) return 'Buy';
  if (ratio >= 0.3) return 'Hold';
  return 'Sell';
}
