import { NextResponse } from 'next/server';
import { MOCK_STOCKS, generateCandles, generateMockNews } from '@/lib/api/mockData';
import { getQuote, getCompanyProfile, getCompanyNews, getEarningsCalendar, getBasicFinancials, getRecommendations } from '@/lib/api/finnhub';
import { StockDetail } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase();

  const mockBase = MOCK_STOCKS.find((s) => s.ticker === symbol);
  const candles = generateCandles(mockBase?.price || 100);
  const mockNews = generateMockNews(symbol);

  const mockSmartMoney = {
    darkPoolActivity: 'Bullish' as const,
    darkPoolVolume: Math.floor(Math.random() * 5000000 + 1000000),
    optionsFlow: 'Aggressive CALL buying' as const,
    callPutRatio: parseFloat((Math.random() * 1.5 + 0.8).toFixed(2)),
    unusualActivity: Math.random() > 0.5,
    institutionalBuying: 'Increasing' as const,
    hedgeFundSentiment: 'Bullish' as const,
    insiderTransactions: [
      { date: '2024-11-15', name: 'John Smith', title: 'CEO', type: 'Buy' as const, shares: 10000, price: mockBase?.price || 100, value: 10000 * (mockBase?.price || 100) },
      { date: '2024-10-22', name: 'Jane Doe', title: 'CFO', type: 'Buy' as const, shares: 5000, price: (mockBase?.price || 100) * 0.95, value: 5000 * (mockBase?.price || 100) * 0.95 },
    ],
    blockTrades: Math.floor(Math.random() * 10 + 1),
    whaleActivity: Math.random() > 0.4,
  };

  if (!process.env.FINNHUB_API_KEY) {
    const baseStock = mockBase || {
      ticker: symbol, company: symbol, price: 100, change: 0, changePercent: 0,
      volume: 1000000, avgVolume: 1000000, relativeVolume: 1, marketCap: 1000000000,
      sector: 'Technology', industry: 'Technology', aiScore: 65, technicalScore: 65,
      fundamentalScore: 65, sentimentScore: 65, momentumScore: 65, optionsFlowScore: 65,
      institutionalScore: 65, buyProbability: 65, pattern: 'Consolidation', trend: 'Neutral' as const,
      rsi: 50, macd: 0, ema9: 100, ema21: 100, ema50: 100, ema200: 100, vwap: 100, atr: 3,
      shortFloat: 2, beta: 1, high52w: 120, low52w: 80, pe: 25, eps: 4, revenueGrowth: 10,
      epsGrowth: 15, institutionalOwnership: 60, insiderBuying: 'Neutral' as const,
      analystRating: 'Hold', priceTarget: 110,
    };

    const detail: StockDetail = {
      ...baseStock,
      description: `${symbol} is a leading company in its industry.`,
      website: `https://www.${symbol.toLowerCase()}.com`,
      ceo: 'Executive Officer',
      employees: 50000,
      grossMargin: 45,
      operatingMargin: 20,
      netMargin: 15,
      roe: 25,
      debtToEquity: 0.5,
      freeCashFlow: 5000000000,
      forwardPE: (mockBase?.pe || 25) * 0.85,
      pegRatio: 1.5,
      dividendYield: 0.5,
      earningsHistory: [
        { date: 'Q3 2024', actual: 2.10, estimate: 1.95, surprise: 0.15, surprisePercent: 7.7 },
        { date: 'Q2 2024', actual: 1.85, estimate: 1.78, surprise: 0.07, surprisePercent: 3.9 },
        { date: 'Q1 2024', actual: 1.62, estimate: 1.58, surprise: 0.04, surprisePercent: 2.5 },
        { date: 'Q4 2023', actual: 1.45, estimate: 1.50, surprise: -0.05, surprisePercent: -3.3 },
      ],
      news: mockNews,
      smartMoney: mockSmartMoney,
      aiExplanation: `${symbol} is showing a compelling combination of technical strength and fundamental momentum. The stock has been experiencing increased institutional accumulation while technical indicators remain in favorable territory. The EMA structure is aligned bullishly, with relative volume confirming participation. Options flow shows elevated call buying, suggesting smart money is positioning for upside.`,
      supportLevels: [(mockBase?.price || 100) * 0.95, (mockBase?.price || 100) * 0.90],
      resistanceLevels: [(mockBase?.price || 100) * 1.05, (mockBase?.price || 100) * 1.10],
      candles,
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
    const price = quote?.c || mockBase?.price || 100;

    const detail: StockDetail = {
      ...(mockBase || ({} as StockDetail)),
      ticker: symbol,
      price,
      change: quote?.d || 0,
      changePercent: quote?.dp || 0,
      company: profile?.name || symbol,
      description: profile?.description || '',
      website: profile?.weburl || '',
      ceo: '',
      employees: profile?.employeeTotal || 0,
      marketCap: profile?.marketCapitalization ? profile.marketCapitalization * 1e6 : mockBase?.marketCap || 0,
      sector: profile?.finnhubIndustry || mockBase?.sector || 'Technology',
      industry: profile?.finnhubIndustry || mockBase?.industry || 'Technology',
      pe: metric.peTTM || mockBase?.pe || 0,
      eps: metric.epsTTM || mockBase?.eps || 0,
      revenueGrowth: metric.revenueGrowthQuarterlyYoy || mockBase?.revenueGrowth || 0,
      epsGrowth: metric.epsGrowthQuarterlyYoy || mockBase?.epsGrowth || 0,
      grossMargin: metric.grossMarginTTM || 0,
      operatingMargin: metric.operatingMarginTTM || 0,
      netMargin: metric.netMarginTTM || 0,
      roe: metric.roeTTM || 0,
      debtToEquity: metric.totalDebt / metric.totalEquity || 0,
      freeCashFlow: metric.freeCashFlowTTM || 0,
      forwardPE: metric.peExclExtraTTM || mockBase?.pe || 0,
      pegRatio: metric.pegNormalizedAnnual || 0,
      dividendYield: metric.dividendYieldIndicatedAnnual || 0,
      high52w: metric['52WeekHigh'] || mockBase?.high52w || 0,
      low52w: metric['52WeekLow'] || mockBase?.low52w || 0,
      analystRating: recommendations ? getAnalystLabel(recommendations) : mockBase?.analystRating || 'Hold',
      earningsHistory: earnings,
      news: news.length > 0 ? news : mockNews,
      smartMoney: mockSmartMoney,
      aiExplanation: mockBase?.aiScore
        ? `${symbol} presents a strong setup with AI score of ${mockBase.aiScore}. ${profile?.description?.slice(0, 200) || ''}`
        : '',
      supportLevels: [price * 0.95, price * 0.90],
      resistanceLevels: [price * 1.05, price * 1.10],
      candles,
    };

    return NextResponse.json(detail);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}

function getAnalystLabel(rec: { strongBuy: number; buy: number; hold: number; sell: number; strongSell: number }): string {
  const total = rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell;
  if (total === 0) return 'Hold';
  const bullish = rec.strongBuy + rec.buy;
  const ratio = bullish / total;
  if (ratio >= 0.7) return 'Strong Buy';
  if (ratio >= 0.5) return 'Buy';
  if (ratio >= 0.3) return 'Hold';
  return 'Sell';
}
