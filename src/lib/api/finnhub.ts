import { Candle, NewsItem, EarningsRecord } from '@/types';

const BASE_URL = 'https://finnhub.io/api/v1';

async function finnhubFetch(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) throw new Error('FINNHUB_API_KEY not configured');

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('token', apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
    headers: { 'User-Agent': 'StockScanner/1.0' },
  });

  if (!res.ok) throw new Error(`Finnhub API error: ${res.status}`);
  return res.json();
}

export async function getQuote(ticker: string) {
  try {
    return await finnhubFetch('/quote', { symbol: ticker });
  } catch {
    return null;
  }
}

export async function getCompanyProfile(ticker: string) {
  try {
    return await finnhubFetch('/stock/profile2', { symbol: ticker });
  } catch {
    return null;
  }
}

export async function getCandles(
  ticker: string,
  resolution: string = 'D',
  from: number,
  to: number
): Promise<Candle[]> {
  try {
    const data = await finnhubFetch('/stock/candle', {
      symbol: ticker,
      resolution,
      from: from.toString(),
      to: to.toString(),
    });

    if (data.s !== 'ok' || !data.t) return [];

    return data.t.map((time: number, i: number) => ({
      time,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  } catch {
    return [];
  }
}

export async function getCompanyNews(ticker: string, from: string, to: string): Promise<NewsItem[]> {
  try {
    const data = await finnhubFetch('/company-news', { symbol: ticker, from, to });
    if (!Array.isArray(data)) return [];

    return data.slice(0, 10).map((item: Record<string, unknown>) => ({
      id: String(item.id),
      headline: String(item.headline || ''),
      summary: String(item.summary || ''),
      source: String(item.source || ''),
      url: String(item.url || ''),
      datetime: Number(item.datetime || 0),
      sentiment: 'Neutral' as NewsItem['sentiment'],
      impactScore: 50,
      category: String(item.category || 'general'),
    }));
  } catch {
    return [];
  }
}

export async function getEarningsCalendar(ticker: string): Promise<EarningsRecord[]> {
  try {
    const data = await finnhubFetch('/stock/earnings', { symbol: ticker });
    if (!Array.isArray(data)) return [];

    return data.slice(0, 8).map((item: Record<string, unknown>) => ({
      date: String(item.period || ''),
      actual: Number(item.actual || 0),
      estimate: Number(item.estimate || 0),
      surprise: Number(item.surprise || 0),
      surprisePercent: Number(item.surprisePercent || 0),
    }));
  } catch {
    return [];
  }
}

export async function getBasicFinancials(ticker: string) {
  try {
    return await finnhubFetch('/stock/metric', { symbol: ticker, metric: 'all' });
  } catch {
    return null;
  }
}

export async function getRecommendations(ticker: string) {
  try {
    const data = await finnhubFetch('/stock/recommendation', { symbol: ticker });
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

export async function getInsiderTransactions(ticker: string) {
  try {
    return await finnhubFetch('/stock/insider-transactions', { symbol: ticker });
  } catch {
    return null;
  }
}

export async function getMarketNews(category = 'general') {
  try {
    return await finnhubFetch('/news', { category });
  } catch {
    return [];
  }
}
