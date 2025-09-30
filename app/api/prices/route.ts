import { NextResponse } from "next/server"
import { mockPrices } from "@/lib/mock-data"

const COINGECKO_BASE = "https://pro-api.coingecko.com/api/v3"
const COINGECKO_API_KEY = process.env.Coingecko_API

export async function GET() {
  try {
    const assets = ["ethereum", "bitcoin", "tether", "usd-coin"]

    const headers: HeadersInit = {}
    if (COINGECKO_API_KEY) {
      headers["x-cg-pro-api-key"] = COINGECKO_API_KEY
    }

    const response = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${assets.join(",")}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
      {
        headers,
        next: { revalidate: 60 },
      },
    )

    if (!response.ok) {
      console.error("[v0] CoinGecko API error:", response.status)
      return NextResponse.json({
        data: mockPrices,
        timestamp: new Date().toISOString(),
        success: true,
        mock: true,
      })
    }

    const data = await response.json()

    const prices = Object.entries(data).map(([asset, info]: [string, any]) => ({
      asset,
      price: info.usd,
      change24h: info.usd_24h_change || 0,
      volume24h: info.usd_24h_vol || 0,
    }))

    return NextResponse.json({
      data: prices,
      timestamp: new Date().toISOString(),
      success: true,
    })
  } catch (error) {
    console.error("[v0] Prices API error:", error)
    return NextResponse.json({
      data: mockPrices,
      timestamp: new Date().toISOString(),
      success: true,
      mock: true,
    })
  }
}
