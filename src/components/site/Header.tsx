import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Menu, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./Logo";
import { BUYER_NOTIFICATIONS } from "@/lib/data";

const NAV = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/wanted", label: "Material Wanted" },
  { to: "/businesses", label: "Businesses" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/impact", label: "Impact" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-mint text-accent-foreground" }}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "bg-mint text-accent-foreground" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="size-4" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-emerald" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {BUYER_NOTIFICATIONS.map((n) => (
                <DropdownMenuItem key={n.title} className="flex flex-col items-start gap-0.5 py-2">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.body}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{n.time}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">
              Login
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/auth">
              Sign Up
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/dashboard">
              <PlusCircle className="size-4" /> Sell Surplus
            </Link>
          </Button>
          <Button variant="mint" size="sm" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>

        <button
          className="ml-auto rounded-lg p-2 text-muted-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-4 py-3 lg:hidden">
          <nav className="flex flex-col">
            <Link to="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium">
              Home
            </Link>
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/auth" onClick={() => setOpen(false)}>
                Login
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                Sell Surplus
              </Link>
            </Button>
            <Badge variant="verified">Demo prototype</Badge>
          </div>
        </div>
      )}
    </header>
  );
}