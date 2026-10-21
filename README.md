# Live Crypto Dashboard
# Live - https://cryptosd.netlify.app/
A real-time cryptocurrency dashboard built with React + TypeScript + Tailwind CSS + Axios + Recharts.

It fetches live data from the CoinGecko API and displays

Price Charts (6H / 24H / 7D, updating live)

Top Market Data (coins, market cap, price changes) 

Optimized with custom hooks, data caching, and interval updates

## Installation
## Clone repo
git clone https://github.com/prisam1/crypto_dashboard.git

cd crypto-dashboard

## Install dependencies
npm install 

## Start development server:
npm start

## Build for production:
npm run build

## Environment Variable(Demo):
To run on your local machine

REACT_APP_API_BASE=https://api.coingecko.com/api/v3

CoinGecko API is public and doesn’t need authentication. 

Optional:

REACT_APP_PRICE_REFRESH_MS=60000 (price refresh interval, minimum 15000)

REACT_APP_API_KEY=your-coingecko-key (sent as x-cg-demo-api-key, or x-cg-pro-api-key when the base URL is pro-api)

## API call budget
Every response is saved (memory + localStorage) and reused:

- Prices: one /coins/markets call for all coins every 60s, only while the tab is visible. Reloading or opening another tab reuses saved data.
- Charts: one /market_chart call per coin per range. 6H and 24H share the same call. The newest part of the chart is filled in live from the price poll, so the chart is only refetched when saved history is old or has gaps.
- Switching coins or ranges uses saved data instantly; no call if it's still fresh.
- Hidden tab or offline: no calls. Failures back off (30s → 10min); after a 429 all requests pause for the cooldown.
- Manual refresh is free if prices are less than 15s old.
- Currency: data is always fetched in USD and converted in the browser using /exchange_rates (one call covers 81 currencies, refreshed every 30 min, only when a non-USD currency is selected). Switching currency costs 0 calls.
- Hard cap: at most 8 calls per minute per tab (REACT_APP_MAX_CALLS_PER_MINUTE); extra requests wait instead of triggering a 429.

Typical use is about 1 call per minute per open tab. Without an API key, CoinGecko's limit applies per visitor's IP. With a Demo key (100 calls/min, 10,000 calls/month), the key ships in the browser bundle and all visitors share its monthly quota.

## Technologies Used
React 19 – UI library

TypeScript – Type safety

Tailwind CSS – Styling

Axios – API requests

Recharts – Charts & graphs

CoinGecko API – Free crypto data

## Features
 Live Price Chart for selected coins

 Auto-refresh every 60s while visible (saved cache minimises API calls)

 Top coins table with market cap, 24h change 

 Responsive UI (desktop + mobile)

 Reusable custom hooks 

## Custom Hook: 
## useCryptoChart
Chart for the selected coin and range (6H / 24H / 7D)

Loads saved history instantly, refetches only when it is stale

Appends live price ticks from the markets poll (no extra calls)

## useCryptoPrices 
To fetch latest price of BTC, ETH, and DOGE coins in one call.

Refreshes every 60s while the tab is visible, and records live ticks for the charts

## services/cache.ts
Persistent cache with in-flight de-duplication, cross-tab sync and validation of saved data

## Helper functions:
format.ts – price / percent / time formatting; series.ts – merges chart history with live ticks

## Dashboard
Live Crypto Dashboard

## THANKS - PRITAM KUMAR SAMADDAR