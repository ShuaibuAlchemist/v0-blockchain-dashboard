"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { AlertTriangle, Shield, AlertCircle } from "lucide-react"
import type { ExchangeFlow } from "@/lib/types"
import { CONTRACT_TO_TOKEN } from "@/lib/types"

export function RiskIndicator() {
  const [riskData, setRiskData] = useState<{
    level: "low" | "medium" | "high"
    label: string
    description: string
    stablecoinRatio: number
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

          // Calculate stablecoin vs crypto ratio
          const stablecoinInflow = flows
            .filter((f) => f.token === "USDT" || f.token === "USDC")
            .reduce((sum, f) => sum + f.inflow, 0)

          const cryptoInflow = flows
            .filter((f) => f.token === "WETH" || f.token === "WBTC")
            .reduce((sum, f) => sum + f.inflow, 0)

          const totalInflow = stablecoinInflow + cryptoInflow
          const stablecoinRatio = totalInflow > 0 ? (stablecoinInflow / totalInflow) * 100 : 0

          // Determine risk level
          let level: "low" | "medium" | "high"
          let label: string
          let description: string

          if (stablecoinRatio > 60) {
            level = "high"
            label = "Risk-Off Mode"
            description = "High stablecoin inflows suggest whales rotating to safety"
          } else if (stablecoinRatio > 40) {
            level = "medium"
            label = "Cautious"
            description = "Balanced flows between stablecoins and crypto"
          } else {
            level = "low"
            label = "Risk-On Mode"
            description = "Low stablecoin inflows suggest confidence in crypto assets"
          }

          setRiskData({
            level,
            label,
            description,
            stablecoinRatio,
          })
        }
      } catch (error) {
        console.error("[v0] Failed to fetch risk data:", error)
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
          <CardTitle>Risk Appetite</CardTitle>
          <CardDescription>Whale sentiment based on stablecoin rotation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-sm text-muted-foreground">Analyzing risk...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!riskData) return null

  const RiskIcon = riskData.level === "high" ? AlertTriangle : riskData.level === "medium" ? AlertCircle : Shield

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Appetite</CardTitle>
        <CardDescription>Whale sentiment based on stablecoin rotation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Mode</p>
            <div className="flex items-center gap-2">
              <RiskIcon
                className={`h-5 w-5 ${riskData.level === "high" ? "text-red-500" : riskData.level === "medium" ? "text-yellow-500" : "text-green-500"}`}
              />
              <span className="text-2xl font-bold">{riskData.label}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              riskData.level === "high"
                ? "bg-red-500/10 text-red-500 border-red-500/20"
                : riskData.level === "medium"
                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  : "bg-green-500/10 text-green-500 border-green-500/20"
            }
          >
            {riskData.level.toUpperCase()} RISK
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stablecoin Inflow Ratio</span>
            <span className="font-semibold">{riskData.stablecoinRatio.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${riskData.level === "high" ? "bg-red-500" : riskData.level === "medium" ? "bg-yellow-500" : "bg-green-500"}`}
              style={{ width: `${riskData.stablecoinRatio}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{riskData.description}</p>
      </CardContent>
    </Card>
  )
}
