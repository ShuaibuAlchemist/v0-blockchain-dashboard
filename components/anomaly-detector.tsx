"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Scatter,
  ScatterChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts"
import { useEffect, useState } from "react"
import { TokenSelector } from "./token-selector"
import { AlertTriangle } from "lucide-react"
import { Badge } from "./ui/badge"

export function AnomalyDetector() {
  const [data, setData] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState("ethereum")

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics/correlation?token=${token}&type=anomaly`)
        const result = await response.json()

        if (result.data) {
          // Format data for scatter plot
          const formattedData = result.data.map((item: any, index: number) => ({
            x: index,
            y: item.zScore,
            amount: item.amount,
            date: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            isAnomaly: Math.abs(item.zScore) > 3,
          }))

          setData(formattedData)
          setAnomalies(formattedData.filter((d: any) => d.isAnomaly))
        }
      } catch (error) {
        console.error("[v0] Failed to fetch anomaly data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Anomaly Detection</CardTitle>
            <CardDescription>Unusual whale activity (3σ above normal)</CardDescription>
          </div>
          <TokenSelector value={token} onChange={setToken} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Detecting anomalies...</div>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 rounded-lg bg-muted/30 border">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">
                    {anomalies.length} Anomal{anomalies.length === 1 ? "y" : "ies"} Detected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Whale transfers significantly above normal activity levels
                  </p>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="x"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  hide
                />
                <YAxis
                  dataKey="y"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: "Z-Score", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const point = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                              <span className="font-bold">{point.date}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Amount</span>
                              <span className="font-bold">{point.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Z-Score</span>
                              <span className="font-bold">{point.y.toFixed(2)}σ</span>
                            </div>
                            {point.isAnomaly && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                              >
                                Anomaly
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ReferenceLine y={3} stroke="hsl(var(--chart-5))" strokeDasharray="3 3" />
                <ReferenceLine y={-3} stroke="hsl(var(--chart-5))" strokeDasharray="3 3" />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Scatter
                  data={data}
                  fill="hsl(var(--chart-1))"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={payload.isAnomaly ? 6 : 4}
                        fill={payload.isAnomaly ? "hsl(var(--chart-5))" : "hsl(var(--chart-1))"}
                        opacity={payload.isAnomaly ? 1 : 0.6}
                      />
                    )
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>

            {anomalies.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium">Recent Anomalies</p>
                <div className="grid gap-2">
                  {anomalies.slice(0, 5).map((anomaly, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-yellow-500/5"
                    >
                      <div>
                        <p className="text-sm font-medium">{anomaly.date}</p>
                        <p className="text-xs text-muted-foreground">
                          {anomaly.amount.toLocaleString()} {token.toUpperCase()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        {anomaly.y.toFixed(1)}σ
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
