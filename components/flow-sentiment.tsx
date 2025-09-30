"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { TrendingDown, TrendingUp, Minus, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { calculateNetFlow, getFlowSentiment } from "@/lib/utils/calculations"
import type { ExchangeFlow } from "@/lib/types"
import { CONTRACT_TO_TOKEN } from "@/lib/types"

export function FlowSentiment() {
  const [sentiment, setSentiment] = useState<{
    sentiment: "bullish" | "bearish" | "neutral"
    label: string
    netFlow: number
    totalInflow: number
    totalOutflow: number
  } | null>(null)
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

          const netFlow = calculateNetFlow(flows)
          const totalInflow = flows.reduce((sum, f) => sum + f.inflow, 0)
          const totalOutflow = flows.reduce((sum, f) => sum + f.outflow, 0)
          const sentimentData = getFlowSentiment(netFlow)

          setSentiment({
            ...sentimentData,
            netFlow,
            totalInflow,
            totalOutflow,
          })
        }
      } catch (error) {
        console.error("[v0] Failed to fetch sentiment:", error)
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
          <CardTitle>Market Sentiment</CardTitle>
          <CardDescription>Based on exchange flows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-sm text-muted-foreground">Analyzing sentiment...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!sentiment) return null

  const SentimentIcon =
    sentiment.sentiment === "bullish" ? TrendingUp : sentiment.sentiment === "bearish" ? TrendingDown : Minus

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Sentiment</CardTitle>
        <CardDescription>Based on exchange flows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Signal</p>
            <div className="flex items-center gap-2">
              <SentimentIcon
                className={`h-5 w-5 ${sentiment.sentiment === "bullish" ? "text-green-500" : sentiment.sentiment === "bearish" ? "text-red-500" : "text-muted-foreground"}`}
              />
              <span className="text-2xl font-bold">{sentiment.label}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              sentiment.sentiment === "bullish"
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : sentiment.sentiment === "bearish"
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : "bg-muted text-muted-foreground"
            }
          >
            {sentiment.sentiment.toUpperCase()}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowDownToLine className="h-4 w-4" />
              <span>Total Inflow</span>
            </div>
            <p className="text-xl font-bold">
              {sentiment.totalInflow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">Tokens to exchanges</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpFromLine className="h-4 w-4" />
              <span>Total Outflow</span>
            </div>
            <p className="text-xl font-bold">
              {sentiment.totalOutflow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">Tokens from exchanges</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Minus className="h-4 w-4" />
              <span>Net Flow</span>
            </div>
            <p
              className={`text-xl font-bold ${sentiment.netFlow > 0 ? "text-red-500" : sentiment.netFlow < 0 ? "text-green-500" : ""}`}
            >
              {sentiment.netFlow > 0 ? "+" : ""}
              {sentiment.netFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">
              {sentiment.netFlow > 0 ? "Sell pressure" : sentiment.netFlow < 0 ? "Accumulation" : "Balanced"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
