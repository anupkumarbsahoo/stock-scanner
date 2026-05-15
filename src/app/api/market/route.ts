import { NextResponse } from 'next/server';
import { MOCK_MARKET_OVERVIEW } from '@/lib/api/mockData';
import { getQuote } from '@/lib/api/finnhub';
import { MarketOverview } from '@/types';

function getMarketStatus(): MarketOverview['status'] {
  const now = new Date();
  const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = eastern.getDay();
  const hours = eastern.getHours();
  const minutes = eastern.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  if (day === 0 || day === 6) return 'CLOSED';
  if (timeInMinutes >= 570 && timeInMinutes < 930) return 'OPEN';
  if (timeInMinutes >= 240 && timeInMinutes < 570) return 'PRE-MARKET';
  if (timeInMinutes >= 930 && timeInMinutes < 1200) return 'AFTER-HOURS';
  return 'CLOSED';
}

export async function GET() {
  const status = getMarketStatus();

  if (!process.env.FINNHUB_API_KEY) {
    return NextResponse.json({ ...MOCK_MARKET_OVERVIEW, status });
  }

  try {
    const [spy, qqq, dia, vix] = await Promise.all([
      getQuote('SPY'),
      getQuote('QQQ'),
      getQuote('DIA'),
      getQuote('^VIX'),
    ]);

    const overview: MarketOverview = {
      spy: { price: spy?.c || MOCK_MARKET_OVERVIEW.spy.price, change: spy?.d || 0, changePercent: spy?.dp || 0 },
      qqq: { price: qqq?.c || MOCK_MARKET_OVERVIEW.qqq.price, change: qqq?.d || 0, changePercent: qqq?.dp || 0 },
      dia: { price: dia?.c || MOCK_MARKET_OVERVIEW.dia.price, change: dia?.d || 0, changePercent: dia?.dp || 0 },
      vix: { price: vix?.c || MOCK_MARKET_OVERVIEW.vix.price, change: vix?.d || 0, changePercent: vix?.dp || 0 },
      status,
    };

    return NextResponse.json(overview);
  } catch {
    return NextResponse.json({ ...MOCK_MARKET_OVERVIEW, status });
  }
}
