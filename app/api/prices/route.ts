import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
      { 
        cache: 'no-store',
        next: { revalidate: 60 }
      }
    )

    if (!response.ok) {
      throw new Error('CoinGecko failed')
    }

    const data = await response.json()
    const ethData = data.ethereum

    const prices = [{
      asset: "ethereum",
      price: ethData.usd,
      change24h: ethData.usd_24h_change || 0,
      volume24h: ethData.usd_24h_vol || 0,
      market_cap: ethData.usd_market_cap || 0
    }]

    return NextResponse.json({
      data: prices,
      timestamp: new Date().toISOString(),
      success: true
    })
  } catch (error) {
    console.error("Price fetch error:", error)
    return NextResponse.json({
      data: [{
        asset: "ethereum",
        price: 0,
        change24h: 0,
        volume24h: 0,
        market_cap: 0
      }],
      success: false,
      error: "Could not fetch prices"
    }, { status: 500 })
  }
}
