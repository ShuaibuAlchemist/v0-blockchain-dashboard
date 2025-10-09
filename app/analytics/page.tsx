"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Activity, Wifi, WifiOff, Database } from "lucide-react"

// Mock data generators
const generateCorrelationData = () => {
  const data = []
  const today = new Date()
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      correlation: (Math.random() - 0.5) * 0.6
    })
  }
  return data
}

const generateEventStudyData = () => {
  return [
    { period: "Day 1", return: Math.random() * 4 - 2 },
    { period: "Day 3", return: Math.random() * 6 - 3 },
    { period: "Day 7", return: Math.random() * 8 - 4 }
  ]
}

const generateAnomalyData = () => {
  const data = []
  const today = new Date()
  // Only 7 days for maximum bar width
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i * 2) // Every 2 days
    const zScore = (Math.random() - 0.5) * 6
    data.push({
      date: date.toISOString().split('T')[0],
      zScore: zScore,
      isAnomaly: Math.abs(zScore) > 3
    })
  }
  return data
}

// Cache management
const CACHE_KEY_CORRELATION = 'analytics_correlation_cache'
const CACHE_KEY_EVENT = 'analytics_event_cache'
const CACHE_KEY_ANOMALY = 'analytics_anomaly_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const saveToCache = (key, data) => {
  try {
    const cacheData = {
      data: data,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(cacheData))
  } catch (e) {
    console.warn('Failed to save to cache:', e)
  }
}

const loadFromCache = (key) => {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    const age = Date.now() - timestamp
    
    return { data, age, isStale: age > CACHE_DURATION }
  } catch (e) {
    console.warn('Failed to load from cache:', e)
    return null
  }
}

export default function AnalyticsPage() {
  const [correlationData, setCorrelationData] = useState([])
  const [eventStudyData, setEventStudyData] = useState([])
  const [anomalyData, setAnomalyData] = useState([])
  const [avgCorrelation, setAvgCorrelation] = useState(0)
  const [dataSource, setDataSource] = useState('loading')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true)
      setError(null)
      
      const API_BASE = 'https://blockchain-dashboard-api-ujno.onrender.com/api'
      
      try {
        console.log('Attempting to fetch from backend...')
        
        const correlationPromise = fetch(`${API_BASE}/correlation`, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10000)
        })
        
        const [correlationRes] = await Promise.all([correlationPromise])
        
        if (correlationRes.ok) {
          const corrData = await correlationRes.json()
          
          if (corrData.correlation_data && corrData.correlation_data.length > 0) {
            setCorrelationData(corrData.correlation_data)
            setAvgCorrelation(corrData.average_correlation || 0)
            
            saveToCache(CACHE_KEY_CORRELATION, corrData.correlation_data)
            
            const eventData = generateEventStudyData()
            const anomData = generateAnomalyData()
            setEventStudyData(eventData)
            setAnomalyData(anomData)
            saveToCache(CACHE_KEY_EVENT, eventData)
            saveToCache(CACHE_KEY_ANOMALY, anomData)
            
            setDataSource(corrData.data_source || 'api')
            setLoading(false)
            return
          }
        }
        
        throw new Error('API returned no data')
        
      } catch (apiError) {
        console.warn('Failed to fetch from API:', apiError.message)
        
        const cachedCorr = loadFromCache(CACHE_KEY_CORRELATION)
        const cachedEvent = loadFromCache(CACHE_KEY_EVENT)
        const cachedAnomaly = loadFromCache(CACHE_KEY_ANOMALY)
        
        if (cachedCorr && cachedEvent && cachedAnomaly) {
          console.log('Loading from localStorage cache')
          setCorrelationData(cachedCorr.data)
          setEventStudyData(cachedEvent.data)
          setAnomalyData(cachedAnomaly.data)
          
          if (cachedCorr.data.length > 0) {
            const avg = cachedCorr.data.reduce((sum, d) => sum + d.correlation, 0) / cachedCorr.data.length
            setAvgCorrelation(avg)
          }
          
          setDataSource(cachedCorr.isStale ? 'cache_stale' : 'cache')
          setLoading(false)
          return
        }
        
        console.log('Generating mock data')
        const corrData = generateCorrelationData()
        const eventData = generateEventStudyData()
        const anomData = generateAnomalyData()
        
        setCorrelationData(corrData)
        setEventStudyData(eventData)
        setAnomalyData(anomData)
        
        const avg = corrData.reduce((sum, d) => sum + d.correlation, 0) / corrData.length
        setAvgCorrelation(avg)
        
        saveToCache(CACHE_KEY_CORRELATION, corrData)
        saveToCache(CACHE_KEY_EVENT, eventData)
        saveToCache(CACHE_KEY_ANOMALY, anomData)
        
        setDataSource('mock')
        // Don't set error for mock data
      }
      
      setLoading(false)
    }

    fetchAnalyticsData()
  }, [])

  const anomalyCount = anomalyData.filter(d => d.isAnomaly).length

  // Get colors based on theme
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  
  const chartColors = {
    stroke: isDark ? '#9ca3af' : '#6b7280',
    grid: isDark ? '#374151' : '#e5e7eb',
    text: isDark ? '#d1d5db' : '#374151',
    primary: isDark ? '#60a5fa' : '#3b82f6',
    secondary: isDark ? '#34d399' : '#10b981',
    tertiary: isDark ? '#fbbf24' : '#f59e0b',
    destructive: isDark ? '#f87171' : '#ef4444',
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipBorder: isDark ? '#374151' : '#e5e7eb',
    tooltipText: isDark ? '#f3f4f6' : '#1f2937',
  }

  if (!mounted) {
    return null
  }

  const getDataSourceInfo = () => {
    switch(dataSource) {
      case 'api':
      case 'dune':
        return { icon: Wifi, text: 'Live Data', color: 'text-green-500' }
      case 'mock_initial':
      case 'cache':
        return { icon: Database, text: 'Cached Data', color: 'text-blue-500' }
      case 'cache_stale':
        return { icon: Database, text: 'Stale Cache', color: 'text-yellow-500' }
      case 'mock':
        return { icon: WifiOff, text: 'Mock Data', color: 'text-orange-500' }
      default:
        return { icon: Activity, text: 'Loading...', color: 'text-gray-500' }
    }
  }

  const sourceInfo = getDataSourceInfo()
  const SourceIcon = sourceInfo.icon

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Predictive Signals</h1>
            <p className="text-muted-foreground">Advanced analytics and correlation analysis</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-muted-foreground">{
              dataSource === 'api' || dataSource === 'dune' ? 'LD' :
              dataSource === 'cache' || dataSource === 'mock_initial' ? 'CD' :
              dataSource === 'cache_stale' ? 'SC' :
              'MD'
            }</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600">
          <AlertTriangle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-card border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Predictive Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Predictive signals help identify whether whale activity leads price movements or simply follows them. These
          metrics combine statistical analysis with market behavior to uncover actionable insights.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Rolling Correlation</h3>
            <p className="text-xs text-muted-foreground">
              Measures the relationship between whale transfer volume and price over time. Positive correlation suggests whales move with the market, while negative correlation indicates contrarian behavior.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Event Study</h3>
            <p className="text-xs text-muted-foreground">
              Analyzes price returns 1, 3, and 7 days after large whale movements. This reveals whether whales are predictive (accumulating before pumps) or reactive (following price action).
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Anomaly Detection</h3>
            <p className="text-xs text-muted-foreground">
              Identifies unusual whale activity using statistical z-scores. Transfers more than 3 standard deviations above normal often precede significant market moves.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Rolling Correlation (30-Day)</h2>
            <p className="text-sm text-muted-foreground">Whale Volume vs ETH Price</p>
          </div>
          <div className="flex items-center gap-2">
            {avgCorrelation > 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Avg Correlation</p>
              <p className="text-2xl font-bold">{avgCorrelation.toFixed(3)}</p>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={correlationData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis 
              dataKey="date" 
              stroke={chartColors.stroke}
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={(value) => {
                try {
                  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                } catch {
                  return value
                }
              }}
            />
            <YAxis 
              stroke={chartColors.stroke}
              tick={{ fill: chartColors.text, fontSize: 12 }}
              domain={[-0.5, 0.5]} 
              tickCount={7} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: chartColors.tooltipBg,
                border: `1px solid ${chartColors.tooltipBorder}`,
                borderRadius: '8px',
                color: chartColors.tooltipText
              }}
              labelStyle={{ color: chartColors.tooltipText }}
              itemStyle={{ color: chartColors.tooltipText }}
              labelFormatter={(value) => {
                try {
                  return new Date(value).toLocaleDateString()
                } catch {
                  return value
                }
              }}
              formatter={(value) => {
                const num = typeof value === 'number' ? value : parseFloat(value) || 0
                return [num.toFixed(3), 'Correlation']
              }}
            />
            <Line 
              type="monotone" 
              dataKey="correlation" 
              stroke={chartColors.primary}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: chartColors.primary, stroke: chartColors.primary }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Event Study Analysis</h2>
            <p className="text-sm text-muted-foreground">Returns After Large Whale Transfers</p>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventStudyData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis 
                dataKey="period" 
                stroke={chartColors.stroke}
                tick={{ fill: chartColors.text, fontSize: 12 }}
              />
              <YAxis 
                stroke={chartColors.stroke}
                tick={{ fill: chartColors.text, fontSize: 12 }}
                label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', style: { fill: chartColors.text } }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartColors.tooltipBg,
                  border: `1px solid ${chartColors.tooltipBorder}`,
                  borderRadius: '8px',
                  color: chartColors.tooltipText
                }}
                labelStyle={{ color: chartColors.tooltipText }}
                itemStyle={{ color: chartColors.tooltipText }}
                formatter={(value) => {
                  const num = typeof value === 'number' ? value : parseFloat(value) || 0
                  return [`${num.toFixed(2)}%`, 'Return']
                }}
              />
              <Bar 
                dataKey="return" 
                fill={chartColors.secondary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
            <Activity className="h-5 w-5 mt-0.5 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Interpretation</p>
              <p className="text-xs text-muted-foreground">
                Positive returns suggest whale activity is predictive of price increases. Negative returns may indicate whales are selling into strength.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Anomaly Detection</h2>
              <p className="text-sm text-muted-foreground">Statistical Outliers (Z-Score)</p>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Anomalies</p>
                <p className="text-2xl font-bold">{anomalyCount}</p>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={anomalyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis className="text-xs" domain={[-4, 4]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name, props) => {
                  const num = typeof value === 'number' ? value : parseFloat(value) || 0
                  return [
                    num.toFixed(2),
                    props.payload.isAnomaly ? 'Anomaly Detected!' : 'Z-Score'
                  ]
                }}
              />
              <Bar 
                dataKey="zScore" 
                radius={[4, 4, 0, 0]}
              >
                {anomalyData.map((entry, index) => (
                  <Bar 
                    key={`cell-${index}`} 
                    fill={entry.isAnomaly ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
            <AlertTriangle className="h-5 w-5 mt-0.5 text-yellow-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Detection Threshold</p>
              <p className="text-xs text-muted-foreground">
                Red bars indicate whale activity more than 3 standard deviations from the mean. These often precede major price movements.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>
          {dataSource === 'api' || dataSource === 'dune' ? 'LD: Live Data' :
           dataSource === 'cache' || dataSource === 'mock_initial' ? 'CD: Cached Data' :
           dataSource === 'cache_stale' ? 'SC: Stale Cache' :
           'MD: Mock Data'}
        </span>
      </div>
    </div>
  )
}
