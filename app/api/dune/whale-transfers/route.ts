import { NextResponse } from "next/server"

const BACKEND_URL = 'https://blockchain-dashboard-api-ujno.onrender.com'

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/whale-transfers`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Backend request failed')
    }

    const backendData = await response.json()
    
    return NextResponse.json({
      data: backendData.transactions || [],
      success: true,
      mock: false
    })
  } catch (error) {
    console.error("[v0] Backend connection error:", error)
    return NextResponse.json({
      data: [],
      success: false,
      error: "Could not connect to backend. Render may be waking up (wait 50 seconds)."
    }, { status: 503 })
  }
}
