'use client';

import { useEffect, useRef } from 'react';
import { Candle } from '@/types';

interface TradingChartProps {
  candles: Candle[];
  ticker: string;
  height?: number;
}

export default function TradingChart({ candles, ticker, height = 400 }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return;

    let chart: {
      remove: () => void;
      resize: (w: number, h: number) => void;
      timeScale: () => { fitContent: () => void };
    } | null = null;

    const initChart = async () => {
      const { createChart, CandlestickSeries, HistogramSeries } = await import('lightweight-charts');

      if (!containerRef.current) return;

      chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: height - 80,
        layout: {
          background: { color: 'transparent' },
          textColor: '#9ca3af',
        },
        grid: {
          vertLines: { color: '#1f2937' },
          horzLines: { color: '#1f2937' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#374151',
        },
        timeScale: {
          borderColor: '#374151',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });

      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });

      const candleData = candles.map((c) => ({
        time: c.time as unknown as import('lightweight-charts').Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const volumeData = candles.map((c) => ({
        time: c.time as unknown as import('lightweight-charts').Time,
        value: c.volume,
        color: c.close >= c.open ? '#10b98144' : '#ef444444',
      }));

      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);

      chart.timeScale().fitContent();

      const handleResize = () => {
        if (containerRef.current && chart) {
          chart.resize(containerRef.current.clientWidth, height - 80);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    };

    initChart();

    return () => {
      if (chartRef.current) {
        (chartRef.current as { remove: () => void }).remove();
        chartRef.current = null;
      }
    };
  }, [candles, height]);

  if (candles.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-800/30 rounded-lg border border-gray-700"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-gray-500 text-sm">{ticker} — Chart data loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
      style={{ height }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-sm font-bold text-white">{ticker}</span>
        <span className="text-xs text-gray-500">Daily Chart · 90D</span>
      </div>
      <div ref={containerRef} style={{ height: height - 40 }} />
    </div>
  );
}
