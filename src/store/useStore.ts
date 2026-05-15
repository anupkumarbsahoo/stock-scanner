import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Stock, MarketOverview, Alert, WatchlistItem, ScannerFilters } from '@/types';
import { MOCK_MARKET_OVERVIEW, generateAlertsFromStocks } from '@/lib/api/mockData';

const DEFAULT_FILTERS: ScannerFilters = {
  sectors: [],
  minMarketCap: 0,
  maxMarketCap: Infinity,
  minAiScore: 0,
  minRsi: 0,
  maxRsi: 100,
  minRelativeVolume: 0,
  patterns: [],
  trend: [],
  minPrice: 0,
  maxPrice: Infinity,
};

interface AppState {
  stocks: Stock[];
  filteredStocks: Stock[];
  marketOverview: MarketOverview;
  alerts: Alert[];
  watchlist: WatchlistItem[];
  filters: ScannerFilters;
  sortBy: keyof Stock;
  sortDir: 'asc' | 'desc';
  searchQuery: string;
  isLoading: boolean;
  lastUpdated: number;

  setStocks: (stocks: Stock[]) => void;
  setMarketOverview: (overview: MarketOverview) => void;
  addAlert: (alert: Alert) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  isInWatchlist: (ticker: string) => boolean;
  setFilters: (filters: Partial<ScannerFilters>) => void;
  resetFilters: () => void;
  setSortBy: (field: keyof Stock) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  applyFiltersAndSort: () => void;
  unreadAlertCount: () => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      stocks: [],
      filteredStocks: [],
      marketOverview: MOCK_MARKET_OVERVIEW,
      alerts: [],
      watchlist: [],
      filters: DEFAULT_FILTERS,
      sortBy: 'aiScore',
      sortDir: 'desc',
      searchQuery: '',
      isLoading: false,
      lastUpdated: 0,

      setStocks: (stocks) => {
        set({ stocks, lastUpdated: Date.now(), alerts: generateAlertsFromStocks(stocks) });
        get().applyFiltersAndSort();
      },

      setMarketOverview: (overview) => set({ marketOverview: overview }),

      addAlert: (alert) =>
        set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 50) })),

      markAlertRead: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
        })),

      clearAlerts: () => set({ alerts: [] }),

      addToWatchlist: (ticker) => {
        const { watchlist } = get();
        if (!watchlist.find((w) => w.ticker === ticker)) {
          set({ watchlist: [...watchlist, { ticker, addedAt: Date.now() }] });
        }
      },

      removeFromWatchlist: (ticker) =>
        set((state) => ({ watchlist: state.watchlist.filter((w) => w.ticker !== ticker) })),

      isInWatchlist: (ticker) => get().watchlist.some((w) => w.ticker === ticker),

      setFilters: (newFilters) => {
        set((state) => ({ filters: { ...state.filters, ...newFilters } }));
        get().applyFiltersAndSort();
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS, searchQuery: '' });
        get().applyFiltersAndSort();
      },

      setSortBy: (field) => {
        set((state) => ({
          sortBy: field,
          sortDir: state.sortBy === field && state.sortDir === 'desc' ? 'asc' : 'desc',
        }));
        get().applyFiltersAndSort();
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().applyFiltersAndSort();
      },

      setLoading: (loading) => set({ isLoading: loading }),

      applyFiltersAndSort: () => {
        const { stocks, filters, sortBy, sortDir, searchQuery } = get();
        let result = [...stocks];

        // Search filter
        if (searchQuery) {
          const q = searchQuery.toUpperCase();
          result = result.filter(
            (s) =>
              s.ticker.includes(q) ||
              s.company.toUpperCase().includes(q) ||
              s.sector.toUpperCase().includes(q)
          );
        }

        // Apply filters
        if (filters.sectors.length > 0) {
          result = result.filter((s) => filters.sectors.includes(s.sector));
        }
        if (filters.minAiScore > 0) {
          result = result.filter((s) => s.aiScore >= filters.minAiScore);
        }
        if (filters.minRelativeVolume > 0) {
          result = result.filter((s) => s.relativeVolume >= filters.minRelativeVolume);
        }
        if (filters.minRsi > 0 || filters.maxRsi < 100) {
          result = result.filter((s) => s.rsi >= filters.minRsi && s.rsi <= filters.maxRsi);
        }
        if (filters.patterns.length > 0) {
          result = result.filter((s) => filters.patterns.includes(s.pattern));
        }
        if (filters.trend.length > 0) {
          result = result.filter((s) => filters.trend.includes(s.trend));
        }
        if (filters.minPrice > 0 || filters.maxPrice < Infinity) {
          result = result.filter((s) => s.price >= filters.minPrice && s.price <= filters.maxPrice);
        }

        // Sort
        result.sort((a, b) => {
          const aVal = a[sortBy];
          const bVal = b[sortBy];
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
          }
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortDir === 'desc'
              ? bVal.localeCompare(aVal)
              : aVal.localeCompare(bVal);
          }
          return 0;
        });

        set({ filteredStocks: result });
      },

      unreadAlertCount: () => get().alerts.filter((a) => !a.read).length,
    }),
    {
      name: 'stock-scanner-store',
      partialize: (state) => ({
        watchlist: state.watchlist,
        filters: state.filters,
        sortBy: state.sortBy,
        sortDir: state.sortDir,
      }),
    }
  )
);
