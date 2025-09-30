"use client"

import { CorrelationChart } from "@/components/correlation-chart"
import { EventStudy } from "@/components/event-study"
import { AnomalyDetector } from "@/components/anomaly-detector"
import { AboutSection } from "@/components/about-section"

export default function AnalyticsPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Predictive Signals</h1>
        <p className="text-muted-foreground">Advanced analytics and correlation analysis</p>
      </div>

      <AboutSection title="Predictive Analytics">
        <p className="mb-3">
          Predictive signals help identify whether whale activity leads price movements or simply follows them. These
          metrics combine statistical analysis with market behavior to uncover actionable insights.
        </p>
        <p className="mb-3">
          <strong>Rolling Correlation:</strong> Measures the relationship between whale transfer volume and price over
          time. Positive correlation suggests whales move with the market, while negative correlation indicates
          contrarian behavior.
        </p>
        <p className="mb-3">
          <strong>Event Study:</strong> Analyzes price returns 1, 3, and 7 days after large whale movements. This
          reveals whether whales are predictive (accumulating before pumps) or reactive (following price action).
        </p>
        <p>
          <strong>Anomaly Detection:</strong> Identifies unusual whale activity using statistical z-scores. Transfers
          more than 3 standard deviations above normal often precede significant market moves.
        </p>
      </AboutSection>

      <CorrelationChart />

      <div className="grid gap-6 lg:grid-cols-2">
        <EventStudy />
        <AnomalyDetector />
      </div>
    </div>
  )
}
