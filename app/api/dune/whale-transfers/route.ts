import { NextResponse } from "next/server"
import { mockWhaleTransfers } from "@/lib/mock-data"

const DUNE_API_KEY = process.env.DUNE_API_KEY
const WHALE_QUERY_ID = 5763322

export async function GET() {
  try {
    if (!DUNE_API_KEY) {
      return NextResponse.json({
        data: mockWhaleTransfers(),
        success: true,
        mock: true,
      })
    }

    const executeResponse = await fetch(`https://api.dune.com/api/v1/query/${WHALE_QUERY_ID}/execute`, {
      method: "POST",
      headers: {
        "x-dune-api-key": DUNE_API_KEY,
      },
    })

    if (!executeResponse.ok) {
      const errorData = await executeResponse.json()
      console.error("[v0] Dune execute failed:", errorData)
      return NextResponse.json({
        data: mockWhaleTransfers(),
        success: true,
        mock: true,
      })
    }

    const executeData = await executeResponse.json()
    const executionId = executeData.execution_id

    if (!executionId) {
      console.error("[v0] No execution ID returned:", executeData)
      return NextResponse.json({
        data: mockWhaleTransfers(),
        success: true,
        mock: true,
      })
    }

    let status = ""
    let attempts = 0
    const maxAttempts = 30

    while (status !== "QUERY_STATE_COMPLETED" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const statusResponse = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/status`, {
        headers: {
          "x-dune-api-key": DUNE_API_KEY,
        },
      })

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json()
        console.error("[v0] Dune status check failed:", errorData)
        return NextResponse.json({
          data: mockWhaleTransfers(),
          success: true,
          mock: true,
        })
      }

      const statusData = await statusResponse.json()
      status = statusData.state

      if (status === "QUERY_STATE_FAILED") {
        return NextResponse.json({
          data: mockWhaleTransfers(),
          success: true,
          mock: true,
        })
      }

      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({
        data: mockWhaleTransfers(),
        success: true,
        mock: true,
      })
    }

    const resultsResponse = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/results`, {
      headers: {
        "x-dune-api-key": DUNE_API_KEY,
      },
    })

    if (!resultsResponse.ok) {
      const errorData = await resultsResponse.json()
      console.error("[v0] Dune results fetch failed:", errorData)
      return NextResponse.json({
        data: mockWhaleTransfers(),
        success: true,
        mock: true,
      })
    }

    const resultsData = await resultsResponse.json()

    return NextResponse.json({
      data: resultsData.result?.rows || [],
      success: true,
    })
  } catch (error) {
    console.error("[v0] Whale transfers API error:", error)
    return NextResponse.json({
      data: mockWhaleTransfers(),
      success: true,
      mock: true,
    })
  }
}
