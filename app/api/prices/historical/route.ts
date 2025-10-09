import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = searchParams.get("days") || "7"

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${days}`,
      { 
        cache: 'no-store',
        next: { revalidate: 300 }
      }
    )

    if (!response.ok) {
      throw new Error('CoinGecko historical API failed')
    }

    const data = await response.json()

    const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp: new Date(timestamp).toISOString(),
      price,
    }))

    return NextResponse.json({
      data: prices,
      asset: "ethereum",
      success: true
    })
  } catch (error) {
    console.error("Historical price fetch error:", error)
    return NextResponse.json({
      data: [],
      success: false,
      error: "Could not fetch historical prices"
    }, { status: 500 })
  }
}
