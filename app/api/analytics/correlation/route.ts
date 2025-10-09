import { NextResponse } from "next/server"

const BACKEND_URL = 'https://blockchain-dashboard-api-ujno.onrender.com'

export async function GET() {
  try {
    // First try backend (which tries Dune → cached → mock internally)
    const response = await fetch(`${BACKEND_URL}/api/correlation`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(20000) // 20 second timeout
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        data: data.correlation_data || [],
        average: data.average_correlation || 0,
        data_source: data.data_source || 'backend',
        success: true
      })
    }
    
    throw new Error(`Backend returned ${response.status}`)
    
  } catch (error: any) {
    console.error('Correlation route error:', error.message)
    
    // Last resort fallback if backend is completely down
    const fallbackData = []
    const now = Date.now()
    for (let i = 90; i >= 0; i--) {
      fallbackData.push({
        date: new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        correlation: (Math.random() - 0.5) * 0.6
      })
    }
    
    return NextResponse.json({
      data: fallbackData,
      average: 0.15,
      data_source: 'frontend_fallback',
      success: true
    })
  }
}
