export const APP_CONFIG = {
  name: "Blockchain Risk & Transparency Dashboard",
  description: "Real-time whale transaction monitoring and market risk assessment",
  url: process.env.NEXT_PUBLIC_API_URL ||
  'https://blockchain-dashboard-api-ujno.onrender.com'; 
}

export const TOKEN_SYMBOLS: Record<string, string> = {
  ethereum: "ETH",
  bitcoin: "BTC",
  tether: "USDT",
  "usd-coin": "USDC",
}

export const EXCHANGE_NAMES: Record<string, string> = {
  binance: "Binance",
  coinbase: "Coinbase",
  kraken: "Kraken",
  okx: "OKX",
  bybit: "Bybit",
}
