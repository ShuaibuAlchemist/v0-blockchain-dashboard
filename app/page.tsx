import { MetricCard } from "@/components/metric-card"
import { PriceChart } from "@/components/price-chart"
import { WhaleTransfersTable } from "@/components/whale-transfers-table"
import { AboutSection } from "@/components/about-section"
import { TrendingUp, Activity, DollarSign } from "lucide-react"

async function getPrices() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/prices`, {
      cache: "no-store",
    })
    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error("[v0] Failed to fetch prices:", error)
    return []
  }
}

export default async function HomePage() {
  const prices = await getPrices()

  const ethPrice = prices.find((p: any) => p.asset === "ethereum")
  const btcPrice = prices.find((p: any) => p.asset === "bitcoin")
  const usdtPrice = prices.find((p: any) => p.asset === "tether")
  const usdcPrice = prices.find((p: any) => p.asset === "usd-coin")

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
        <p className="text-muted-foreground">Real-time cryptocurrency prices and whale transaction monitoring</p>
      </div>

      <AboutSection title="Market Overview">
        <p className="mb-3">
          The Market Overview provides a comprehensive snapshot of current cryptocurrency market conditions, focusing on
          major assets (ETH, BTC, USDT, USDC) and large whale transactions.
        </p>
        <p className="mb-3">
          <strong>Key Metrics:</strong> Live prices with 24-hour changes help identify short-term market trends and
          volatility patterns.
        </p>
        <p>
          <strong>Whale Transfers:</strong> Large transactions (1000+ ETH, 1M+ USDT/USDC) often precede significant
          market movements. Monitoring these helps identify potential accumulation or distribution phases.
        </p>
      </AboutSection>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ethereum"
          value={ethPrice ? `$${ethPrice.price.toLocaleString()}` : "Loading..."}
          change={ethPrice?.change24h}
          icon={Activity}
        />
        <MetricCard
          title="Bitcoin"
          value={btcPrice ? `$${btcPrice.price.toLocaleString()}` : "Loading..."}
          change={btcPrice?.change24h}
          icon={TrendingUp}
        />
        <MetricCard
          title="Tether (USDT)"
          value={usdtPrice ? `$${usdtPrice.price.toFixed(4)}` : "Loading..."}
          change={usdtPrice?.change24h}
          icon={DollarSign}
        />
        <MetricCard
          title="USD Coin (USDC)"
          value={usdcPrice ? `$${usdcPrice.price.toFixed(4)}` : "Loading..."}
          change={usdcPrice?.change24h}
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PriceChart asset="ethereum" title="Ethereum Price" />
        <PriceChart asset="bitcoin" title="Bitcoin Price" />
      </div>

      <WhaleTransfersTable />
    </div>
  )
}
