"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import type { WhaleTransfer } from "@/lib/types"
import { ExternalLink, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"

export function WhaleTransfersTable() {
  const [transfers, setTransfers] = useState<WhaleTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dune/whale-transfers")
        const result = await response.json()

        if (result.success) {
          setTransfers(result.data.slice(0, 10))
        } else {
          setError(result.error || "Failed to fetch whale transfers")
        }
      } catch (error) {
        console.error("[v0] Failed to fetch whale transfers:", error)
        setError("Network error. Please check your connection.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatAmount = (amount: number, token: string) => {
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${token}`
  }

  const getTokenColor = (token: string) => {
    const colors: Record<string, string> = {
      ETH: "bg-chart-1/10 text-chart-1 border-chart-1/20",
      USDT: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      USDC: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    }
    return colors[token] || "bg-muted text-muted-foreground"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Whale Transfers</CardTitle>
          <CardDescription>Large transactions in the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-sm text-muted-foreground">Loading transfers...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Whale Transfers</CardTitle>
          <CardDescription>Large transactions in the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] gap-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">{error}</p>
              <p className="text-xs text-muted-foreground">Make sure your DUNE_API_KEY is configured correctly</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/setup">Go to Setup</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transfers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Whale Transfers</CardTitle>
          <CardDescription>Large transactions in the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-sm text-muted-foreground">No whale transfers found</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Whale Transfers</CardTitle>
        <CardDescription>Large transactions in the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Tx</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((transfer, index) => (
              <TableRow key={index}>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(transfer.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="font-mono text-xs">{formatAddress(transfer.from_address)}</TableCell>
                <TableCell className="font-mono text-xs">{formatAddress(transfer.to_address)}</TableCell>
                <TableCell className="font-semibold">{formatAmount(transfer.amount, transfer.token)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getTokenColor(transfer.token)}>
                    {transfer.token}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <a
                    href={`https://etherscan.io/tx/${transfer.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
