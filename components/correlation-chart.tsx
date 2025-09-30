"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts"
import { useEffect, useState } from "react"
import { TokenSelector } from "./token-selector"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function CorrelationChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState("ethereum")
  const [avgCorrelation, setAvgCorrelation] = useState(0)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics/correlation?token=${token}&type=rolling`)
        const result = await response.json()

        if (result.data) {
          const formattedData = result.data.map((item: any) => ({
            date: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            correlation: item.correlation,
          }))

          setData(formattedData)

          // Calculate average correlation
          const avg = formattedData.reduce((sum: number, item: any) => sum + item.correlation, 0) / formattedData.length
          setAvgCorrelation(avg)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch correlation data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const getCorrelationStrength = (corr: number) => {
    const abs = Math.abs(corr)
    if (abs > 0.7) return "Strong"
    if (abs > 0.4) return "Moderate"
    if (abs > 0.2) return "Weak"
    return "Very Weak"
  }

  const getCorrelationIcon = () => {
    if (avgCorrelation > 0.2) return <TrendingUp className="h-5 w-5 text-green-500" />
    if (avgCorrelation < -0.2) return <TrendingDown className="h-5 w-5 text-red-500" />
    return <Minus className="h-5 w-5 text-muted-foreground" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Rolling Correlation</CardTitle>
            <CardDescription>7-day correlation between whale activity and price</CardDescription>
          </div>
          <TokenSelector value={token} onChange={setToken} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Calculating correlations...</div>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 rounded-lg bg-muted/30 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Correlation</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{avgCorrelation.toFixed(3)}</span>
                    {getCorrelationIcon()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{getCorrelationStrength(avgCorrelation)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-2">Interpretation</p>
                  <p className="text-sm max-w-xs">
                    {avgCorrelation > 0.2
                      ? "Whale activity tends to move with price"
                      : avgCorrelation < -0.2
                        ? "Whale activity moves opposite to price"
                        : "Weak relationship between whales and price"}
                  </p>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
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
                  domain={[-1, 1]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const corr = payload[0].value as number
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                              <span className="font-bold">{payload[0].payload.date}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Correlation</span>
                              <span className="font-bold">{corr.toFixed(3)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Strength</span>
                              <span className="text-sm">{getCorrelationStrength(corr)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="correlation"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}
