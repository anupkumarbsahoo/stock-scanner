'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

export default function StoreInitializer() {
  const setStocks = useStore((s) => s.setStocks);
  const setMarketOverview = useStore((s) => s.setMarketOverview);
  const setLoading = useStore((s) => s.setLoading);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [scannerRes, marketRes] = await Promise.all([
          fetch('/api/scanner'),
          fetch('/api/market'),
        ]);

        if (scannerRes.ok) {
          const { stocks } = await scannerRes.json();
          setStocks(stocks);
        }

        if (marketRes.ok) {
          const overview = await marketRes.json();
          setMarketOverview(overview);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [setStocks, setMarketOverview, setLoading]);

  return null;
}
