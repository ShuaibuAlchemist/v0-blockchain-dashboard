import { CardContent } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { StablecoinFlowChart } from "@/components/stablecoin-flow-chart"
import { RiskIndicator } from "@/components/risk-indicator"
import { AboutSection } from "@/components/about-section"
import { Coins, TrendingDown, TrendingUp } from "lucide-react"

export default function StablecoinsPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Stablecoin Rotation</h1>
        <p className="text-muted-foreground">Track whale movements between crypto and stablecoins</p>
      </div>

      <AboutSection title="Stablecoin Rotation">
        <p className="mb-3">
          Stablecoin rotation reveals whale risk appetite by tracking movements between volatile crypto assets (ETH,
          BTC) and stable assets (USDT, USDC).
        </p>
        <p className="mb-3">
          <strong>Risk-Off (High Stablecoin Inflows):</strong> When whales move crypto to exchanges and convert to
          stablecoins, it signals bearish sentiment and expectation of price declines. They're "rotating to safety."
        </p>
        <p className="mb-3">
          <strong>Risk-On (Low Stablecoin Inflows):</strong> When stablecoin inflows are low relative to crypto inflows,
          whales are confident in holding volatile assets, suggesting bullish sentiment.
        </p>
        <p>
          <strong>Net Flows:</strong> Positive net flow (more outflows) indicates whales are accumulating stablecoins
          off exchanges. Negative net flow suggests they're deploying stablecoins to buy crypto.
        </p>
      </AboutSection>

      <div className="grid gap-6 md:grid-cols-2">
        <RiskIndicator />

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Interpretation Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Bullish Signal</p>
                <p className="text-xs text-muted-foreground">
                  Low stablecoin ratio + positive crypto outflows = whales accumulating crypto
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Bearish Signal</p>
                <p className="text-xs text-muted-foreground">
                  High stablecoin ratio + positive stablecoin outflows = whales rotating to safety
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <StablecoinFlowChart />
    </div>
  )
}
