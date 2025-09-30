import { ConcentrationMetrics } from "@/components/concentration-metrics"
import { WhaleDistribution } from "@/components/whale-distribution"
import { TransparencyScore } from "@/components/transparency-score"
import { AboutSection } from "@/components/about-section"

export default function RiskPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Whale Concentration & Risk</h1>
        <p className="text-muted-foreground">Analyze market concentration and transparency metrics</p>
      </div>

      <AboutSection title="Concentration & Risk Metrics">
        <p className="mb-3">
          Concentration metrics reveal how whale activity is distributed and whether the market is dominated by a few
          large players or has healthy, distributed participation.
        </p>
        <p className="mb-3">
          <strong>Herfindahl-Hirschman Index (HHI):</strong> Measures market concentration. Values range from 0-10,000.
          Below 1,500 = competitive market. 1,500-2,500 = moderate concentration. Above 2,500 = high concentration
          (risky).
        </p>
        <p className="mb-3">
          <strong>Gini Coefficient:</strong> Measures inequality in transfer sizes. 0 = perfect equality, 1 = perfect
          inequality. Lower values indicate healthier distribution of whale activity.
        </p>
        <p>
          <strong>Transparency Score:</strong> Composite metric combining HHI and Gini. Higher scores indicate better
          market transparency and lower concentration risk.
        </p>
      </AboutSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <TransparencyScore />
        <ConcentrationMetrics />
      </div>

      <WhaleDistribution />
    </div>
  )
}
