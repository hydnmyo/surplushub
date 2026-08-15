import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AI_SUGGESTIONS, askEcoMatch, type AiAnswer } from "@/lib/ecomatch";
import { priceLabel } from "@/lib/data";

interface Turn {
  q: string;
  a: AiAnswer;
}

export function EcoMatchAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setTurns((t) => [...t, { q, a: askEcoMatch(q) }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3.5 text-sm font-semibold text-forest-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
        aria-label="Open EcoMatch AI"
      >
        {open ? <X className="size-4" /> : <Sparkles className="size-4" />}
        EcoMatch AI
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(640px,80vh)] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-lift)]">
          <div className="gradient-hero px-4 py-3.5 text-forest-foreground">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-forest-foreground/15">
                <Bot className="size-4" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold">EcoMatch AI</p>
                <p className="text-[11px] text-forest-foreground/70">
                  Material discovery & supply–demand matching
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-4 p-4">
              {turns.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Ask me to find materials, match your surplus with buyer demand, estimate prices, or
                    draft a listing.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => ask(s)}
                        className="rounded-full border border-border bg-secondary px-3 py-1.5 text-left text-xs text-secondary-foreground transition-colors hover:bg-mint"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {turns.map((t, i) => (
                <div key={i} className="space-y-3">
                  <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-forest px-3.5 py-2 text-sm text-forest-foreground">
                    {t.q}
                  </p>
                  <div className="w-fit max-w-full space-y-3 rounded-2xl rounded-bl-sm bg-secondary p-3.5">
                    <Badge variant="verified" className="gap-1">
                      <Sparkles className="size-3" /> {t.a.intent}
                    </Badge>
                    <p className="text-sm">{t.a.text}</p>

                    {t.a.bullets && (
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {t.a.bullets.map((b) => (
                          <li key={b} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {t.a.listings?.map(({ listing, match }) => (
                      <div key={listing.id} className="rounded-xl border border-border bg-card p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{listing.title}</p>
                          <Badge variant="verified">{match}% Match</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {listing.quantity.toLocaleString("en-US")} {listing.unit} · {priceLabel(listing)} ·{" "}
                          {listing.location}
                        </p>
                        <Button size="sm" className="mt-2.5 w-full" asChild>
                          <Link to="/marketplace/$id" params={{ id: listing.id }} onClick={() => setOpen(false)}>
                            View Material
                          </Link>
                        </Button>
                      </div>
                    ))}

                    {t.a.wanted?.map(({ post, match }) => (
                      <div key={post.id} className="rounded-xl border border-border bg-card p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{post.title}</p>
                          <Badge variant="verified">{match}% Match</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {post.buyer} · {post.quantity} · {post.location} · {post.budget}
                        </p>
                        <p className="text-xs text-muted-foreground">Use: {post.use}</p>
                        <Button size="sm" variant="outline" className="mt-2.5 w-full" asChild>
                          <Link to="/wanted" onClick={() => setOpen(false)}>
                            View Request & Make Offer
                          </Link>
                        </Button>
                      </div>
                    ))}

                    {t.a.businesses?.map((b) => (
                      <div key={b.id} className="rounded-xl border border-border bg-card p-3">
                        <p className="text-sm font-semibold">{b.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{b.line}</p>
                        <Button size="sm" variant="outline" className="mt-2.5 w-full" asChild>
                          <Link to="/businesses/$id" params={{ id: b.id }} onClick={() => setOpen(false)}>
                            View Business
                          </Link>
                        </Button>
                      </div>
                    ))}

                    {t.a.note && <p className="text-[11px] italic text-muted-foreground">{t.a.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask EcoMatch AI…"
              className="h-10"
            />
            <Button type="submit" size="icon" className="size-10 shrink-0" aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}