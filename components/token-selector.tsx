"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TokenSelectorProps {
  value: string
  onValueChange: (value: string) => void
  tokens: string[]
}

export function TokenSelector({ value, onValueChange, tokens }: TokenSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Tokens</SelectItem>
        {tokens.map((token) => (
          <SelectItem key={token} value={token}>
            {token}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
