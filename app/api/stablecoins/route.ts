import { NextResponse } from "next/server"

const BACKEND_URL = 'https://blockchain-dashboard-api-ujno.onrender.com'

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/stablecoin-flows`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(20000)
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        data: data.stablecoin_flows || [],
        risk_mode: data.risk_mode || 'risk-on',
        ratio: data.stablecoin_ratio || 0,
        data_source: data.data_source || 'backend',
        success: true
      })
    }
    
    throw new Error(`Backend returned ${response.status}`)
    
  } catch (error: any) {
    console.error('Stablecoin route error:', error.message)
    
    return NextResponse.json({
      data: [
        { token: 'USDT', total_flow: 5000000, transaction_count: 15, avg_size: 333333 },
        { token: 'USDC', total_flow: 3500000, transaction_count: 12, avg_size: 291666 }
      ],
      risk_mode: 'risk-on',
      ratio: 0.35,
      data_source: 'frontend_fallback',
      success: true
    })
  }
}
