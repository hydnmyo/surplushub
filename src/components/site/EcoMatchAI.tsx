import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, ExternalLink, Loader2, PlusCircle, RefreshCw, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_EXAMPLE_PROMPTS,
  actionLabel,
  askEcoMatch,
  createInitialFlowState,
  selectEcoMatchOption,
  startEcoMatchAction,
  type AiAnswer,
  type ChatAction,
  type EcoMatchFlowState,
  type EcoMatchOption,
  type ListingDraft,
  type ListingMatch,
} from "@/lib/ecomatch";
import { cn } from "@/lib/utils";

const ROBOT_IMAGE_SRC = "/images/ecomatch-robot.png";
const STORAGE_KEY = "surplushub:ecomatch-chat";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  answer?: AiAnswer;
}

interface StoredChat {
  messages: ChatMessage[];
  flow: EcoMatchFlowState;
}

const welcomeText = "Hi, I'm Loopi! What can I help you find today?";

const ACTIONS: { action: ChatAction; helper: string }[] = [
  { action: "find-materials", helper: "Search current listings" },
  { action: "find-buyers", helper: "Match surplus with likely demand" },
  { action: "estimate-price", helper: "Estimate from listing data" },
  { action: "create-listing", helper: "Draft a marketplace post" },
];

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const safeReadChat = (): StoredChat | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredChat) : null;
  } catch {
    return null;
  }
};

const safeWriteChat = (messages: ChatMessage[], flow: EcoMatchFlowState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, flow }));
  } catch {
    // Chat history is helpful, but the assistant should still work without storage.
  }
};

const safeClearChat = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
};

export function EcoMatchAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [flow, setFlow] = useState<EcoMatchFlowState>(() => createInitialFlowState());
  const [loading, setLoading] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = safeReadChat();
    if (stored) {
      setMessages(stored.messages);
      setFlow(stored.flow);
    }
  }, []);

  useEffect(() => {
    safeWriteChat(messages, flow);
  }, [messages, flow]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  const appendAssistantAnswer = (answer: AiAnswer) => {
    setMessages((current) => [
      ...current,
      {
        id: createId(),
        role: "assistant",
        text: answer.text,
        answer,
      },
    ]);
    setFlow(answer.nextFlow);
  };

  const openChat = () => {
    setOpen(true);
  };

  const closeChat = () => {
    setOpen(false);
  };

  const newChat = () => {
    const nextFlow = createInitialFlowState();
    setMessages([]);
    setFlow(nextFlow);
    setInput("");
    setLoading(false);
    safeClearChat();
  };

  const runAssistant = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text: trimmed,
    };
    const answer = askEcoMatch(trimmed, flow);
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    window.setTimeout(() => {
      appendAssistantAnswer(answer);
      setLoading(false);
    }, 450);
  };

  const startAction = (action: ChatAction) => {
    if (loading) return;
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text: actionLabel(action),
    };
    const answer = startEcoMatchAction(action);
    setMessages((current) => [...current, userMessage]);
    setLoading(true);
    window.setTimeout(() => {
      appendAssistantAnswer(answer);
      setLoading(false);
    }, 350);
  };

  const selectOption = (option: EcoMatchOption) => {
    if (loading) return;
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text: option.label,
    };
    const answer = selectEcoMatchOption(option, flow);
    setMessages((current) => [...current, userMessage]);
    setLoading(true);
    window.setTimeout(() => {
      appendAssistantAnswer(answer);
      setLoading(false);
    }, 300);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      runAssistant(input);
    }
  };

  return (
    <>
      {!open && <FloatingAssistant onOpen={openChat} />}

      {open && (
        <section
          aria-label="Loopi chat"
          className="fixed bottom-5 right-5 z-[70] flex h-[min(680px,calc(100vh-2rem))] w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-lift)] transition-all sm:bottom-6 sm:right-6"
        >
          <ChatHeader onClose={closeChat} onNewChat={newChat} />

          <ScrollArea className="flex-1 bg-gradient-to-b from-secondary/60 to-card">
            <div className="space-y-4 p-4">
              {messages.length === 0 && (
                <WelcomeScreen onAction={startAction} onPrompt={runAssistant} />
              )}

              {messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  onClose={closeChat}
                  onOption={selectOption}
                />
              ))}

              {loading && <TypingIndicator />}
              <div ref={scrollAnchorRef} />
            </div>
          </ScrollArea>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              runAssistant(input);
            }}
            className="border-t border-border bg-card p-3"
          >
            <label htmlFor="ecomatch-input" className="sr-only">
              Message Loopi
            </label>
            <div className="flex items-end gap-2">
              <Textarea
                id="ecomatch-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Loopi..."
                className="max-h-28 min-h-11 resize-none rounded-2xl bg-background text-sm"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                className="size-11 shrink-0 rounded-2xl"
                disabled={!input.trim() || loading}
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Press Enter to send. Shift+Enter adds a new line.
            </p>
          </form>
        </section>
      )}
    </>
  );
}

function FloatingAssistant({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="fixed bottom-5 right-4 z-[70] flex flex-col items-center gap-1 sm:bottom-6 sm:right-6">
      <button
        type="button"
        onClick={onOpen}
        className="group ecomatch-robot-button flex flex-col items-center gap-1 rounded-2xl bg-transparent p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Open Loopi chat"
      >
        <span className="ecomatch-robot-shell flex size-16 items-center justify-center bg-transparent transition-transform group-hover:scale-105 sm:size-[84px]">
          <img
            src={ROBOT_IMAGE_SRC}
            alt=""
            className="size-full object-contain drop-shadow-[0_12px_18px_rgba(35,91,69,0.25)]"
          />
        </span>
        <span className="text-xs font-semibold text-forest drop-shadow-[0_1px_2px_rgba(255,255,255,0.75)]">
          Loopi
        </span>
      </button>
    </div>
  );
}

function ChatHeader({ onClose, onNewChat }: { onClose: () => void; onNewChat: () => void }) {
  return (
    <header className="gradient-hero px-4 py-3.5 text-forest-foreground">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center bg-transparent">
          <img src={ROBOT_IMAGE_SRC} alt="" className="size-full object-contain" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold leading-tight">Loopi</h2>
          <p className="truncate text-[11px] text-forest-foreground/75">
            Your SurplusHub Assistant
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="onDark"
            className="size-8"
            onClick={onNewChat}
            aria-label="Refresh Loopi conversation"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="onDark"
            className="size-8"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function WelcomeScreen({
  onAction,
  onPrompt,
}: {
  onAction: (action: ChatAction) => void;
  onPrompt: (prompt: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <p className="text-sm leading-6 text-foreground">{welcomeText}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ACTIONS.map(({ action, helper }) => (
          <button
            key={action}
            type="button"
            onClick={() => onAction(action)}
            className="rounded-2xl border border-border bg-secondary px-3 py-2.5 text-left transition-colors hover:bg-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block text-sm font-semibold text-foreground">
              {actionLabel(action)}
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">{helper}</span>
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        {AI_EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPrompt(prompt)}
            className="block w-full rounded-xl px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatMessageBubble({
  message,
  onClose,
  onOption,
}: {
  message: ChatMessage;
  onClose: () => void;
  onOption: (option: EcoMatchOption) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[90%] space-y-3 rounded-3xl px-3.5 py-3 text-sm shadow-sm",
          isUser
            ? "rounded-br-md bg-forest text-forest-foreground"
            : "rounded-bl-md border border-border bg-card text-foreground",
        )}
      >
        {message.answer?.intent && !isUser && (
          <Badge variant="verified">{message.answer.intent}</Badge>
        )}
        <p className="whitespace-pre-wrap leading-6">{message.text}</p>
        {message.answer && (
          <AnswerDetails answer={message.answer} onClose={onClose} onOption={onOption} />
        )}
      </div>
    </div>
  );
}

function AnswerDetails({
  answer,
  onClose,
  onOption,
}: {
  answer: AiAnswer;
  onClose: () => void;
  onOption: (option: EcoMatchOption) => void;
}) {
  return (
    <>
      {answer.options && (
        <div className="flex flex-wrap gap-2">
          {answer.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onOption(option)}
              className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {answer.listings?.map(({ listing, match }) => (
        <ListingResultCard
          key={listing.listing.id}
          listing={listing}
          match={match}
          onClose={onClose}
        />
      ))}

      {answer.similarListings && answer.similarListings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Similar listings
          </p>
          {answer.similarListings.map(({ listing, match }) => (
            <ListingResultCard
              key={listing.listing.id}
              listing={listing}
              match={match}
              onClose={onClose}
            />
          ))}
        </div>
      )}

      {answer.buyerSuggestions?.map((buyer) => (
        <div key={buyer.id} className="rounded-2xl border border-border bg-secondary/60 p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{buyer.name}</p>
              <p className="text-xs text-muted-foreground">
                {buyer.buyerType} - {buyer.location}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Use: {buyer.likelyUse}</p>
        </div>
      ))}

      {answer.estimate && (
        <div className="rounded-2xl border border-border bg-secondary/60 p-3">
          <p className="text-sm font-semibold">{answer.estimate.categoryName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Estimated range: {answer.estimate.min.toLocaleString("en-US")}-
            {answer.estimate.max.toLocaleString("en-US")} MMK/{answer.estimate.unit}
          </p>
          {answer.estimate.median !== null && (
            <p className="mt-1 text-xs text-muted-foreground">
              Typical price: {answer.estimate.median.toLocaleString("en-US")} MMK/
              {answer.estimate.unit}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Listings used: {answer.estimate.count}
          </p>
        </div>
      )}

      {answer.draft && <ListingDraftCard draft={answer.draft} onClose={onClose} />}

      {answer.note && <p className="text-[11px] italic text-muted-foreground">{answer.note}</p>}
    </>
  );
}

function ListingResultCard({ listing, match, onClose }: ListingMatch & { onClose: () => void }) {
  const item = listing.listing;

  return (
    <div className="rounded-2xl border border-border bg-secondary/70 p-3">
      <div className="flex gap-3">
        <img src={listing.image} alt="" className="size-14 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold leading-snug">{item.title}</p>
            <Badge variant="verified" className="shrink-0">
              {match}%
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {listing.categoryName} - {item.quantity.toLocaleString("en-US")} {item.unit}
          </p>
          <p className="text-xs text-muted-foreground">
            {listing.priceLabel} - {item.location}
          </p>
          <p className="text-xs text-muted-foreground">
            {listing.sellerName}
            {listing.sellerVerified ? " - Verified seller" : ""}
          </p>
        </div>
      </div>
      <Button size="sm" className="mt-3 w-full" asChild>
        <Link to="/marketplace/$id" params={{ id: item.id }} onClick={onClose}>
          <ExternalLink className="size-3.5" /> View Listing
        </Link>
      </Button>
    </div>
  );
}

function ListingDraftCard({ draft, onClose }: { draft: ListingDraft; onClose: () => void }) {
  const draftText = [
    `Title: ${draft.title}`,
    `Category: ${draft.category}`,
    `Description: ${draft.description}`,
    `Quantity: ${draft.quantity}`,
    `Location: ${draft.location}`,
    `Suggested price: ${draft.suggestedPrice}`,
    `Possible uses: ${draft.possibleUses.join(", ")}`,
  ].join("\n");

  const copyDraft = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(draftText);
    }
  };

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-secondary/70 p-3">
      <p className="font-semibold">{draft.title}</p>
      <p className="text-xs text-muted-foreground">Category: {draft.category}</p>
      <p className="text-xs leading-5 text-muted-foreground">{draft.description}</p>
      <div className="grid gap-1 text-xs text-muted-foreground">
        <span>Quantity: {draft.quantity}</span>
        <span>Location: {draft.location}</span>
        <span>Suggested price: {draft.suggestedPrice}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={copyDraft}>
          <Copy className="size-3.5" /> Use This Draft
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/dashboard" onClick={onClose}>
            <PlusCircle className="size-3.5" /> Create Listing
          </Link>
        </Button>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-3xl rounded-bl-md border border-border bg-card px-3.5 py-3 text-sm text-muted-foreground shadow-sm">
        <Loader2 className="size-4 animate-spin" />
        Loopi is searching...
      </div>
    </div>
  );
}
