"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export function StablecoinFlowChart() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/stablecoins', { cache: 'no-store' })
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching stablecoin data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stablecoin Net Flows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading stablecoin data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const flows = data?.data || []
  
  // Get colors based on theme
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  
  const chartColors = {
    stroke: isDark ? '#9ca3af' : '#6b7280',
    grid: isDark ? '#374151' : '#e5e7eb',
    text: isDark ? '#d1d5db' : '#374151',
    primary: isDark ? '#60a5fa' : '#3b82f6',
    success: isDark ? '#34d399' : '#10b981',
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipBorder: isDark ? '#374151' : '#e5e7eb',
    tooltipText: isDark ? '#f3f4f6' : '#1f2937',
  }

  // Generate chart data for visualization
  const generateChartData = (token: string) => {
    const tokenData = flows.find((f: any) => f.token === token)
    if (!tokenData) return []
    
    return [
      { name: 'Total Flow', value: tokenData.total_flow },
      { name: 'Avg Size', value: tokenData.avg_size },
      { name: 'Tx Count', value: tokenData.transaction_count * 100000 } // Scale for visibility
    ]
  }

  const renderTokenContent = (token: string) => {
    const tokenData = flows.find((f: any) => f.token === token)
    
    if (!tokenData) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No {token} flow data available</p>
        </div>
      )
    }

    const chartData = generateChartData(token)
    const isPositive = tokenData.total_flow > 0

    return (
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 p-4 rounded-lg bg-card border">
            <p className="text-sm text-muted-foreground">Total Flow</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">
                {(tokenData.total_flow || 0).toLocaleString()}
              </p>
              <span className="text-sm text-muted-foreground">{token}</span>
            </div>
            {isPositive ? (
              <div className="flex items-center gap-1 text-green-500 text-xs">
                <ArrowUpRight className="h-3 w-3" />
                <span>Accumulation</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500 text-xs">
                <ArrowDownRight className="h-3 w-3" />
                <span>Distribution</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2 p-4 rounded-lg bg-card border">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold">
              {(tokenData.transaction_count || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total whale transfers</p>
          </div>
          
          <div className="space-y-2 p-4 rounded-lg bg-card border">
            <p className="text-sm text-muted-foreground">Avg Size</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">
                {(tokenData.avg_size || 0).toLocaleString()}
              </p>
              <span className="text-sm text-muted-foreground">{token}</span>
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </div>
        </div>

        <div className="h-64 rounded-lg border bg-card p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis 
                dataKey="name" 
                stroke={chartColors.stroke}
                tick={{ fill: chartColors.text, fontSize: 12 }}
              />
              <YAxis 
                stroke={chartColors.stroke}
                tick={{ fill: chartColors.text, fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                  return value
                }}
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
                formatter={(value: any) => {
                  return [value.toLocaleString(), token]
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stablecoin Net Flows</CardTitle>
        <CardDescription>
          Positive = accumulation (outflow from exchanges), Negative = distribution (inflow to exchanges)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="USDC" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="USDC">USDC</TabsTrigger>
            <TabsTrigger value="USDT">USDT</TabsTrigger>
          </TabsList>
          
          <TabsContent value="USDC" className="space-y-4">
            {renderTokenContent('USDC')}
          </TabsContent>

          <TabsContent value="USDT" className="space-y-4">
            {renderTokenContent('USDT')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
