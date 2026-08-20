import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./Logo";
import { BUYER_NOTIFICATIONS, SELLER_NOTIFICATIONS } from "@/lib/data";
import { MessengerButton } from "@/components/messenger/MessengerButton";

const NAV = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/wanted", label: "Material Wanted" },
  { to: "/businesses", label: "Businesses" },
  { to: "/impact", label: "Impact" },
] as const;

const ABOUT_NAV = [
  { to: "/how-it-works", label: "How It Works" },
  { to: "/trust", label: "Trust & Safety" },
  { to: "/about", label: "Business Model" },
] as const;

export function Header() {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const aboutCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBusiness = currentUser?.role === "business";
  const notifications = isBusiness ? SELLER_NOTIFICATIONS : BUYER_NOTIFICATIONS;

  const showAboutMenu = () => {
    if (aboutCloseTimer.current) clearTimeout(aboutCloseTimer.current);
    setAboutOpen(true);
  };

  const hideAboutMenu = () => {
    aboutCloseTimer.current = setTimeout(() => setAboutOpen(false), 120);
  };

  const closeMobileNavigation = () => {
    setOpen(false);
    setMobileAboutOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    closeMobileNavigation();
    void navigate({ to: "/", replace: true });
  };

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
          <DropdownMenu open={aboutOpen} onOpenChange={setAboutOpen} modal={false}>
            <div onMouseEnter={showAboutMenu} onMouseLeave={hideAboutMenu}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="About navigation"
                >
                  About
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-3.5 transition-transform ${aboutOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent
              align="start"
              className="w-52"
              onMouseEnter={showAboutMenu}
              onMouseLeave={hideAboutMenu}
            >
              {ABOUT_NAV.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link
                    to={item.to}
                    onClick={() => setAboutOpen(false)}
                    className="w-full cursor-pointer"
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <MessengerButton />
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
              {notifications.map((n) => (
                <DropdownMenuItem key={n.title} className="flex flex-col items-start gap-0.5 py-2">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.body}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {n.time}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {isBusiness ? (
            <>
              <Button size="sm" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="size-4" /> Business Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : currentUser ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth" search={{ redirect: undefined }}>
                  Login
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth" search={{ redirect: undefined }}>
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="ml-auto rounded-lg p-2 text-muted-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-navigation" className="border-t border-border bg-card px-4 py-3 lg:hidden">
          <nav className="flex flex-col">
            <Link
              to="/"
              onClick={closeMobileNavigation}
              className="rounded-lg px-3 py-2 text-sm font-medium"
            >
              Home
            </Link>
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMobileNavigation}
                className="rounded-lg px-3 py-2 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setMobileAboutOpen((value) => !value)}
              aria-expanded={mobileAboutOpen}
              aria-controls="mobile-about-navigation"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              About
              <ChevronDown
                aria-hidden="true"
                className={`size-4 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobileAboutOpen && (
              <div
                id="mobile-about-navigation"
                className="ml-3 flex flex-col border-l border-border pl-2"
              >
                {ABOUT_NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileNavigation}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>
          <div className="mt-3 flex flex-wrap gap-2">
            <MessengerButton onNavigate={closeMobileNavigation} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                  <Bell className="size-4" />
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-emerald" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.title}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <span className="text-sm font-medium">{n.title}</span>
                    <span className="text-xs text-muted-foreground">{n.body}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {n.time}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {isBusiness ? (
              <>
                <Button size="sm" asChild>
                  <Link to="/dashboard" onClick={closeMobileNavigation}>
                    <LayoutDashboard className="size-4" /> Business Dashboard
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={handleSignOut}>
                  <LogOut className="size-4" /> Sign Out
                </Button>
              </>
            ) : currentUser ? (
              <Button size="sm" variant="ghost" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/auth" search={{ redirect: undefined }} onClick={closeMobileNavigation}>
                    Login
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/auth" search={{ redirect: undefined }} onClick={closeMobileNavigation}>
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
