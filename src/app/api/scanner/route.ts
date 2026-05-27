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

const MOCK_TICKERS = MOCK_STOCKS.map((s) => s.ticker);
const SCAN_TICKERS = [...MOCK_TICKERS, ...EXTENDED_TICKERS];

const ALL_MOCK_STOCKS = [...MOCK_STOCKS, ...GENERATED_STOCKS];
const MOCK_MAP = new Map<string, Stock>(ALL_MOCK_STOCKS.map((s) => [s.ticker, s]));

interface YahooQuote {
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  averageDailyVolume3Month: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

// Fetch live prices for up to 175 tickers from Yahoo Finance (free, no key required).
// Vercel caches the fetch response for 15 minutes via the Data Cache.
async function fetchYahooPrices(tickers: string[]): Promise<Map<string, YahooQuote>> {
  const map = new Map<string, YahooQuote>();
  const BATCH = 100;

  for (let i = 0; i < tickers.length; i += BATCH) {
    const symbols = tickers.slice(i, i + BATCH).join(',');
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,averageDailyVolume3Month,marketCap,fiftyTwoWeekHigh,fiftyTwoWeekLow&lang=en-US&region=US`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; stock-scanner/1.0)',
            Accept: 'application/json',
          },
          next: { revalidate: 900 }, // 15-minute Vercel Data Cache
        }
      );
      if (!res.ok) break;
      const json = await res.json();
      for (const q of json?.quoteResponse?.result ?? []) {
        if (q.regularMarketPrice) map.set(q.symbol, q as YahooQuote);
      }
    } catch {
      break;
    }
  }

  return map;
}

// Merge a live Yahoo price into a mock stock, scaling EMAs/ATR proportionally.
function applyLivePrice(mock: Stock, live: YahooQuote): Stock {
  const price = live.regularMarketPrice;
  const ratio = price / mock.price; // scale derived technicals proportionally

  return {
    ...mock,
    price,
    change: parseFloat(live.regularMarketChange.toFixed(2)),
    changePercent: parseFloat(live.regularMarketChangePercent.toFixed(2)),
    volume: live.regularMarketVolume || mock.volume,
    avgVolume: live.averageDailyVolume3Month || mock.avgVolume,
    relativeVolume:
      live.regularMarketVolume && live.averageDailyVolume3Month
        ? parseFloat((live.regularMarketVolume / live.averageDailyVolume3Month).toFixed(2))
        : mock.relativeVolume,
    marketCap: live.marketCap || mock.marketCap,
    high52w: live.fiftyTwoWeekHigh || mock.high52w,
    low52w: live.fiftyTwoWeekLow || mock.low52w,
    // Scale technical levels so their relationship to price stays intact
    ema9: parseFloat((mock.ema9 * ratio).toFixed(2)),
    ema21: parseFloat((mock.ema21 * ratio).toFixed(2)),
    ema50: parseFloat((mock.ema50 * ratio).toFixed(2)),
    ema200: parseFloat((mock.ema200 * ratio).toFixed(2)),
    vwap: parseFloat((mock.vwap * ratio).toFixed(2)),
    atr: parseFloat((mock.atr * ratio).toFixed(2)),
    priceTarget: parseFloat((mock.priceTarget * ratio).toFixed(2)),
  };
}

export async function GET() {
  const hasFinnhubKey = !!process.env.FINNHUB_API_KEY;

  // ── 1. Fetch live prices from Yahoo Finance for the full universe ─────────
  const livePrices = await fetchYahooPrices(SCAN_TICKERS);
  const hasLivePrices = livePrices.size > 0;

  // ── 2. Build base stocks: Yahoo live prices layered over mock data ────────
  const baseStocks: Stock[] = ALL_MOCK_STOCKS.map((mock) => {
    const live = livePrices.get(mock.ticker);
    return live ? applyLivePrice(mock, live) : mock;
  });

  // ── 3. If Finnhub key present, upgrade fundamentals for top 10 tickers ───
  if (hasFinnhubKey) {
    try {
      const liveStocks: Map<string, Stock> = new Map();

      for (const ticker of MOCK_TICKERS.slice(0, 10)) {
        try {
          const [quote, fundamentals] = await Promise.all([
            getQuote(ticker),
            getBasicFinancials(ticker),
          ]);

          if (!quote?.c) continue;

          const mockBase = MOCK_MAP.get(ticker)!;
          const metric = fundamentals?.metric || {};

          const technicalScore = calcTechnicalScore({
            rsi: mockBase.rsi || 50,
            macd: mockBase.macd || 0,
            ema9: mockBase.ema9 || quote.c,
            ema21: mockBase.ema21 || quote.c,
            ema50: mockBase.ema50 || quote.c,
            ema200: mockBase.ema200 || quote.c,
            price: quote.c,
            vwap: mockBase.vwap || quote.c,
            relativeVolume: mockBase.relativeVolume || 1,
            atr: mockBase.atr || 0,
            pattern: mockBase.pattern || 'Consolidation',
          });

          const fundamentalScore = calcFundamentalScore({
            revenueGrowth: metric.revenueGrowthQuarterlyYoy || mockBase.revenueGrowth || 0,
            epsGrowth: metric.epsGrowthQuarterlyYoy || mockBase.epsGrowth || 0,
            pe: metric.peTTM || mockBase.pe || 0,
            institutionalOwnership: mockBase.institutionalOwnership || 0,
            insiderBuying: mockBase.insiderBuying || 'Neutral',
            analystRating: mockBase.analystRating || 'Hold',
          });

          const aiScore = calcFinalAIScore({
            technicalScore,
            fundamentalScore,
            sentimentScore: mockBase.sentimentScore || 60,
            institutionalScore: mockBase.institutionalScore || 60,
            relativeStrengthScore: mockBase.momentumScore || 60,
            earningsMomentumScore: Math.min(100, (mockBase.epsGrowth || 0) / 2 + 50),
            volumeScore: Math.min(100, (mockBase.relativeVolume || 1) * 40),
            optionsFlowScore: mockBase.optionsFlowScore || 60,
          });

          liveStocks.set(ticker, {
            ...mockBase,
            ticker,
            price: quote.c,
            change: quote.d || 0,
            changePercent: quote.dp || 0,
            high52w: quote['52WeekHigh'] || mockBase.high52w || 0,
            low52w: quote['52WeekLow'] || mockBase.low52w || 0,
            technicalScore,
            fundamentalScore,
            sentimentScore: mockBase.sentimentScore || 60,
            aiScore,
            trend: getTrend(
              mockBase.ema9 || quote.c,
              mockBase.ema21 || quote.c,
              mockBase.ema50 || quote.c,
              mockBase.ema200 || quote.c
            ),
            buyProbability: calcBuyProbability(aiScore, getTrend(
              mockBase.ema9 || quote.c,
              mockBase.ema21 || quote.c,
              mockBase.ema50 || quote.c,
              mockBase.ema200 || quote.c
            )),
          });
        } catch {
          // keep Yahoo/mock data for this ticker
        }
      }

      const stocks = baseStocks.map((s) => {
        const finnhubStock = liveStocks.get(s.ticker);
        return enhanceStockWithWhaleData(finnhubStock || s);
      });

      return NextResponse.json({ stocks, source: hasLivePrices ? 'live' : 'mock' });
    } catch {
      // fall through to Yahoo-only path
    }
  }

  // ── 4. No Finnhub key — use Yahoo prices over mock data ──────────────────
  const stocks = baseStocks.map((s) => enhanceStockWithWhaleData(s));
  return NextResponse.json({ stocks, source: hasLivePrices ? 'live' : 'mock' });
}
