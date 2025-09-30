"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { TokenSelector } from "./token-selector"
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react"
import { Badge } from "./ui/badge"

interface EventResult {
  daysAfter: number
  avgReturn: number
  positiveCount: number
  negativeCount: number
  totalEvents: number
}

export function EventStudy() {
  const [data, setData] = useState<EventResult[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState("ethereum")

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await fetch(`/api/analytics/correlation?token=${token}&type=event`)
        const result = await response.json()

        if (result.data) {
          setData(result.data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch event study data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const getReturnColor = (returnPct: number) => {
    if (returnPct > 2) return "text-green-600 dark:text-green-400"
    if (returnPct > 0) return "text-green-500"
    if (returnPct < -2) return "text-red-600 dark:text-red-400"
    if (returnPct < 0) return "text-red-500"
    return "text-muted-foreground"
  }

  const getReturnIcon = (returnPct: number) => {
    if (returnPct > 0) return <TrendingUp className="h-4 w-4" />
    if (returnPct < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Event Study Analysis</CardTitle>
            <CardDescription>Price returns after large whale movements</CardDescription>
          </div>
          <TokenSelector value={token} onChange={setToken} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Analyzing events...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-chart-1/5 border border-chart-1/20">
              <p className="text-sm leading-relaxed">
                <strong>What this shows:</strong> Average price change after significant whale transfers. Positive
                returns suggest whales are accumulating before price increases. Negative returns suggest distribution
                before declines.
              </p>
            </div>

            <div className="grid gap-4">
              {data.map((event) => (
                <div key={event.daysAfter} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium">
                        {event.daysAfter} Day{event.daysAfter > 1 ? "s" : ""} After
                      </p>
                      <p className="text-xs text-muted-foreground">{event.totalEvents} whale events analyzed</p>
                    </div>
                    <div className={`flex items-center gap-2 ${getReturnColor(event.avgReturn)}`}>
                      {getReturnIcon(event.avgReturn)}
                      <span className="text-2xl font-bold">
                        {event.avgReturn > 0 ? "+" : ""}
                        {event.avgReturn.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        <span className="font-semibold">{event.positiveCount}</span> positive
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm">
                        <span className="font-semibold">{event.negativeCount}</span> negative
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        event.positiveCount > event.negativeCount
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : event.negativeCount > event.positiveCount
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-muted"
                      }
                    >
                      {event.positiveCount > event.negativeCount
                        ? "Bullish"
                        : event.negativeCount > event.positiveCount
                          ? "Bearish"
                          : "Neutral"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
