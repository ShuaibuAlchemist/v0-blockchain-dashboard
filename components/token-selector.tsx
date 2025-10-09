'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TokenSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TokenSelector({ value, onValueChange }: TokenSelectorProps) {
  const tokens = ['ETH', 'USDT', 'USDC', 'WBTC']; // Hardcode available tokens
  
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem key={token} value={token}>
            {token}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
