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

const YAHOO_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface ChartMeta {
  regularMarketPrice: number;
  chartPreviousClose: number;
  regularMarketVolume: number;
}

// Yahoo Finance v8/chart works without authentication — cached 15 min on Vercel.
async function fetchChartMeta(ticker: string): Promise<ChartMeta | null> {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d&includePrePost=false`,
      {
        headers: { 'User-Agent': YAHOO_UA, Accept: 'application/json' },
        next: { revalidate: 900 }, // 15-min Vercel Data Cache
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    return meta?.regularMarketPrice ? (meta as ChartMeta) : null;
  } catch {
    return null;
  }
}

// Fetch all tickers in parallel chunks so we stay within the function timeout.
async function fetchAllPrices(tickers: string[]): Promise<Map<string, ChartMeta>> {
  const map = new Map<string, ChartMeta>();
  const CHUNK = 40;

  for (let i = 0; i < tickers.length; i += CHUNK) {
    const chunk = tickers.slice(i, i + CHUNK);
    const results = await Promise.allSettled(
      chunk.map(async (ticker) => ({ ticker, meta: await fetchChartMeta(ticker) }))
    );
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.meta) {
        map.set(r.value.ticker, r.value.meta);
      }
    }
  }

  return map;
}

// Overlay live price onto mock stock, scaling EMAs/ATR proportionally.
function applyLivePrice(mock: Stock, meta: ChartMeta): Stock {
  const price = meta.regularMarketPrice;
  const change = parseFloat((price - meta.chartPreviousClose).toFixed(2));
  const changePercent = parseFloat(((change / meta.chartPreviousClose) * 100).toFixed(2));
  const ratio = price / mock.price;

  return {
    ...mock,
    price,
    change,
    changePercent,
    volume: meta.regularMarketVolume || mock.volume,
    avgVolume: mock.avgVolume,
    relativeVolume: meta.regularMarketVolume
      ? parseFloat((meta.regularMarketVolume / mock.avgVolume).toFixed(2))
      : mock.relativeVolume,
    // Scale technical levels so EMA relationships stay intact relative to price
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

  // ── 1. Fetch live prices from Yahoo Finance (v8/chart, no auth required) ──
  const livePrices = await fetchAllPrices(SCAN_TICKERS);
  const hasLive = livePrices.size > 0;

  // ── 2. Merge live prices into mock stocks ─────────────────────────────────
  const baseStocks: Stock[] = ALL_MOCK_STOCKS.map((mock) => {
    const meta = livePrices.get(mock.ticker);
    return meta ? applyLivePrice(mock, meta) : mock;
  });

  // ── 3. Optionally upgrade fundamentals for top 10 via Finnhub ────────────
  if (hasFinnhubKey) {
    try {
      const finnhubOverrides = new Map<string, Stock>();

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

          const trend = getTrend(
            mockBase.ema9 || quote.c,
            mockBase.ema21 || quote.c,
            mockBase.ema50 || quote.c,
            mockBase.ema200 || quote.c
          );

          finnhubOverrides.set(ticker, {
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
            trend,
            buyProbability: calcBuyProbability(aiScore, trend),
          });
        } catch {
          /* keep Yahoo/mock data for this ticker */
        }
      }

      const stocks = baseStocks.map((s) =>
        enhanceStockWithWhaleData(finnhubOverrides.get(s.ticker) ?? s)
      );
      return NextResponse.json({ stocks, source: hasLive ? 'live' : 'mock' });
    } catch {
      /* fall through */
    }
  }

  // ── 4. No Finnhub key — Yahoo prices only ────────────────────────────────
  const stocks = baseStocks.map(enhanceStockWithWhaleData);
  return NextResponse.json({ stocks, source: hasLive ? 'live' : 'mock' });
}
