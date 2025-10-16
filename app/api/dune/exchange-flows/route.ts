import { NextResponse } from "next/server"

const BACKEND_URL = 'https://blockchain-dashboard-api-ujno.onrender.com'

// Simple in-memory cache
let cachedData: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function generateMockFlows() {
  const exchanges = ["Binance", "Coinbase", "Bitfinex"]
  const tokens = ["USDC", "USDT", "WETH", "WBTC"]
  const flows = []
  
  const now = new Date()
  
  // Generate data for each combination
  for (const exchange of exchanges) {
    for (const token of tokens) {
      // Generate weekly data for the past 8 weeks
      for (let week = 0; week < 8; week++) {
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - (week * 7))
        
        const baseInflow = Math.random() * 3000000 + 1000000 // 1M to 4M
        const baseOutflow = Math.random() * 3000000 + 1000000 // 1M to 4M
        
        flows.push({
          exchange: exchange,
          token: token,
          week_start: weekStart.toISOString(),
          inflow: baseInflow,
          outflow: baseOutflow,
          net_flow: baseOutflow - baseInflow,
          contract_address: ""
        })
      }
    }
  }
  
  return flows
}

export async function GET() {
  try {
    const now = Date.now()
    
    // Check if cache is still valid
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached exchange flows data')
      return NextResponse.json({
        data: cachedData.flows,
        data_source: cachedData.source,
        success: true
      })
    }
    
    // Try to fetch from live backend
    console.log('Attempting to fetch exchange flows from backend...')
    const response = await fetch(`${BACKEND_URL}/api/exchange-flows`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    })
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.flows && data.flows.length > 0) {
        console.log(`SUCCESS: Got ${data.flows.length} flow records from backend`)
        
        // Cache the live data
        cachedData = {
          flows: data.flows,
          source: data.data_source || 'api'
        }
        cacheTimestamp = now
        
        return NextResponse.json({
          data: data.flows,
          data_source: cachedData.source,
          success: true
        })
      }
    }
    
    throw new Error('Backend returned no data')
    
  } catch (error) {
    console.warn('Failed to fetch from backend:', error)
    
    // Check if we have stale cached data
    if (cachedData) {
      console.log('Returning stale cached data')
      return NextResponse.json({
        data: cachedData.flows,
        data_source: 'cache_stale',
        success: true
      })
    }
    
    // Generate mock data as last fallback
    console.log('Generating mock exchange flows data')
    const mockFlows = generateMockFlows()
    
    // Cache the mock data
    cachedData = {
      flows: mockFlows,
      source: 'mock'
    }
    cacheTimestamp = Date.now()
    
    return NextResponse.json({
      data: mockFlows,
      data_source: 'mock',
      success: true
    })
  }
}
