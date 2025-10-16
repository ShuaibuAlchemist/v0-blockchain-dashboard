"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { Wifi, Database, WifiOff } from "lucide-react"

interface FlowChartProps {
  exchange?: string
  token?: string
}

export function FlowChart({ exchange, token }: FlowChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [dataSource, setDataSource] = useState('loading')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await fetch("/api/dune/exchange-flows", { cache: 'no-store' })
        const result = await response.json()

        if (result.success && result.data) {
          let flows = result.data
          
          setDataSource(result.data_source || 'api')
          console.log('Exchange flows data source:', result.data_source)
          console.log('Raw flows:', flows.length)
          console.log('Filtering by:', { exchange, token })

          // Filter by exchange if specified (and not "all")
          if (exchange && exchange !== "all") {
            flows = flows.filter((f: any) => 
              f.exchange.toLowerCase() === exchange.toLowerCase()
            )
            console.log('After exchange filter:', flows.length)
          }

          // Filter by token if specified (and not "all")
          if (token && token !== "all") {
            flows = flows.filter((f: any) => 
              f.token.toLowerCase() === token.toLowerCase()
            )
            console.log('After token filter:', flows.length)
          }

          // Aggregate by week
          const aggregated = flows.reduce(
            (acc: any, flow: any) => {
              const date = new Date(flow.week_start)
              const week = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })

              if (!acc[week]) {
                acc[week] = { week, inflow: 0, outflow: 0, date: date }
              }

              acc[week].inflow += Number(flow.inflow) || 0
              acc[week].outflow += Number(flow.outflow) || 0

              return acc
            },
            {}
          )

          const chartData = Object.values(aggregated)
            .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
            .map(({ date, ...rest }: any) => rest)

          console.log('Chart data:', chartData)
          setData(chartData)
        }
      } catch (error) {
        console.error("Failed to fetch exchange flows:", error)
        setDataSource('error')
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchData()
    }
  }, [exchange, token, mounted])

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  
  const chartColors = {
    grid: isDark ? '#374151' : '#e5e7eb',
    text: isDark ? '#d1d5db' : '#374151',
    inflow: isDark ? '#34d399' : '#10b981',
    outflow: isDark ? '#f87171' : '#ef4444',
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipBorder: isDark ? '#374151' : '#e5e7eb',
  }

  const getDataSourceIcon = () => {
    switch(dataSource) {
      case 'api':
      case 'dune':
        return { icon: Wifi, text: 'LD', color: 'text-green-500' }
      case 'cache':
      case 'mock_initial':
        return { icon: Database, text: 'CD', color: 'text-blue-500' }
      case 'cache_stale':
        return { icon: Database, text: 'SC', color: 'text-yellow-500' }
      case 'mock':
        return { icon: WifiOff, text: 'MD', color: 'text-orange-500' }
      default:
        return { icon: Database, text: '...', color: 'text-gray-500' }
    }
  }

  const sourceInfo = getDataSourceIcon()
  const SourceIcon = sourceInfo.icon

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exchange Flows</CardTitle>
          <CardDescription>Inflow vs Outflow by week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading flow data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exchange Flows</CardTitle>
              <CardDescription>
                {exchange && exchange !== "all" && token && token !== "all"
                  ? `${exchange} - ${token}`
                  : exchange && exchange !== "all"
                  ? exchange
                  : token && token !== "all"
                    ? token
                    : "All exchanges and tokens"}
              </CardDescription>
            </div>
            <div className={`flex items-center gap-1 ${sourceInfo.color}`}>
              <SourceIcon className="h-3 w-3" />
              <span className="text-xs font-mono">{sourceInfo.text}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">No flow data available for the selected filters</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Exchange Flows</CardTitle>
            <CardDescription>
              {exchange && exchange !== "all" && token && token !== "all"
                ? `${exchange} - ${token}`
                : exchange && exchange !== "all"
                ? exchange
                : token && token !== "all"
                  ? token
                  : "All exchanges and tokens"}
            </CardDescription>
          </div>
          <div className={`flex items-center gap-1 ${sourceInfo.color}`}>
            <SourceIcon className="h-3 w-3" />
            <span className="text-xs font-mono">{sourceInfo.text}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.5} />
            <XAxis
              dataKey="week"
              stroke={chartColors.text}
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={chartColors.text}
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
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
                padding: '12px'
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const inflow = Number(payload[0].value) || 0
                  const outflow = Number(payload[1].value) || 0
                  const netFlow = inflow - outflow
                  
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Week</span>
                          <span className="font-bold">{payload[0].payload.week}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-green-500">Inflow</span>
                          <span className="font-bold">
                            {inflow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-red-500">Outflow</span>
                          <span className="font-bold">
                            {outflow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex flex-col pt-2 border-t">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Net Flow</span>
                          <span className={`font-bold ${netFlow > 0 ? "text-red-500" : "text-green-500"}`}>
                            {netFlow > 0 ? '+' : ''}{netFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Bar dataKey="inflow" fill={chartColors.inflow} name="Inflow" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" fill={chartColors.outflow} name="Outflow" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
