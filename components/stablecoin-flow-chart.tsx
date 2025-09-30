"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import type { ExchangeFlow } from "@/lib/types"
import { CONTRACT_TO_TOKEN } from "@/lib/types"

export function StablecoinFlowChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dune/exchange-flows")
        const result = await response.json()

        if (result.success) {
          let flows: ExchangeFlow[] = result.data

          // Map contract addresses to tokens
          flows = flows.map((flow) => ({
            ...flow,
            token: CONTRACT_TO_TOKEN[flow.contract_address.toLowerCase()] || "UNKNOWN",
          }))

          // Filter for stablecoins only
          const stablecoinFlows = flows.filter((f) => f.token === "USDT" || f.token === "USDC")

          // Aggregate by week and token
          const aggregated = stablecoinFlows.reduce(
            (acc, flow) => {
              const week = new Date(flow.week_start).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })

              if (!acc[week]) {
                acc[week] = { week, usdtFlow: 0, usdcFlow: 0 }
              }

              const netFlow = flow.outflow - flow.inflow // Outflow = accumulation (positive)

              if (flow.token === "USDT") {
                acc[week].usdtFlow += netFlow
              } else if (flow.token === "USDC") {
                acc[week].usdcFlow += netFlow
              }

              return acc
            },
            {} as Record<string, any>,
          )

          const chartData = Object.values(aggregated).sort(
            (a: any, b: any) => new Date(a.week).getTime() - new Date(b.week).getTime(),
          )

          setData(chartData)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch stablecoin flows:", error)
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
          <CardTitle>Stablecoin Net Flows</CardTitle>
          <CardDescription>USDT and USDC accumulation trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading stablecoin data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stablecoin Net Flows</CardTitle>
        <CardDescription>Positive = accumulation (outflow), Negative = distribution (inflow)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="usdtGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="usdcGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="week"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Week</span>
                          <span className="font-bold text-foreground">{payload[0].payload.week}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase" style={{ color: "hsl(var(--chart-2))" }}>
                            USDT Net Flow
                          </span>
                          <span className="font-bold text-foreground">
                            {Number(payload[0].value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase" style={{ color: "hsl(var(--chart-3))" }}>
                            USDC Net Flow
                          </span>
                          <span className="font-bold text-foreground">
                            {Number(payload[1].value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
            <Area
              type="monotone"
              dataKey="usdtFlow"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              fill="url(#usdtGradient)"
              name="USDT"
            />
            <Area
              type="monotone"
              dataKey="usdcFlow"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              fill="url(#usdcGradient)"
              name="USDC"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
