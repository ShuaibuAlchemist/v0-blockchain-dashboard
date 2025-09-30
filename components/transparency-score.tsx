"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { calculateHHI, calculateGini } from "@/lib/utils/calculations"
import type { WhaleTransfer } from "@/lib/types"
import { Eye, EyeOff } from "lucide-react"

export function TransparencyScore() {
  const [score, setScore] = useState<{
    value: number
    level: "low" | "medium" | "high"
    description: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dune/whale-transfers")
        const result = await response.json()

        if (result.success) {
          const transfers: WhaleTransfer[] = result.data
          const amounts = transfers.map((t) => t.amount)

          // Calculate metrics
          const hhi = calculateHHI(amounts)
          const gini = calculateGini(amounts)

          // Calculate transparency score (inverse of concentration)
          // HHI: 0-10000, normalize to 0-50
          // Gini: 0-1, normalize to 0-50
          // Total: 0-100 (higher = more transparent)
          const hhiScore = Math.max(0, 50 - (hhi / 10000) * 50)
          const giniScore = Math.max(0, 50 - gini * 50)
          const transparencyScore = Math.round(hhiScore + giniScore)

          let level: "low" | "medium" | "high"
          let description: string

          if (transparencyScore >= 70) {
            level = "high"
            description = "Excellent market transparency with well-distributed whale activity"
          } else if (transparencyScore >= 40) {
            level = "medium"
            description = "Moderate transparency with some concentration concerns"
          } else {
            level = "low"
            description = "Low transparency - high concentration risk from dominant whales"
          }

          setScore({
            value: transparencyScore,
            level,
            description,
          })
        }
      } catch (error) {
        console.error("[v0] Failed to calculate transparency score:", error)
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
          <CardTitle>Transparency Score</CardTitle>
          <CardDescription>Overall market health indicator</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-sm text-muted-foreground">Calculating score...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!score) return null

  const Icon = score.level === "high" ? Eye : EyeOff

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transparency Score</CardTitle>
        <CardDescription>Composite metric of market health and transparency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <svg className="transform -rotate-90" width="200" height="200">
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                fill="none"
                className="opacity-20"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke={
                  score.level === "high"
                    ? "hsl(var(--chart-2))"
                    : score.level === "medium"
                      ? "hsl(var(--chart-4))"
                      : "hsl(var(--chart-5))"
                }
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(score.value / 100) * 502.4} 502.4`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Icon
                className={`h-8 w-8 mb-2 ${score.level === "high" ? "text-green-500" : score.level === "medium" ? "text-yellow-500" : "text-red-500"}`}
              />
              <span className="text-4xl font-bold">{score.value}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold capitalize">{score.level} Transparency</p>
            <p className="text-sm text-muted-foreground max-w-md">{score.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
