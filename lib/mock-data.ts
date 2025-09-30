// Mock data for when APIs fail or rate limits are hit
export const mockPrices = [
  {
    asset: "ethereum",
    price: 3245.67,
    change24h: 2.34,
    volume24h: 15234567890,
  },
  {
    asset: "bitcoin",
    price: 67890.12,
    change24h: -1.23,
    volume24h: 28456789012,
  },
  {
    asset: "tether",
    price: 1.0,
    change24h: 0.01,
    volume24h: 45678901234,
  },
  {
    asset: "usd-coin",
    price: 1.0,
    change24h: -0.01,
    volume24h: 34567890123,
  },
]

export const mockHistoricalPrices = (asset: string) => {
  const basePrice = asset === "ethereum" ? 3200 : asset === "bitcoin" ? 67000 : 1
  const data = []
  const now = Date.now()

  for (let i = 6; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000
    const variation = (Math.random() - 0.5) * 0.1 * basePrice
    data.push({
      timestamp: new Date(timestamp).toISOString(),
      price: basePrice + variation,
    })
  }

  return data
}

export const mockWhaleTransfers = () => {
  const data = []
  const now = Date.now()

  for (let i = 179; i >= 0; i--) {
    const timestamp = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const ethTransfers = Math.floor(Math.random() * 50) + 10
    const usdtTransfers = Math.floor(Math.random() * 30) + 5
    const usdcTransfers = Math.floor(Math.random() * 25) + 5

    data.push({
      date: timestamp,
      eth_transfers: ethTransfers,
      usdt_transfers: usdtTransfers,
      usdc_transfers: usdcTransfers,
      total_value_usd: ethTransfers * 3200 + usdtTransfers * 1000000 + usdcTransfers * 1000000,
    })
  }

  return data
}

export const mockExchangeFlows = () => {
  const data = []
  const now = Date.now()

  for (let i = 179; i >= 0; i--) {
    const timestamp = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const inflow = Math.floor(Math.random() * 100000) + 50000
    const outflow = Math.floor(Math.random() * 100000) + 50000

    data.push({
      date: timestamp,
      inflow_eth: inflow,
      outflow_eth: outflow,
      net_flow: outflow - inflow,
    })
  }

  return data
}
