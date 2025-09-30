"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import type { ExchangeFlow } from "@/lib/types"
import { CONTRACT_TO_TOKEN } from "@/lib/types"

interface FlowChartProps {
  exchange?: string
  token?: string
}

export function FlowChart({ exchange, token }: FlowChartProps) {
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

          // Filter by exchange and token if specified
          if (exchange) {
            flows = flows.filter((f) => f.exchange === exchange)
          }
          if (token) {
            flows = flows.filter((f) => f.token === token)
          }

          // Aggregate by week
          const aggregated = flows.reduce(
            (acc, flow) => {
              const week = new Date(flow.week_start).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })

              if (!acc[week]) {
                acc[week] = { week, inflow: 0, outflow: 0 }
              }

              acc[week].inflow += flow.inflow
              acc[week].outflow += flow.outflow

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
        console.error("[v0] Failed to fetch exchange flows:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [exchange, token])

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exchange Flows</CardTitle>
        <CardDescription>
          {exchange && token
            ? `${exchange} - ${token}`
            : exchange
              ? exchange
              : token
                ? token
                : "All exchanges and tokens"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
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
                          <span className="text-[0.70rem] uppercase text-green-500">Inflow</span>
                          <span className="font-bold text-foreground">
                            {Number(payload[0].value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-red-500">Outflow</span>
                          <span className="font-bold text-foreground">
                            {Number(payload[1].value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex flex-col pt-2 border-t">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Net Flow</span>
                          <span
                            className={`font-bold ${Number(payload[0].value) - Number(payload[1].value) > 0 ? "text-red-500" : "text-green-500"}`}
                          >
                            {(Number(payload[0].value) - Number(payload[1].value)).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
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
            <Bar dataKey="inflow" fill="hsl(var(--chart-2))" name="Inflow" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" fill="hsl(var(--chart-5))" name="Outflow" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
