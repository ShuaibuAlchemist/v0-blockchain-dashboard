import type { ExchangeFlow } from "@/lib/types"

/**
 * Calculate Herfindahl-Hirschman Index (HHI) for whale concentration
 * Higher values indicate more concentration (less transparent)
 */
export function calculateHHI(amounts: number[]): number {
  const total = amounts.reduce((sum, amount) => sum + amount, 0)
  if (total === 0) return 0

  const shares = amounts.map((amount) => (amount / total) * 100)
  const hhi = shares.reduce((sum, share) => sum + share * share, 0)

  return Math.round(hhi)
}

/**
 * Calculate Gini coefficient for wealth distribution
 * 0 = perfect equality, 1 = perfect inequality
 */
export function calculateGini(amounts: number[]): number {
  if (amounts.length === 0) return 0

  const sorted = [...amounts].sort((a, b) => a - b)
  const n = sorted.length
  const total = sorted.reduce((sum, val) => sum + val, 0)

  if (total === 0) return 0

  let numerator = 0
  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * sorted[i]
  }

  const gini = numerator / (n * total)
  return Math.round(gini * 1000) / 1000
}

/**
 * Calculate net flow (inflow - outflow)
 */
export function calculateNetFlow(flows: ExchangeFlow[]): number {
  return flows.reduce((sum, flow) => sum + flow.inflow - flow.outflow, 0)
}

/**
 * Determine market sentiment based on flows
 */
export function getFlowSentiment(netFlow: number): {
  sentiment: "bullish" | "bearish" | "neutral"
  label: string
} {
  if (netFlow < -1000000) {
    return { sentiment: "bullish", label: "Strong Accumulation" }
  } else if (netFlow < -100000) {
    return { sentiment: "bullish", label: "Accumulation" }
  } else if (netFlow > 1000000) {
    return { sentiment: "bearish", label: "Strong Sell Pressure" }
  } else if (netFlow > 100000) {
    return { sentiment: "bearish", label: "Sell Pressure" }
  }
  return { sentiment: "neutral", label: "Neutral" }
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}
