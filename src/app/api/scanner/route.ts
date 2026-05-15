import { NextResponse } from 'next/server';
import { MOCK_STOCKS } from '@/lib/api/mockData';
import { getQuote, getBasicFinancials } from '@/lib/api/finnhub';
import { calcTechnicalScore, calcFundamentalScore, calcFinalAIScore, calcBuyProbability, getTrend } from '@/lib/scoring/aiScore';
import { Stock } from '@/types';

// Ticker list for scanning
const SCAN_TICKERS = [
  'NVDA', 'MU', 'PLTR', 'META', 'SMCI', 'AMD', 'MSFT', 'TSLA', 'GOOGL', 'AVGO',
  'ORCL', 'CRM', 'INTC', 'QCOM', 'ARM', 'MRVL', 'ON', 'KLAC', 'LRCX', 'AMAT',
];

export async function GET() {
  const hasFinnhubKey = !!process.env.FINNHUB_API_KEY;

  if (!hasFinnhubKey) {
    // Return mock data with slight randomization to simulate live updates
    const stocks = MOCK_STOCKS.map((s) => ({
      ...s,
      price: parseFloat((s.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2)),
      changePercent: parseFloat((s.changePercent + (Math.random() - 0.5) * 0.1).toFixed(2)),
      relativeVolume: parseFloat((s.relativeVolume + (Math.random() - 0.5) * 0.05).toFixed(2)),
    }));
    return NextResponse.json({ stocks, source: 'mock' });
  }

  try {
    const stocks: Stock[] = [];

    // Fetch first batch to stay under rate limits
    for (const ticker of SCAN_TICKERS.slice(0, 10)) {
      try {
        const [quote, fundamentals] = await Promise.all([
          getQuote(ticker),
          getBasicFinancials(ticker),
        ]);

        if (!quote || !quote.c) continue;

        const mockBase = MOCK_STOCKS.find((s) => s.ticker === ticker);
        const metric = fundamentals?.metric || {};

        const technicalScore = calcTechnicalScore({
          rsi: mockBase?.rsi || 50,
          macd: mockBase?.macd || 0,
          ema9: mockBase?.ema9 || quote.c,
          ema21: mockBase?.ema21 || quote.c,
          ema50: mockBase?.ema50 || quote.c,
          ema200: mockBase?.ema200 || quote.c,
          price: quote.c,
          vwap: mockBase?.vwap || quote.c,
          relativeVolume: mockBase?.relativeVolume || 1,
          atr: mockBase?.atr || 0,
          pattern: mockBase?.pattern || 'Consolidation',
        });

        const fundamentalScore = calcFundamentalScore({
          revenueGrowth: metric.revenueGrowthQuarterlyYoy || mockBase?.revenueGrowth || 0,
          epsGrowth: metric.epsGrowthQuarterlyYoy || mockBase?.epsGrowth || 0,
          pe: metric.peTTM || mockBase?.pe || 0,
          institutionalOwnership: mockBase?.institutionalOwnership || 0,
          insiderBuying: mockBase?.insiderBuying || 'Neutral',
          analystRating: mockBase?.analystRating || 'Hold',
        });

        const sentimentScore = mockBase?.sentimentScore || 60;
        const aiScore = calcFinalAIScore({
          technicalScore,
          fundamentalScore,
          sentimentScore,
          institutionalScore: mockBase?.institutionalScore || 60,
          relativeStrengthScore: mockBase?.momentumScore || 60,
          earningsMomentumScore: Math.min(100, (mockBase?.epsGrowth || 0) / 2 + 50),
          volumeScore: mockBase?.relativeVolume ? Math.min(100, mockBase.relativeVolume * 40) : 50,
          optionsFlowScore: mockBase?.optionsFlowScore || 60,
        });

        const trend = getTrend(
          mockBase?.ema9 || quote.c,
          mockBase?.ema21 || quote.c,
          mockBase?.ema50 || quote.c,
          mockBase?.ema200 || quote.c
        );

        stocks.push({
          ...(mockBase || ({} as Stock)),
          ticker,
          price: quote.c,
          change: quote.d || 0,
          changePercent: quote.dp || 0,
          high52w: quote['52WeekHigh'] || mockBase?.high52w || 0,
          low52w: quote['52WeekLow'] || mockBase?.low52w || 0,
          technicalScore,
          fundamentalScore,
          sentimentScore,
          aiScore,
          trend,
          buyProbability: calcBuyProbability(aiScore, trend),
        });
      } catch {
        // Use mock for failed tickers
        const mockStock = MOCK_STOCKS.find((s) => s.ticker === ticker);
        if (mockStock) stocks.push(mockStock);
      }
    }

    // Add remaining mock stocks
    for (const mockStock of MOCK_STOCKS) {
      if (!stocks.find((s) => s.ticker === mockStock.ticker)) {
        stocks.push(mockStock);
      }
    }

    return NextResponse.json({ stocks, source: 'live' });
  } catch {
    return NextResponse.json({ stocks: MOCK_STOCKS, source: 'mock' });
  }
}
