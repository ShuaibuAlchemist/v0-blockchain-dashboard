/**
 * Predictive Signals & Correlation Analysis
 * Rolling correlations, lead-lag analysis, event studies
 */

export interface CorrelationResult {
  correlation: number
  pValue: number
  significance: "high" | "medium" | "low" | "none"
}

export interface EventStudyResult {
  daysAfter: number
  avgReturn: number
  positiveCount: number
  negativeCount: number
  totalEvents: number
}

/**
 * Calculate Pearson correlation coefficient
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0

  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi ** 2, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi ** 2, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2))

  if (denominator === 0) return 0

  return numerator / denominator
}

/**
 * Rolling correlation between whale activity and price
 */
export function rollingCorrelation(
  data: Array<{ timestamp: Date; whaleAmount: number; price: number }>,
  windowSize = 7,
): Array<{ timestamp: Date; correlation: number }> {
  const results: Array<{ timestamp: Date; correlation: number }> = []

  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1)
    const whaleAmounts = window.map((d) => d.whaleAmount)
    const prices = window.map((d) => d.price)

    const corr = calculateCorrelation(whaleAmounts, prices)
    results.push({
      timestamp: data[i].timestamp,
      correlation: Math.round(corr * 1000) / 1000,
    })
  }

  return results
}

/**
 * Event study: analyze price returns after large whale movements
 */
export function eventStudy(
  whaleEvents: Array<{ timestamp: Date; amount: number; type: "inflow" | "outflow" }>,
  priceData: Array<{ timestamp: Date; price: number }>,
  daysAfter: number[] = [1, 3, 7],
): EventStudyResult[] {
  const results: EventStudyResult[] = []

  for (const days of daysAfter) {
    let totalReturn = 0
    let positiveCount = 0
    let negativeCount = 0
    let validEvents = 0

    for (const event of whaleEvents) {
      // Find price at event time
      const eventPrice = priceData.find(
        (p) => Math.abs(p.timestamp.getTime() - event.timestamp.getTime()) < 3600000, // within 1 hour
      )

      if (!eventPrice) continue

      // Find price N days after
      const futureDate = new Date(event.timestamp)
      futureDate.setDate(futureDate.getDate() + days)

      const futurePrice = priceData.find(
        (p) => Math.abs(p.timestamp.getTime() - futureDate.getTime()) < 86400000, // within 1 day
      )

      if (!futurePrice) continue

      // Calculate return
      const returnPct = ((futurePrice.price - eventPrice.price) / eventPrice.price) * 100
      totalReturn += returnPct
      validEvents++

      if (returnPct > 0) positiveCount++
      else if (returnPct < 0) negativeCount++
    }

    results.push({
      daysAfter: days,
      avgReturn: validEvents > 0 ? Math.round((totalReturn / validEvents) * 100) / 100 : 0,
      positiveCount,
      negativeCount,
      totalEvents: validEvents,
    })
  }

  return results
}

/**
 * Detect anomalies (3 standard deviations above mean)
 */
export function detectAnomalies(
  data: Array<{ timestamp: Date; amount: number }>,
  threshold = 3,
): Array<{ timestamp: Date; amount: number; zScore: number }> {
  const amounts = data.map((d) => d.amount)
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
  const variance = amounts.reduce((sum, amt) => sum + (amt - mean) ** 2, 0) / amounts.length
  const stdDev = Math.sqrt(variance)

  const anomalies: Array<{ timestamp: Date; amount: number; zScore: number }> = []

  data.forEach((d) => {
    const zScore = stdDev > 0 ? (d.amount - mean) / stdDev : 0
    if (Math.abs(zScore) > threshold) {
      anomalies.push({
        timestamp: d.timestamp,
        amount: d.amount,
        zScore: Math.round(zScore * 100) / 100,
      })
    }
  })

  return anomalies
}
