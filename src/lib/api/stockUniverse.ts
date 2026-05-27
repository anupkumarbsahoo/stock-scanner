import { Stock } from '@/types';
import {
  calcTechnicalScore,
  calcFundamentalScore,
  calcFinalAIScore,
  calcBuyProbability,
  getTrend,
} from '@/lib/scoring/aiScore';

// Deterministic seeded RNG so each ticker always gets the same "random" values
function seedRandom(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(h ^ seed.charCodeAt(i), 16777619)) >>> 0;
  }
  let s = h;
  return function () {
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b)) >>> 0;
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b)) >>> 0;
    s = (s ^ (s >>> 16)) >>> 0;
    return s / 0x100000000;
  };
}

type InsiderBuying = 'Positive' | 'Neutral' | 'Negative';
type AnalystRating = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell';
type TrendLabel = Stock['trend'];

function generateMockStock(
  ticker: string,
  company: string,
  price: number,
  marketCapB: number,
  sector: string,
  industry: string,
  bias: number // -1 bearish … +1 bullish
): Stock {
  const rng = seedRandom(ticker);

  // Trend from bias + noise
  const trendScore = Math.min(1, Math.max(0, rng() * 0.6 + (bias * 0.25) + 0.2));

  let trend: TrendLabel;
  let rsi: number;
  let macdSign: number;
  let pattern: string;

  if (trendScore > 0.80) {
    trend = 'Strong Bullish';
    rsi = 62 + rng() * 12;
    macdSign = 1;
    pattern = (['Breakout', 'Bull Flag', 'Momentum Squeeze', 'Cup & Handle'] as const)[
      Math.floor(rng() * 4)
    ];
  } else if (trendScore > 0.58) {
    trend = 'Bullish';
    rsi = 54 + rng() * 12;
    macdSign = 1;
    pattern = (['Ascending Triangle', 'EMA Crossover', 'Bull Flag', 'Breakout'] as const)[
      Math.floor(rng() * 4)
    ];
  } else if (trendScore > 0.38) {
    trend = 'Neutral';
    rsi = 44 + rng() * 12;
    macdSign = rng() > 0.5 ? 1 : -1;
    pattern = (['Consolidation', 'Ascending Triangle', 'EMA Crossover'] as const)[
      Math.floor(rng() * 3)
    ];
  } else if (trendScore > 0.18) {
    trend = 'Bearish';
    rsi = 33 + rng() * 12;
    macdSign = -1;
    pattern = ['Consolidation', 'Descending Triangle'][Math.floor(rng() * 2)];
  } else {
    trend = 'Strong Bearish';
    rsi = 22 + rng() * 14;
    macdSign = -1;
    pattern = 'Consolidation';
  }

  const isBullish = trend === 'Bullish' || trend === 'Strong Bullish';
  const isBearish = trend === 'Bearish' || trend === 'Strong Bearish';

  // EMAs with guaranteed ordering per trend
  let ema200: number, ema50: number, ema21: number, ema9: number;
  if (trend === 'Strong Bullish') {
    ema200 = price * (0.80 + rng() * 0.10);
    ema50  = price * (0.91 + rng() * 0.05);
    ema21  = price * (0.96 + rng() * 0.025);
    ema9   = price * (0.99 + rng() * 0.025);
  } else if (trend === 'Bullish') {
    ema200 = price * (0.88 + rng() * 0.06);
    ema50  = price * (0.94 + rng() * 0.03);
    ema21  = price * (0.97 + rng() * 0.02);
    ema9   = price * (0.99 + rng() * 0.02);
  } else if (trend === 'Neutral') {
    ema200 = price * (0.95 + rng() * 0.08);
    ema50  = price * (0.97 + rng() * 0.04);
    ema21  = price * (0.99 + rng() * 0.03);
    ema9   = price * (0.98 + rng() * 0.04);
  } else if (trend === 'Bearish') {
    ema200 = price * (1.03 + rng() * 0.05);
    ema50  = price * (1.01 + rng() * 0.03);
    ema21  = price * (1.00 + rng() * 0.02);
    ema9   = price * (0.97 - rng() * 0.02);
  } else {
    ema200 = price * (1.10 + rng() * 0.10);
    ema50  = price * (1.06 + rng() * 0.05);
    ema21  = price * (1.02 + rng() * 0.03);
    ema9   = price * (0.93 - rng() * 0.05);
  }

  const atr = price * (0.012 + rng() * 0.035);
  const vwap = price * (1 + (rng() - 0.5) * 0.006);
  const macd = macdSign * Math.abs(price * 0.005 * rng() + 0.001);

  // Sector-adjusted volume characteristics
  const sectorRvolBase: Record<string, number> = {
    Technology: 1.30, Healthcare: 1.18, Financials: 1.12,
    Energy: 1.22, 'Consumer Discretionary': 1.15, 'Consumer Staples': 1.08,
    Industrials: 1.12, 'Communication Services': 1.18, Materials: 1.15,
    Utilities: 1.05, 'Real Estate': 1.08,
  };
  const rvBase = sectorRvolBase[sector] ?? 1.1;
  const relativeVolume = parseFloat(
    Math.max(0.5, rvBase + (rng() - 0.35) * 0.7 + (isBullish ? 0.18 : isBearish ? -0.1 : 0)).toFixed(2)
  );
  const avgVolume = Math.floor(800_000 + rng() * 25_000_000);
  const volume = Math.floor(avgVolume * relativeVolume);

  // Fundamentals
  const revenueGrowth = parseFloat(((rng() * 45 - 6) + (isBullish ? 5 : isBearish ? -5 : 0)).toFixed(1));
  const epsGrowth     = parseFloat((revenueGrowth * (0.8 + rng() * 1.4)).toFixed(1));
  const pe            = parseFloat((8 + rng() * 72).toFixed(1));
  const institutionalOwnership = parseFloat((38 + rng() * 52).toFixed(1));
  const insiderBuyingRoll = rng();
  const insiderBuying: InsiderBuying = insiderBuyingRoll > 0.68 ? 'Positive' : insiderBuyingRoll > 0.28 ? 'Neutral' : 'Negative';
  const analystRatingRoll = rng();
  const analystRating: AnalystRating = analystRatingRoll > 0.58 ? 'Strong Buy' : analystRatingRoll > 0.38 ? 'Buy' : analystRatingRoll > 0.18 ? 'Hold' : 'Sell';

  const technicalScore = calcTechnicalScore({ rsi, macd, ema9, ema21, ema50, ema200, price, vwap, relativeVolume, atr, pattern });
  const fundamentalScore = calcFundamentalScore({ revenueGrowth, epsGrowth, pe, institutionalOwnership, insiderBuying, analystRating });

  const sentimentScore   = Math.round(Math.min(100, 40 + rng() * 50 + (isBullish ? 10 : isBearish ? -8 : 0)));
  const momentumScore    = Math.round(Math.min(100, 40 + rng() * 50 + (isBullish ? 10 : isBearish ? -8 : 0)));
  const optionsFlowScore = Math.round(Math.min(100, 38 + rng() * 52 + (isBullish ? 6 : 0)));
  const institutionalScore = Math.round(Math.min(100, 40 + rng() * 50 + (institutionalOwnership > 70 ? 8 : 0)));

  const aiScore = calcFinalAIScore({
    technicalScore,
    fundamentalScore,
    sentimentScore,
    institutionalScore,
    relativeStrengthScore: momentumScore,
    earningsMomentumScore: Math.min(100, epsGrowth / 2 + 50),
    volumeScore: Math.min(100, relativeVolume * 40),
    optionsFlowScore,
  });

  const change        = parseFloat((price * (rng() - 0.5) * 0.08).toFixed(2));
  const changePercent = parseFloat(((change / price) * 100).toFixed(2));
  const high52w       = parseFloat((price * (1.05 + rng() * 0.45)).toFixed(2));
  const low52w        = parseFloat((price * (0.55 + rng() * 0.25)).toFixed(2));
  const priceTarget   = parseFloat((price * (1.10 + rng() * 0.35)).toFixed(2));
  const eps           = parseFloat((price / Math.max(1, pe)).toFixed(2));
  const shortFloat    = parseFloat((rng() * 9).toFixed(1));
  const beta          = parseFloat((0.45 + rng() * 2.1).toFixed(2));

  return {
    ticker, company, price, change, changePercent, volume, avgVolume, relativeVolume,
    marketCap: marketCapB * 1_000_000_000,
    sector, industry, aiScore, technicalScore, fundamentalScore, sentimentScore,
    momentumScore, optionsFlowScore, institutionalScore,
    buyProbability: calcBuyProbability(aiScore, trend),
    pattern, trend: getTrend(ema9, ema21, ema50, ema200),
    rsi: parseFloat(rsi.toFixed(1)),
    macd: parseFloat(macd.toFixed(4)),
    ema9: parseFloat(ema9.toFixed(2)),
    ema21: parseFloat(ema21.toFixed(2)),
    ema50: parseFloat(ema50.toFixed(2)),
    ema200: parseFloat(ema200.toFixed(2)),
    vwap: parseFloat(vwap.toFixed(2)),
    atr: parseFloat(atr.toFixed(2)),
    shortFloat, beta, high52w, low52w, pe,
    eps, revenueGrowth, epsGrowth, institutionalOwnership,
    insiderBuying, analystRating, priceTarget,
  };
}

// ─── Extended Stock Universe ──────────────────────────────────────────────────
// [ticker, company, price, marketCap_billions, sector, industry, bias(-1..+1)]
type StockDef = [string, string, number, number, string, string, number];

const EXTENDED_DEFS: StockDef[] = [
  // ── Technology — Semiconductors ──────────────────────────────────────────
  ['INTC', 'Intel Corporation',               43.5,   185, 'Technology', 'Semiconductors',   -0.3],
  ['QCOM', 'Qualcomm Inc.',                  168.4,   191, 'Technology', 'Semiconductors',    0.2],
  ['TXN',  'Texas Instruments Inc.',         197.2,   179, 'Technology', 'Semiconductors',    0.1],
  ['ARM',  'ARM Holdings plc',               128.5,   134, 'Technology', 'Semiconductors',    0.5],
  ['MRVL', 'Marvell Technology Inc.',         78.4,    67, 'Technology', 'Semiconductors',    0.4],
  ['ON',   'ON Semiconductor Corp.',          72.1,    31, 'Technology', 'Semiconductors',    0.0],
  ['AMAT', 'Applied Materials Inc.',         218.3,   182, 'Technology', 'Semiconductor Equipment', 0.4],
  ['LRCX', 'Lam Research Corp.',             875.2,   118, 'Technology', 'Semiconductor Equipment', 0.3],
  ['KLAC', 'KLA Corporation',                785.0,   108, 'Technology', 'Semiconductor Equipment', 0.4],
  ['NXPI', 'NXP Semiconductors NV',          232.1,    59, 'Technology', 'Semiconductors',    0.1],
  ['MPWR', 'Monolithic Power Systems',        672.0,    31, 'Technology', 'Semiconductors',    0.5],
  // ── Technology — Software & Cloud ────────────────────────────────────────
  ['CSCO', 'Cisco Systems Inc.',              56.2,   230, 'Technology', 'Networking',        0.1],
  ['IBM',  'IBM Corporation',                232.0,   214, 'Technology', 'IT Services',       0.2],
  ['ADBE', 'Adobe Inc.',                     485.0,   213, 'Technology', 'Software',          0.3],
  ['NOW',  'ServiceNow Inc.',               1050.0,   212, 'Technology', 'Software',          0.6],
  ['INTU', 'Intuit Inc.',                    665.0,   186, 'Technology', 'Software',          0.4],
  ['SNOW', 'Snowflake Inc.',                 168.0,    57, 'Technology', 'Cloud Software',    0.2],
  ['DDOG', 'Datadog Inc.',                   148.0,    49, 'Technology', 'Cloud Software',    0.4],
  ['NET',  'Cloudflare Inc.',                106.0,    34, 'Technology', 'Cybersecurity',     0.4],
  ['ZS',   'Zscaler Inc.',                   228.0,    34, 'Technology', 'Cybersecurity',     0.4],
  ['CRWD', 'CrowdStrike Holdings',           398.0,    94, 'Technology', 'Cybersecurity',     0.6],
  ['PANW', 'Palo Alto Networks Inc.',        192.0,    62, 'Technology', 'Cybersecurity',     0.5],
  ['FTNT', 'Fortinet Inc.',                   86.0,    67, 'Technology', 'Cybersecurity',     0.2],
  ['MDB',  'MongoDB Inc.',                   292.0,    21, 'Technology', 'Database Software', 0.3],
  // ── Technology — Fintech & Consumer Tech ────────────────────────────────
  ['COIN', 'Coinbase Global Inc.',           232.0,    57, 'Technology', 'Crypto Exchange',   0.4],
  ['SQ',   'Block Inc.',                      82.0,    49, 'Technology', 'Fintech',           0.0],
  ['PYPL', 'PayPal Holdings Inc.',            82.0,    87, 'Technology', 'Payment Processing', 0.0],
  ['SHOP', 'Shopify Inc.',                    98.0,    83, 'Technology', 'E-Commerce Software', 0.4],
  ['UBER', 'Uber Technologies Inc.',          72.0,   148, 'Technology', 'Ride-Sharing',      0.3],
  // ── Healthcare ───────────────────────────────────────────────────────────
  ['TMO',  'Thermo Fisher Scientific',       558.0,   214, 'Healthcare', 'Life Science Tools', 0.3],
  ['DHR',  'Danaher Corporation',            242.0,   174, 'Healthcare', 'Medical Instruments', 0.3],
  ['ISRG', 'Intuitive Surgical Inc.',        528.0,   186, 'Healthcare', 'Medical Robotics',   0.5],
  ['ABT',  'Abbott Laboratories',            118.0,   205, 'Healthcare', 'Medical Devices',    0.2],
  ['MDT',  'Medtronic plc',                   88.0,   117, 'Healthcare', 'Medical Devices',    0.0],
  ['SYK',  'Stryker Corporation',            398.0,   150, 'Healthcare', 'Medical Devices',    0.4],
  ['BSX',  'Boston Scientific Corp.',          88.0,   125, 'Healthcare', 'Medical Devices',    0.4],
  ['CVS',  'CVS Health Corporation',           68.0,    86, 'Healthcare', 'Pharmacy Retail',   -0.2],
  ['CI',   'Cigna Group',                    348.0,    98, 'Healthcare', 'Managed Care',       0.1],
  ['HCA',  'HCA Healthcare Inc.',            388.0,    97, 'Healthcare', 'Hospital Systems',   0.3],
  ['MRNA', 'Moderna Inc.',                    75.0,    28, 'Healthcare', 'Biotechnology',     -0.3],
  ['BNTX', 'BioNTech SE',                     98.0,    24, 'Healthcare', 'Biotechnology',     -0.1],
  ['GILD', 'Gilead Sciences Inc.',             92.0,   113, 'Healthcare', 'Biopharmaceuticals', 0.1],
  ['REGN', 'Regeneron Pharmaceuticals',     1085.0,   117, 'Healthcare', 'Biopharmaceuticals', 0.4],
  ['VRTX', 'Vertex Pharmaceuticals',         502.0,   129, 'Healthcare', 'Biopharmaceuticals', 0.5],
  ['BMY',  'Bristol-Myers Squibb Co.',        52.0,   105, 'Healthcare', 'Pharmaceuticals',   -0.2],
  ['PFE',  'Pfizer Inc.',                     28.0,   158, 'Healthcare', 'Pharmaceuticals',   -0.4],
  // ── Financials ───────────────────────────────────────────────────────────
  ['BAC',  'Bank of America Corp.',           44.0,   347, 'Financials', 'Banking',            0.2],
  ['C',    'Citigroup Inc.',                   72.0,   138, 'Financials', 'Banking',            0.0],
  ['WFC',  'Wells Fargo & Company',            78.0,   264, 'Financials', 'Banking',            0.2],
  ['USB',  'US Bancorp',                       48.0,    72, 'Financials', 'Banking',            0.0],
  ['SCHW', 'Charles Schwab Corp.',             72.0,   131, 'Financials', 'Brokerage',          0.1],
  ['COF',  'Capital One Financial',           198.0,    72, 'Financials', 'Credit Cards',       0.2],
  ['AXP',  'American Express Company',        278.0,   200, 'Financials', 'Payment Processing', 0.4],
  ['MS',   'Morgan Stanley',                  118.0,   196, 'Financials', 'Investment Banking',  0.3],
  ['PNC',  'PNC Financial Services',          182.0,    72, 'Financials', 'Banking',            0.1],
  ['TFC',  'Truist Financial Corp.',           42.0,    57, 'Financials', 'Banking',           -0.1],
  ['ICE',  'Intercontinental Exchange',       178.0,   101, 'Financials', 'Exchanges',          0.4],
  ['CME',  'CME Group Inc.',                  228.0,    82, 'Financials', 'Exchanges',          0.3],
  ['SPGI', 'S&P Global Inc.',                 525.0,   165, 'Financials', 'Financial Data',     0.4],
  ['MCO',  'Moody\'s Corporation',            482.0,    86, 'Financials', 'Credit Ratings',     0.4],
  ['BX',   'Blackstone Inc.',                 178.0,   118, 'Financials', 'Private Equity',     0.4],
  ['KKR',  'KKR & Co. Inc.',                  148.0,   131, 'Financials', 'Private Equity',     0.5],
  // ── Energy ───────────────────────────────────────────────────────────────
  ['SLB',  'Schlumberger NV',                  48.0,    68, 'Energy', 'Oil Field Services',   0.0],
  ['HAL',  'Halliburton Company',               38.0,    34, 'Energy', 'Oil Field Services',   0.0],
  ['EOG',  'EOG Resources Inc.',               132.0,    79, 'Energy', 'Oil & Gas E&P',        0.2],
  ['COP',  'ConocoPhillips',                   118.0,   143, 'Energy', 'Integrated Oil',       0.2],
  ['MPC',  'Marathon Petroleum Corp.',         158.0,    55, 'Energy', 'Oil Refining',         0.2],
  ['VLO',  'Valero Energy Corp.',              178.0,    68, 'Energy', 'Oil Refining',         0.1],
  ['PSX',  'Phillips 66',                      155.0,    62, 'Energy', 'Oil Refining',         0.1],
  ['DVN',  'Devon Energy Corp.',                42.0,    27, 'Energy', 'Oil & Gas E&P',        0.0],
  ['APA',  'APA Corporation',                   28.0,    10, 'Energy', 'Oil & Gas E&P',       -0.2],
  ['MRO',  'Marathon Oil Corp.',                28.0,    18, 'Energy', 'Oil & Gas E&P',        0.0],
  // ── Industrials ──────────────────────────────────────────────────────────
  ['HON',  'Honeywell International',         228.0,   155, 'Industrials', 'Conglomerate',     0.2],
  ['MMM',  '3M Company',                      132.0,    72, 'Industrials', 'Conglomerate',     0.0],
  ['ITW',  'Illinois Tool Works Inc.',        272.0,    87, 'Industrials', 'Industrial Machinery', 0.3],
  ['EMR',  'Emerson Electric Co.',            118.0,    68, 'Industrials', 'Industrial Automation', 0.2],
  ['ETN',  'Eaton Corporation plc',           345.0,   137, 'Industrials', 'Power Management', 0.4],
  ['PH',   'Parker Hannifin Corp.',           668.0,    86, 'Industrials', 'Motion & Control', 0.3],
  ['ROK',  'Rockwell Automation Inc.',        292.0,    34, 'Industrials', 'Industrial Automation', 0.2],
  ['DOV',  'Dover Corporation',               188.0,    27, 'Industrials', 'Industrial Machinery', 0.2],
  ['FAST', 'Fastenal Company',                 72.0,    41, 'Industrials', 'Industrial Distribution', 0.3],
  ['GWW',  'WW Grainger Inc.',              1195.0,    23, 'Industrials', 'Industrial Distribution', 0.4],
  ['URI',  'United Rentals Inc.',             848.0,    11, 'Industrials', 'Equipment Rental', 0.3],
  ['AME',  'AMETEK Inc.',                     188.0,    43, 'Industrials', 'Electronic Instruments', 0.3],
  // ── Consumer Discretionary ───────────────────────────────────────────────
  ['SBUX', 'Starbucks Corporation',            88.0,    98, 'Consumer Discretionary', 'Restaurants', 0.0],
  ['MCD',  'McDonald\'s Corporation',         298.0,   212, 'Consumer Discretionary', 'Restaurants', 0.2],
  ['YUM',  'Yum! Brands Inc.',                138.0,    38, 'Consumer Discretionary', 'Restaurants', 0.1],
  ['CMG',  'Chipotle Mexican Grill',           58.0,    79, 'Consumer Discretionary', 'Restaurants', 0.3],
  ['DPZ',  'Domino\'s Pizza Inc.',            478.0,    17, 'Consumer Discretionary', 'Restaurants', 0.2],
  ['RCL',  'Royal Caribbean Group',           198.0,    52, 'Consumer Discretionary', 'Cruise Lines', 0.4],
  ['CCL',  'Carnival Corporation',             18.0,    23, 'Consumer Discretionary', 'Cruise Lines', 0.0],
  ['MGM',  'MGM Resorts International',        42.0,    14, 'Consumer Discretionary', 'Casinos',    0.0],
  ['LVS',  'Las Vegas Sands Corp.',            48.0,    37, 'Consumer Discretionary', 'Casinos',    0.1],
  ['MAR',  'Marriott International',          272.0,    88, 'Consumer Discretionary', 'Hotels',     0.3],
  // ── Consumer Staples ─────────────────────────────────────────────────────
  ['KO',   'Coca-Cola Company',                62.0,   268, 'Consumer Staples', 'Beverages',    0.1],
  ['PEP',  'PepsiCo Inc.',                    168.0,   232, 'Consumer Staples', 'Beverages',    0.1],
  ['PM',   'Philip Morris International',     118.0,   183, 'Consumer Staples', 'Tobacco',      0.2],
  ['MO',   'Altria Group Inc.',                48.0,    85, 'Consumer Staples', 'Tobacco',      0.0],
  ['MDLZ', 'Mondelez International',           68.0,    92, 'Consumer Staples', 'Packaged Foods', 0.0],
  ['KHC',  'Kraft Heinz Company',              38.0,    46, 'Consumer Staples', 'Packaged Foods',-0.2],
  ['TSN',  'Tyson Foods Inc.',                 58.0,    21, 'Consumer Staples', 'Packaged Foods', 0.0],
  ['CHD',  'Church & Dwight Co.',              98.0,    23, 'Consumer Staples', 'Household Products', 0.1],
  ['CL',   'Colgate-Palmolive Co.',            88.0,    73, 'Consumer Staples', 'Household Products', 0.1],
  ['KMB',  'Kimberly-Clark Corp.',            132.0,    44, 'Consumer Staples', 'Household Products', 0.1],
  // ── Materials ────────────────────────────────────────────────────────────
  ['APD',  'Air Products & Chemicals',        285.0,    63, 'Materials', 'Industrial Gases',  0.2],
  ['ECL',  'Ecolab Inc.',                     248.0,    71, 'Materials', 'Specialty Chemicals', 0.3],
  ['SHW',  'Sherwin-Williams Co.',            378.0,    96, 'Materials', 'Paints & Coatings', 0.3],
  ['PPG',  'PPG Industries Inc.',             128.0,    30, 'Materials', 'Paints & Coatings', 0.1],
  ['DD',   'DuPont de Nemours Inc.',           88.0,    40, 'Materials', 'Specialty Chemicals', 0.1],
  ['DOW',  'Dow Inc.',                         52.0,    37, 'Materials', 'Commodity Chemicals',-0.1],
  ['NUE',  'Nucor Corporation',               165.0,    20, 'Materials', 'Steel',             0.1],
  ['STLD', 'Steel Dynamics Inc.',             118.0,    18, 'Materials', 'Steel',             0.2],
  // ── Utilities ────────────────────────────────────────────────────────────
  ['SO',   'Southern Company',                 85.0,    93, 'Utilities', 'Electric Utilities', 0.1],
  ['DUK',  'Duke Energy Corporation',         108.0,    83, 'Utilities', 'Electric Utilities', 0.1],
  ['D',    'Dominion Energy Inc.',              55.0,    47, 'Utilities', 'Electric Utilities', 0.0],
  ['AEP',  'American Electric Power',          98.0,    50, 'Utilities', 'Electric Utilities', 0.1],
  ['EXC',  'Exelon Corporation',               42.0,    40, 'Utilities', 'Electric Utilities', 0.0],
  ['PPL',  'PPL Corporation',                   31.0,    21, 'Utilities', 'Electric Utilities', 0.0],
  // ── Communication Services ───────────────────────────────────────────────
  ['T',    'AT&T Inc.',                         22.0,   158, 'Communication Services', 'Telecom', 0.0],
  ['VZ',   'Verizon Communications',            42.0,   176, 'Communication Services', 'Telecom', 0.0],
  ['TMUS', 'T-Mobile US Inc.',                218.0,   254, 'Communication Services', 'Telecom', 0.3],
  ['CHTR', 'Charter Communications',           378.0,    69, 'Communication Services', 'Cable', 0.0],
  ['CMCSA','Comcast Corporation',               38.0,   151, 'Communication Services', 'Cable', 0.0],
  ['PARA', 'Paramount Global',                  11.0,     7, 'Communication Services', 'Media', -0.4],
  ['FOXA', 'Fox Corporation',                   42.0,    24, 'Communication Services', 'Media', 0.0],
  // ── Real Estate ──────────────────────────────────────────────────────────
  ['SPG',  'Simon Property Group Inc.',        165.0,    54, 'Real Estate', 'Retail REITs',   0.2],
  ['PSA',  'Public Storage',                   302.0,    53, 'Real Estate', 'Self-Storage REITs', 0.1],
  ['EQR',  'Equity Residential',                68.0,    26, 'Real Estate', 'Residential REITs', 0.1],
  ['AVB',  'AvalonBay Communities',            218.0,    29, 'Real Estate', 'Residential REITs', 0.2],
  ['VTR',  'Ventas Inc.',                        58.0,    23, 'Real Estate', 'Healthcare REITs', 0.1],
  ['O',    'Realty Income Corporation',          52.0,    44, 'Real Estate', 'Net Lease REITs', 0.1],
  ['DLR',  'Digital Realty Trust Inc.',        152.0,    44, 'Real Estate', 'Data Center REITs', 0.3],
];

export const GENERATED_STOCKS: Stock[] = EXTENDED_DEFS.map(
  ([ticker, company, price, marketCapB, sector, industry, bias]) =>
    generateMockStock(ticker, company, price, marketCapB, sector, industry, bias)
);

export const EXTENDED_TICKERS: string[] = EXTENDED_DEFS.map(([ticker]) => ticker);
