# Live Crypto Dashboard
# Live - https://cryptosd.netlify.app/
A real-time cryptocurrency dashboard built with React + TypeScript + Tailwind CSS + Axios + Recharts.

It fetches live data from the CoinGecko API and displays

Price Charts (auto-updating every 30s)

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

## Technologies Used
React 19 – UI library

TypeScript – Type safety

Tailwind CSS – Styling

Axios – API requests

Recharts – Charts & graphs

CoinGecko API – Free crypto data

## Features
 Live Price Chart for selected coins

 Auto-refresh every 30s (with caching to reduce API calls)

 Top coins table with market cap, 24h change 

 Responsive UI (desktop + mobile)

 Reusable custom hooks 

## Custom Hook: 
## useCryptoChart
Fetches 6 hours of chart data on first load

Updates data every 30 seconds

Uses a cache to prevent redundant API calls

Appends only new points (not full reloads)

Safe & incremental updates (with useCallback to stabilize)

## useCryptoPrices 
To fetch latest price of BTC, ETH, and DOGE coins.

30s fixed interval

## Helper function:
formats raw CoinGecko prices into chart data

## Dashboard
Live Crypto Dashboard

## THANKS - PRITAM KUMAR SAMADDAR