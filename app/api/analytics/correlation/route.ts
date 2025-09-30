import { NextResponse } from "next/server"
import { rollingCorrelation, eventStudy, detectAnomalies } from "@/lib/calculations/correlation"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token") || "ethereum"
    const analysisType = searchParams.get("type") || "rolling" // rolling, event, anomaly

    const DUNE_API_KEY = process.env.DUNE_API_KEY
    const COINGECKO_API = process.env.Coingecko_API

    if (!DUNE_API_KEY) {
      return NextResponse.json({ error: "DUNE_API_KEY not configured" }, { status: 500 })
    }

    // Fetch whale data and price data in parallel
    const [whaleData, priceData] = await Promise.all([
      fetchWhaleData(DUNE_API_KEY),
      fetchHistoricalPrices(token, COINGECKO_API),
    ])

    // Perform analysis based on type
    let result

    if (analysisType === "rolling") {
      // Merge whale and price data by date
      const mergedData = mergeDailyData(whaleData, priceData)
      result = rollingCorrelation(mergedData, 7)
    } else if (analysisType === "event") {
      result = eventStudy(whaleData, priceData, [1, 3, 7])
    } else if (analysisType === "anomaly") {
      result = detectAnomalies(whaleData, 3)
    }

    return NextResponse.json({
      token,
      analysisType,
      data: result,
    })
  } catch (error) {
    console.error("[v0] Correlation API error:", error)
    return NextResponse.json({ error: "Failed to calculate correlations" }, { status: 500 })
  }
}

async function fetchWhaleData(apiKey: string) {
  const WHALE_QUERY_ID = 5763322

  const executeResponse = await fetch(`https://api.dune.com/api/v1/query/${WHALE_QUERY_ID}/execute`, {
    method: "POST",
    headers: { "x-dune-api-key": apiKey },
  })

  const executeData = await executeResponse.json()
  const executionId = executeData.execution_id

  // Poll for completion
  let status = ""
  let attempts = 0

  while (status !== "QUERY_STATE_COMPLETED" && attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const statusResponse = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/status`, {
      headers: { "x-dune-api-key": apiKey },
    })
    const statusData = await statusResponse.json()
    status = statusData.state
    attempts++
  }

  const resultsResponse = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/results`, {
    headers: { "x-dune-api-key": apiKey },
  })

  const resultsData = await resultsResponse.json()
  return resultsData.result?.rows || []
}

async function fetchHistoricalPrices(token: string, apiKey?: string) {
  const days = 180 // 6 months
  const url = `https://pro-api.coingecko.com/api/v3/coins/${token}/market_chart?vs_currency=usd&days=${days}`

  const headers: HeadersInit = {}
  if (apiKey) {
    headers["x-cg-pro-api-key"] = apiKey
  }

  const response = await fetch(url, { headers })
  const data = await response.json()

  return data.prices.map(([timestamp, price]: [number, number]) => ({
    timestamp: new Date(timestamp),
    price,
  }))
}

function mergeDailyData(whaleData: any[], priceData: Array<{ timestamp: Date; price: number }>) {
  // Group whale transfers by day
  const dailyWhale = new Map<string, number>()

  whaleData.forEach((transfer: any) => {
    const date = new Date(transfer.timestamp).toISOString().split("T")[0]
    const current = dailyWhale.get(date) || 0
    dailyWhale.set(date, current + Number.parseFloat(transfer.amount))
  })

  // Merge with price data
  const merged: Array<{ timestamp: Date; whaleAmount: number; price: number }> = []

  priceData.forEach(({ timestamp, price }) => {
    const date = timestamp.toISOString().split("T")[0]
    const whaleAmount = dailyWhale.get(date) || 0

    merged.push({
      timestamp,
      whaleAmount,
      price,
    })
  })

  return merged
}
