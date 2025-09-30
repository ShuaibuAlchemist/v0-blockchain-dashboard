"use client"

import { useState } from "react"
import { FlowChart } from "@/components/flow-chart"
import { FlowSentiment } from "@/components/flow-sentiment"
import { AboutSection } from "@/components/about-section"
import { ExchangeSelector } from "@/components/exchange-selector"
import { TokenSelector } from "@/components/token-selector"

export default function FlowsPage() {
  const [selectedExchange, setSelectedExchange] = useState("all")
  const [selectedToken, setSelectedToken] = useState("all")

  const exchanges = ["Binance", "Coinbase", "Bitfinex"]
  const tokens = ["USDC", "USDT", "WETH", "WBTC"]

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Exchange Flows Analysis</h1>
        <p className="text-muted-foreground">Monitor inflows and outflows to identify market sentiment</p>
      </div>

      <AboutSection title="Exchange Flows">
        <p className="mb-3">
          Exchange flows reveal whale behavior and market sentiment by tracking large token movements to and from
          centralized exchanges.
        </p>
        <p className="mb-3">
          <strong>Inflows (to exchanges):</strong> Typically indicate sell pressure as whales move tokens to exchanges
          to sell. High inflows often precede bearish price action.
        </p>
        <p className="mb-3">
          <strong>Outflows (from exchanges):</strong> Suggest accumulation as whales withdraw tokens to cold storage.
          High outflows are generally bullish signals indicating long-term holding intent.
        </p>
        <p>
          <strong>Net Flow:</strong> The difference between inflows and outflows. Positive net flow (more inflows) =
          bearish. Negative net flow (more outflows) = bullish.
        </p>
      </AboutSection>

      <FlowSentiment />

      <div className="flex flex-wrap gap-4">
        <ExchangeSelector value={selectedExchange} onValueChange={setSelectedExchange} exchanges={exchanges} />
        <TokenSelector value={selectedToken} onValueChange={setSelectedToken} tokens={tokens} />
      </div>

      <FlowChart
        exchange={selectedExchange === "all" ? undefined : selectedExchange}
        token={selectedToken === "all" ? undefined : selectedToken}
      />
    </div>
  )
}
