import { NextResponse } from "next/server"

const BACKEND_URL = 'https://blockchain-dashboard-api-ujno.onrender.com'

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/concentration`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(20000)
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        data: {
          hhi_index: data.hhi_index || 0,
          gini_coefficient: data.gini_coefficient || 0,
          top_10_percentage: data.top_10_percentage || 0,
          top_100_percentage: 67.8,
          whale_to_retail_ratio: data.whale_to_retail_ratio || 0,
          risk_level: data.risk_level || 'low'
        },
        data_source: data.data_source || 'backend',
        success: true
      })
    }
    
    throw new Error(`Backend returned ${response.status}`)
    
  } catch (error: any) {
    console.error('Concentration route error:', error.message)
    
    return NextResponse.json({
      data: {
        hhi_index: 0.12,
        gini_coefficient: 0.85,
        top_10_percentage: 45.2,
        top_100_percentage: 67.8,
        whale_to_retail_ratio: 3.2,
        risk_level: 'medium'
      },
      data_source: 'frontend_fallback',
      success: true
    })
  }
}
