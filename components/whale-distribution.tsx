"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import type { WhaleTransfer } from "@/lib/types"

export function WhaleDistribution() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dune/whale-transfers")
        const result = await response.json()

        if (result.success) {
          const transfers: WhaleTransfer[] = result.data

          // Group by token and create distribution buckets
          const tokenGroups = transfers.reduce(
            (acc, transfer) => {
              if (!acc[transfer.token]) {
                acc[transfer.token] = []
              }
              acc[transfer.token].push(transfer.amount)
              return acc
            },
            {} as Record<string, number[]>,
          )

          // Create distribution data
          const distributionData = Object.entries(tokenGroups).map(([token, amounts]) => {
            // Sort amounts
            const sorted = amounts.sort((a, b) => b - a)

            // Calculate percentiles
            const top10 = sorted.slice(0, Math.ceil(sorted.length * 0.1))
            const next40 = sorted.slice(Math.ceil(sorted.length * 0.1), Math.ceil(sorted.length * 0.5))
            const bottom50 = sorted.slice(Math.ceil(sorted.length * 0.5))

            return {
              token,
              "Top 10%": top10.reduce((sum, val) => sum + val, 0),
              "Next 40%": next40.reduce((sum, val) => sum + val, 0),
              "Bottom 50%": bottom50.reduce((sum, val) => sum + val, 0),
            }
          })

          setData(distributionData)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch whale distribution:", error)
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
          <CardTitle>Whale Distribution</CardTitle>
          <CardDescription>Transfer volume by whale size</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading distribution...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Whale Distribution</CardTitle>
        <CardDescription>How transfer volume is distributed across whale sizes</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <YAxis
              type="category"
              dataKey="token"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Token</span>
                          <span className="font-bold text-foreground">{payload[0].payload.token}</span>
                        </div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">{entry.name}</span>
                            <span className="font-bold text-foreground">
                              {Number(entry.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="Top 10%" stackId="a" fill="hsl(var(--chart-5))" />
            <Bar dataKey="Next 40%" stackId="a" fill="hsl(var(--chart-1))" />
            <Bar dataKey="Bottom 50%" stackId="a" fill="hsl(var(--chart-2))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
