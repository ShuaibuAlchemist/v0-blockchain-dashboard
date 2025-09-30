export interface WhaleTransfer {
  timestamp: string
  tx_hash: string
  from_address: string
  to_address: string
  amount: number
  token: string
}

export interface ExchangeFlow {
  exchange: string
  week_start: string
  inflow: number
  outflow: number
  contract_address: string
}

export interface PriceData {
  asset: string
  price: number
  change24h: number
  volume24h: number
}

export interface HistoricalPrice {
  timestamp: string
  price: number
}

export interface TokenMapping {
  [key: string]: string
}

export const CONTRACT_TO_TOKEN: TokenMapping = {
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH",
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC",
}

export const ASSET_TO_TOKEN: TokenMapping = {
  "usd-coin": "USDC",
  tether: "USDT",
  ethereum: "ETH",
  bitcoin: "BTC",
}

export const TOKEN_TO_ASSET: TokenMapping = {
  USDC: "usd-coin",
  USDT: "tether",
  WETH: "ethereum",
  ETH: "ethereum",
  WBTC: "bitcoin",
  BTC: "bitcoin",
}
