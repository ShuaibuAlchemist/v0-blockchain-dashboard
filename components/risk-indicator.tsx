"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"

export function RiskIndicator() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/stablecoins', { cache: 'no-store' })
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching risk data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Appetite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Loading risk data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const riskMode = data?.risk_mode || 'risk-on'
  const ratio = data?.ratio || 0

  const getRiskConfig = () => {
    if (riskMode === 'risk-off') {
      return {
        label: 'Risk-Off Mode',
        badgeVariant: 'destructive' as const,
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950',
        description: 'High stablecoin inflows suggest whales rotating to safety'
      }
    } else if (riskMode === 'neutral') {
      return {
        label: 'Neutral Mode',
        badgeVariant: 'secondary' as const,
        icon: Minus,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
        description: 'Balanced activity between crypto and stablecoins'
      }
    } else {
      return {
        label: 'Risk-On Mode',
        badgeVariant: 'default' as const,
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950',
        description: 'Low stablecoin inflows suggest confidence in crypto assets'
      }
    }
  }

  const config = getRiskConfig()
  const Icon = config.icon

  return (
    <Card className={config.bgColor}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Risk Appetite</span>
          <Badge variant={config.badgeVariant}>
            {ratio > 0.6 ? 'HIGH RISK' : ratio > 0.4 ? 'MEDIUM RISK' : 'LOW RISK'}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Whale sentiment based on stablecoin rotation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${config.bgColor} border-2`}>
            <Icon className={`h-8 w-8 ${config.color}`} />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{config.label}</p>
            <p className="text-sm text-muted-foreground">Current Mode</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stablecoin Inflow Ratio</span>
            <span className="text-2xl font-bold">{(ratio * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div 
              className={`h-full rounded-full transition-all ${
                ratio > 0.6 ? 'bg-red-500' : ratio > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(ratio * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
