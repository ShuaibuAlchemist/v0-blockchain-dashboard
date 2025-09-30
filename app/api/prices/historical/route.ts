import { NextResponse } from "next/server"
import { mockHistoricalPrices } from "@/lib/mock-data"

const COINGECKO_BASE = "https://pro-api.coingecko.com/api/v3"
const COINGECKO_API_KEY = process.env.Coingecko_API

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const asset = searchParams.get("asset") || "ethereum"
    const days = searchParams.get("days") || "7"

    const headers: HeadersInit = {}
    if (COINGECKO_API_KEY) {
      headers["x-cg-pro-api-key"] = COINGECKO_API_KEY
    }

    const response = await fetch(`${COINGECKO_BASE}/coins/${asset}/market_chart?vs_currency=usd&days=${days}`, {
      headers,
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      console.error("[v0] CoinGecko historical API error:", response.status)
      return NextResponse.json({
        data: mockHistoricalPrices(asset),
        asset,
        success: true,
        mock: true,
      })
    }

    const data = await response.json()

    const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp: new Date(timestamp).toISOString(),
      price,
    }))

    return NextResponse.json({
      data: prices,
      asset,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Historical prices API error:", error)
    const asset = new URL(request.url).searchParams.get("asset") || "ethereum"
    return NextResponse.json({
      data: mockHistoricalPrices(asset),
      asset,
      success: true,
      mock: true,
    })
  }
}
