"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfigStatus {
  name: string
  key: string
  status: "checking" | "success" | "error" | "warning"
  message: string
}

export default function SetupPage() {
  const [configs, setConfigs] = useState<ConfigStatus[]>([
    { name: "Dune API", key: "DUNE_API_KEY", status: "checking", message: "Checking..." },
    { name: "CoinGecko API", key: "Coingecko_API", status: "checking", message: "Checking..." },
    { name: "App URL", key: "NEXT_PUBLIC_APP_URL", status: "checking", message: "Checking..." },
  ])

  const checkConfiguration = async () => {
    setConfigs((prev) =>
      prev.map((c) => ({
        ...c,
        status: "checking",
        message: "Checking...",
      })),
    )

    // Check Dune API
    try {
      const duneResponse = await fetch("/api/dune/whale-transfers")
      const duneData = await duneResponse.json()

      setConfigs((prev) =>
        prev.map((c) =>
          c.key === "DUNE_API_KEY"
            ? {
                ...c,
                status: duneResponse.ok ? "success" : "error",
                message: duneResponse.ok
                  ? `Connected successfully. Found ${duneData.data?.length || 0} whale transfers.`
                  : duneData.error || "Failed to connect",
              }
            : c,
        ),
      )
    } catch (error) {
      setConfigs((prev) =>
        prev.map((c) =>
          c.key === "DUNE_API_KEY"
            ? {
                ...c,
                status: "error",
                message: "Network error. Check your API key in Project Settings.",
              }
            : c,
        ),
      )
    }

    // Check CoinGecko API
    try {
      const priceResponse = await fetch("/api/prices")
      const priceData = await priceResponse.json()

      setConfigs((prev) =>
        prev.map((c) =>
          c.key === "Coingecko_API"
            ? {
                ...c,
                status: priceResponse.ok ? "success" : "warning",
                message: priceResponse.ok
                  ? `Connected successfully. Fetched ${priceData.data?.length || 0} prices.`
                  : "API key not set. Using free tier (rate limited).",
              }
            : c,
        ),
      )
    } catch (error) {
      setConfigs((prev) =>
        prev.map((c) =>
          c.key === "Coingecko_API"
            ? {
                ...c,
                status: "warning",
                message: "Network error. Dashboard will use free tier (rate limited).",
              }
            : c,
        ),
      )
    }

    // Check App URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    setConfigs((prev) =>
      prev.map((c) =>
        c.key === "NEXT_PUBLIC_APP_URL"
          ? {
              ...c,
              status: appUrl ? "success" : "warning",
              message: appUrl ? `Set to: ${appUrl}` : "Not set. Using default: http://localhost:3000",
            }
          : c,
      ),
    )
  }

  useEffect(() => {
    checkConfiguration()
  }, [])

  const getStatusIcon = (status: ConfigStatus["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
    }
  }

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Configuration Setup</h1>
        <p className="text-muted-foreground">Verify your API keys and environment variables are properly configured</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          {configs.map((config) => (
            <div key={config.key} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <div className="mt-0.5">{getStatusIcon(config.status)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{config.name}</h3>
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{config.key}</code>
                </div>
                <p className="text-sm text-muted-foreground">{config.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">Last checked: {new Date().toLocaleTimeString()}</p>
          <Button onClick={checkConfiguration} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recheck
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Setup Instructions</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">1. Dune API Key (Required)</h3>
            <p className="text-muted-foreground mb-2">
              The Dune API key is required to fetch whale transaction data from your Dune Analytics queries.
            </p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
              <li>Go to Project Settings (gear icon in top right)</li>
              <li>Navigate to Environment Variables</li>
              <li>Add or verify: DUNE_API_KEY</li>
              <li>Get your API key from dune.com/settings/api</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. CoinGecko API Key (Optional)</h3>
            <p className="text-muted-foreground mb-2">
              Optional but recommended. Without it, you'll use the free tier which has rate limits.
            </p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
              <li>Go to Project Settings → Environment Variables</li>
              <li>Add: Coingecko_API</li>
              <li>Get your API key from coingecko.com/en/api</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. App URL (Auto-configured)</h3>
            <p className="text-muted-foreground">
              I've set NEXT_PUBLIC_APP_URL to: <code className="bg-muted px-1 rounded">http://localhost:3000</code>
              <br />
              This will automatically update to your production URL when you deploy to Vercel.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
