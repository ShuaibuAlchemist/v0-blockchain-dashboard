import { NextResponse } from "next/server"
import { calculateConcentration } from "@/lib/calculations/concentration"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token") || "ETH"

    // Fetch whale transfers from Dune
    const DUNE_API_KEY = process.env.DUNE_API_KEY
    if (!DUNE_API_KEY) {
      return NextResponse.json({ error: "DUNE_API_KEY not configured" }, { status: 500 })
    }

    const WHALE_QUERY_ID = 5763322

    // Execute query
    const executeResponse = await fetch(`https://api.dune.com/api/v1/query/${WHALE_QUERY_ID}/execute`, {
      method: "POST",
      headers: {
        "x-dune-api-key": DUNE_API_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!executeResponse.ok) {
      const errorText = await executeResponse.text()
      console.error("[v0] Dune execute failed:", errorText)
      return NextResponse.json(
        { error: "Failed to execute Dune query", details: errorText },
        { status: executeResponse.status },
      )
    }

    const executeData = await executeResponse.json()

    if (!executeData.execution_id) {
      return NextResponse.json({ error: "No execution ID returned from Dune" }, { status: 500 })
    }

    const executionId = executeData.execution_id

    // Poll for results
    let status = ""
    let attempts = 0
    const maxAttempts = 30

    while (status !== "QUERY_STATE_COMPLETED" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const statusResponse = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/status`, {
        headers: { "x-dune-api-key": DUNE_API_KEY },
      })

      const statusData = await statusResponse.json()
      status = statusData.state
      attempts++

      if (status === "QUERY_STATE_FAILED") {
        return NextResponse.json({ error: "Dune query execution failed" }, { status: 500 })
      }
    }

    // Get results
    const resultsResponse = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/results`, {
      headers: { "x-dune-api-key": DUNE_API_KEY },
    })

    const resultsData = await resultsResponse.json()
    const whaleTransfers = resultsData.result?.rows || []

    // Filter by token if specified
    const filteredTransfers = token === "ALL" ? whaleTransfers : whaleTransfers.filter((t: any) => t.token === token)

    // Calculate concentration metrics
    const metrics = calculateConcentration(filteredTransfers)

    return NextResponse.json({
      token,
      metrics,
      totalTransfers: filteredTransfers.length,
      uniqueAddresses: new Set(filteredTransfers.map((t: any) => t.from_address)).size,
    })
  } catch (error) {
    console.error("[v0] Concentration API error:", error)
    return NextResponse.json({ error: "Failed to calculate concentration metrics" }, { status: 500 })
  }
}
