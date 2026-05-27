import { NextResponse } from 'next/server';
import { MOCK_STOCKS } from '@/lib/api/mockData';
import { GENERATED_STOCKS, EXTENDED_TICKERS } from '@/lib/api/stockUniverse';
import { getQuote, getBasicFinancials } from '@/lib/api/finnhub';
import {
  calcTechnicalScore,
  calcFundamentalScore,
  calcFinalAIScore,
  calcBuyProbability,
  getTrend,
  enhanceStockWithWhaleData,
} from '@/lib/scoring/aiScore';
import { Stock } from '@/types';

// Full ticker universe: 43 hand-crafted + 133 generated = 176+ tickers
const MOCK_TICKERS = MOCK_STOCKS.map((s) => s.ticker);
const SCAN_TICKERS = [...MOCK_TICKERS, ...EXTENDED_TICKERS];

// Combined lookup map: prefer hand-crafted data when available
const ALL_MOCK_STOCKS = [...MOCK_STOCKS, ...GENERATED_STOCKS];
const MOCK_MAP = new Map<string, Stock>(ALL_MOCK_STOCKS.map((s) => [s.ticker, s]));

export async function GET() {
  const hasFinnhubKey = !!process.env.FINNHUB_API_KEY;

  if (!hasFinnhubKey) {
    // Return all mock stocks with whale enhancement applied
    const stocks = ALL_MOCK_STOCKS.map((s) => {
      const randomized = {
        ...s,
        price: parseFloat((s.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2)),
        changePercent: parseFloat((s.changePercent + (Math.random() - 0.5) * 0.1).toFixed(2)),
        relativeVolume: parseFloat((s.relativeVolume + (Math.random() - 0.5) * 0.04).toFixed(2)),
      };
      return enhanceStockWithWhaleData(randomized);
    });
    return NextResponse.json({ stocks, source: 'mock' });
  }

  try {
    const stocks: Stock[] = [];

    // Live-fetch first 10 original tickers to stay within Finnhub free-tier limits
    for (const ticker of MOCK_TICKERS.slice(0, 10)) {
      try {
        const [quote, fundamentals] = await Promise.all([
          getQuote(ticker),
          getBasicFinancials(ticker),
        ]);

        if (!quote || !quote.c) continue;

        const mockBase = MOCK_MAP.get(ticker);
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

        const liveStock: Stock = {
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
        };

        stocks.push(enhanceStockWithWhaleData(liveStock));
      } catch {
        const mockStock = MOCK_MAP.get(ticker);
        if (mockStock) stocks.push(enhanceStockWithWhaleData(mockStock));
      }
    }

    // Add remaining stocks from the full universe (all enhanced)
    for (const stock of ALL_MOCK_STOCKS) {
      if (!stocks.find((s) => s.ticker === stock.ticker)) {
        stocks.push(enhanceStockWithWhaleData(stock));
      }
    }

    return NextResponse.json({ stocks, source: 'live' });
  } catch {
    const fallback = ALL_MOCK_STOCKS.map(enhanceStockWithWhaleData);
    return NextResponse.json({ stocks: fallback, source: 'mock' });
  }
}
