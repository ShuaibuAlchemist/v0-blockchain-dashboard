/**
 * Concentration & Transparency Metrics
 * Calculates HHI, Gini coefficient, and whale concentration ratios
 */

export interface ConcentrationMetrics {
  hhi: number
  gini: number
  whaleToRetailRatio: number
  top10Concentration: number
  riskLevel: "low" | "medium" | "high"
}

/**
 * Calculate Herfindahl-Hirschman Index (HHI)
 * Measures market concentration (0-10000)
 * < 1500: Competitive, > 2500: Highly concentrated
 */
export function calculateHHI(amounts: number[]): number {
  const total = amounts.reduce((sum, amt) => sum + amt, 0)
  if (total === 0) return 0

  const marketShares = amounts.map((amt) => (amt / total) * 100)
  const hhi = marketShares.reduce((sum, share) => sum + share ** 2, 0)

  return Math.round(hhi)
}

/**
 * Calculate Gini Coefficient
 * Measures inequality (0-1)
 * 0: Perfect equality, 1: Perfect inequality
 */
export function calculateGini(amounts: number[]): number {
  if (amounts.length === 0) return 0

  const sorted = [...amounts].sort((a, b) => a - b)
  const n = sorted.length
  const total = sorted.reduce((sum, amt) => sum + amt, 0)

  if (total === 0) return 0

  let numerator = 0
  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * sorted[i]
  }

  const gini = numerator / (n * total)
  return Math.round(gini * 1000) / 1000
}

/**
 * Calculate whale concentration metrics
 */
export function calculateConcentration(
  whaleTransfers: Array<{ amount: number; from_address: string }>,
): ConcentrationMetrics {
  // Group by address and sum amounts
  const addressAmounts = new Map<string, number>()

  whaleTransfers.forEach((transfer) => {
    const current = addressAmounts.get(transfer.from_address) || 0
    addressAmounts.set(transfer.from_address, current + transfer.amount)
  })

  const amounts = Array.from(addressAmounts.values())
  const sortedAmounts = [...amounts].sort((a, b) => b - a)

  // Calculate metrics
  const hhi = calculateHHI(amounts)
  const gini = calculateGini(amounts)

  // Top 10 concentration
  const top10 = sortedAmounts.slice(0, 10)
  const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0)
  const top10Amount = top10.reduce((sum, amt) => sum + amt, 0)
  const top10Concentration = totalAmount > 0 ? (top10Amount / totalAmount) * 100 : 0

  // Whale to retail ratio (simplified: top 10% vs bottom 90%)
  const top10Percent = Math.ceil(amounts.length * 0.1)
  const topAmounts = sortedAmounts.slice(0, top10Percent)
  const bottomAmounts = sortedAmounts.slice(top10Percent)

  const topSum = topAmounts.reduce((sum, amt) => sum + amt, 0)
  const bottomSum = bottomAmounts.reduce((sum, amt) => sum + amt, 0)
  const whaleToRetailRatio = bottomSum > 0 ? topSum / bottomSum : 0

  // Determine risk level
  let riskLevel: "low" | "medium" | "high" = "low"
  if (hhi > 2500 || gini > 0.7) {
    riskLevel = "high"
  } else if (hhi > 1500 || gini > 0.5) {
    riskLevel = "medium"
  }

  return {
    hhi: Math.round(hhi),
    gini: Math.round(gini * 1000) / 1000,
    whaleToRetailRatio: Math.round(whaleToRetailRatio * 100) / 100,
    top10Concentration: Math.round(top10Concentration * 10) / 10,
    riskLevel,
  }
}
