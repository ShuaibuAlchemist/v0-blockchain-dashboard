import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { MobileNav } from "./mobile-nav"
import { Activity, Settings } from "lucide-react"
import { Button } from "./ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <MobileNav />

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Whale Watch</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-foreground/60 hover:text-foreground transition-colors">
              Overview
            </Link>
            <Link href="/flows" className="text-foreground/60 hover:text-foreground transition-colors">
              Exchange Flows
            </Link>
            <Link href="/stablecoins" className="text-foreground/60 hover:text-foreground transition-colors">
              Stablecoins
            </Link>
            <Link href="/risk" className="text-foreground/60 hover:text-foreground transition-colors">
              Risk Metrics
            </Link>
            <Link href="/analytics" className="text-foreground/60 hover:text-foreground transition-colors">
              Analytics
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="/setup">
              <Settings className="h-4 w-4 mr-2" />
              Setup
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
