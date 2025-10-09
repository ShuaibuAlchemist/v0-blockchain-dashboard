"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface EventStudyData {
  days_after: number
  avg_return: number
  positive_events: number
  negative_events: number
  total_events: number
  signal: string
}

export function EventStudy() {
  const [data, setData] = useState<EventStudyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Generate mock event study data since we don't have this endpoint yet
        const mockData: EventStudyData[] = [
          {
            days_after: 1,
            avg_return: 0.0,
            positive_events: 0,
            negative_events: 0,
            total_events: 0,
            signal: "neutral"
          },
          {
            days_after: 3,
            avg_return: 0.0,
            positive_events: 0,
            negative_events: 0,
            total_events: 0,
            signal: "neutral"
          },
          {
            days_after: 7,
            avg_return: 0.0,
            positive_events: 0,
            negative_events: 0,
            total_events: 0,
            signal: "neutral"
          }
        ]
        
        setData(mockData)
      } catch (error) {
        console.error('Error fetching event study data:', error)
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
          <CardTitle>Event Study Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading event study data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSignalConfig = (signal: string, avgReturn: number) => {
    if (avgReturn > 0.5) {
      return {
        icon: TrendingUp,
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-950',
        label: 'Bullish'
      }
    } else if (avgReturn < -0.5) {
      return {
        icon: TrendingDown,
        color: 'text-red-600',
        bg: 'bg-red-50 dark:bg-red-950',
        label: 'Bearish'
      }
    } else {
      return {
        icon: Minus,
        color: 'text-gray-600',
        bg: 'bg-gray-50 dark:bg-gray-950',
        label: 'Neutral'
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Study Analysis</CardTitle>
        <CardDescription>Price returns after large whale movements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>What this shows:</strong> Average price change after significant whale transfers. 
            Positive returns suggest whales are accumulating before price increases. Negative returns 
            suggest distribution before declines.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {data.map((event) => {
            const config = getSignalConfig(event.signal, event.avg_return)
            const Icon = config.icon
            const avgReturn = event.avg_return || 0
            const totalEvents = event.total_events || 0
            const positiveEvents = event.positive_events || 0
            const negativeEvents = event.negative_events || 0

            return (
              <Card key={event.days_after} className={config.bg}>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{event.days_after} Day{event.days_after > 1 ? 's' : ''} After</span>
                      <Badge variant={avgReturn > 0 ? 'default' : avgReturn < 0 ? 'destructive' : 'secondary'}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalEvents} whale event{totalEvents !== 1 ? 's' : ''} analyzed
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.bg} border`}>
                      <Icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">
                        {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">{positiveEvents} positive</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">{negativeEvents} negative</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {data.every(d => (d.total_events || 0) === 0) && (
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No significant whale events detected in the analysis period. 
              Event study requires large whale transfers to analyze price impact.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
