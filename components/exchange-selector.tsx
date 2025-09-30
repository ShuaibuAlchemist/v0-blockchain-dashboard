"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExchangeSelectorProps {
  value: string
  onValueChange: (value: string) => void
  exchanges: string[]
}

export function ExchangeSelector({ value, onValueChange, exchanges }: ExchangeSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select exchange" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Exchanges</SelectItem>
        {exchanges.map((exchange) => (
          <SelectItem key={exchange} value={exchange}>
            {exchange}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
