"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { calculateHHI, calculateGini } from "@/lib/utils/calculations"
import type { WhaleTransfer } from "@/lib/types"
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"

export function ConcentrationMetrics() {
  const [metrics, setMetrics] = useState<{
    hhi: number
    gini: number
    hhi_level: "low" | "medium" | "high"
    gini_level: "low" | "medium" | "high"
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dune/whale-transfers")
        const result = await response.json()

        if (result.success) {
          const transfers: WhaleTransfer[] = result.data

          // Extract amounts for calculation
          const amounts = transfers.map((t) => t.amount)

          // Calculate metrics
          const hhi = calculateHHI(amounts)
          const gini = calculateGini(amounts)

          // Determine risk levels
          const hhi_level = hhi > 2500 ? "high" : hhi > 1500 ? "medium" : "low"
          const gini_level = gini > 0.6 ? "high" : gini > 0.4 ? "medium" : "low"

          setMetrics({
            hhi,
            gini,
            hhi_level,
            gini_level,
          })
        }
      } catch (error) {
        console.error("[v0] Failed to fetch concentration metrics:", error)
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
          <CardTitle>Concentration Metrics</CardTitle>
          <CardDescription>Whale dominance and market transparency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-sm text-muted-foreground">Calculating metrics...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) return null

  const getIcon = (level: "low" | "medium" | "high") => {
    return level === "high" ? AlertTriangle : level === "medium" ? AlertCircle : CheckCircle
  }

  const getColor = (level: "low" | "medium" | "high") => {
    return level === "high" ? "text-red-500" : level === "medium" ? "text-yellow-500" : "text-green-500"
  }

  const getBadgeClass = (level: "low" | "medium" | "high") => {
    return level === "high"
      ? "bg-red-500/10 text-red-500 border-red-500/20"
      : level === "medium"
        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        : "bg-green-500/10 text-green-500 border-green-500/20"
  }

  const HHIIcon = getIcon(metrics.hhi_level)
  const GiniIcon = getIcon(metrics.gini_level)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Concentration Metrics</CardTitle>
        <CardDescription>Whale dominance and market transparency indicators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* HHI Metric */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Herfindahl-Hirschman Index</p>
                <p className="text-xs text-muted-foreground">Market concentration</p>
              </div>
              <HHIIcon className={`h-5 w-5 ${getColor(metrics.hhi_level)}`} />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{metrics.hhi}</span>
                <Badge variant="outline" className={getBadgeClass(metrics.hhi_level)}>
                  {metrics.hhi_level.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${metrics.hhi_level === "high" ? "bg-red-500" : metrics.hhi_level === "medium" ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min((metrics.hhi / 10000) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>10,000</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              {metrics.hhi_level === "high" && "High concentration - few whales dominate transfers"}
              {metrics.hhi_level === "medium" && "Moderate concentration - balanced whale activity"}
              {metrics.hhi_level === "low" && "Low concentration - distributed whale activity"}
            </div>
          </div>

          {/* Gini Coefficient */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Gini Coefficient</p>
                <p className="text-xs text-muted-foreground">Wealth inequality</p>
              </div>
              <GiniIcon className={`h-5 w-5 ${getColor(metrics.gini_level)}`} />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{metrics.gini.toFixed(3)}</span>
                <Badge variant="outline" className={getBadgeClass(metrics.gini_level)}>
                  {metrics.gini_level.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${metrics.gini_level === "high" ? "bg-red-500" : metrics.gini_level === "medium" ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${metrics.gini * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.0</span>
                  <span>1.0</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              {metrics.gini_level === "high" && "High inequality - wealth concentrated in few wallets"}
              {metrics.gini_level === "medium" && "Moderate inequality - somewhat balanced distribution"}
              {metrics.gini_level === "low" && "Low inequality - well-distributed whale activity"}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-chart-1/5 border border-chart-1/20">
          <p className="text-sm leading-relaxed">
            <strong>Interpretation:</strong> Lower values indicate healthier, more transparent markets with distributed
            whale activity. Higher values suggest concentration risk where few large players dominate, potentially
            leading to market manipulation or sudden volatility.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
