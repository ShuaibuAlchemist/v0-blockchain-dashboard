"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AboutSectionProps {
  title: string
  children: React.ReactNode
}

export function AboutSection({ title, children }: AboutSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Info className="h-4 w-4" />
        <span>About {title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card className="mt-2 border-l-4 border-l-chart-1">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
