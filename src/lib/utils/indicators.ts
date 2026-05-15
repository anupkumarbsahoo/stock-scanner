import { Candle } from '@/types';

export function calcEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prev = prices[0];
  for (const price of prices) {
    const current = price * k + prev * (1 - k);
    ema.push(current);
    prev = current;
  }
  return ema;
}

export function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;
  const changes = prices.slice(1).map((p, i) => p - prices[i]);
  const gains = changes.map((c) => (c > 0 ? c : 0));
  const losses = changes.map((c) => (c < 0 ? -c : 0));

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calcMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };
  const ema12 = calcEMA(prices, 12);
  const ema26 = calcEMA(prices, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calcEMA(macdLine, 9);
  const last = prices.length - 1;
  return {
    macd: macdLine[last],
    signal: signalLine[last],
    histogram: macdLine[last] - signalLine[last],
  };
}

export function calcVWAP(candles: Candle[]): number {
  let totalPV = 0;
  let totalV = 0;
  for (const c of candles) {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    totalPV += typicalPrice * c.volume;
    totalV += c.volume;
  }
  return totalV === 0 ? 0 : totalPV / totalV;
}

export function calcATR(candles: Candle[], period = 14): number {
  if (candles.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    trs.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }
  const recent = trs.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

export function detectPattern(candles: Candle[]): string {
  if (candles.length < 20) return 'Insufficient Data';
  const closes = candles.map((c) => c.close);
  const last = closes[closes.length - 1];
  const ema9 = calcEMA(closes, 9);
  const ema21 = calcEMA(closes, 21);
  const ema50 = calcEMA(closes, 50);

  const lastEma9 = ema9[ema9.length - 1];
  const lastEma21 = ema21[ema21.length - 1];
  const lastEma50 = ema50[ema50.length - 1];

  const volumes = candles.map((c) => c.volume);
  const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const lastVol = volumes[volumes.length - 1];
  const volSurge = lastVol > avgVol * 1.5;

  const recent20 = closes.slice(-20);
  const max20 = Math.max(...recent20);
  const min20 = Math.min(...recent20);
  const range = max20 - min20;

  if (lastEma9 > lastEma21 && lastEma21 > lastEma50 && last > max20 * 0.98 && volSurge) {
    return 'Breakout';
  }
  if (lastEma9 > lastEma21 && lastEma21 > lastEma50) {
    const midRange = min20 + range * 0.5;
    if (last > midRange && closes[closes.length - 5] < midRange) {
      return 'Bull Flag';
    }
    return 'EMA Crossover';
  }
  if (last > max20 * 0.97 && min20 < max20 * 0.85) {
    return 'Cup & Handle';
  }
  if (range < closes[closes.length - 1] * 0.05) {
    return 'Momentum Squeeze';
  }
  const recentHighs = candles.slice(-10).map((c) => c.high);
  if (recentHighs.every((h, i) => i === 0 || h >= recentHighs[i - 1])) {
    return 'Ascending Triangle';
  }
  return 'Consolidation';
}

export function calcRelativeStrength(stockReturns: number[], marketReturns: number[]): number {
  if (stockReturns.length === 0 || marketReturns.length === 0) return 50;
  const stockPerf = stockReturns.reduce((a, b) => a + b, 0);
  const marketPerf = marketReturns.reduce((a, b) => a + b, 0);
  const rs = stockPerf - marketPerf;
  return Math.min(100, Math.max(0, 50 + rs * 5));
}
