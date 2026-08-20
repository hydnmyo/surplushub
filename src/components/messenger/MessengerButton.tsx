import { useNavigate } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useMessenger } from "@/components/messenger/MessengerProvider";

export function MessengerButton({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { currentUser, isReady } = useAuth();
  const { unreadCount } = useMessenger();

  const openMessages = () => {
    if (!isReady) return;
    onNavigate?.();

    if (currentUser) {
      void navigate({ to: "/messenger" });
      return;
    }

    void navigate({ to: "/auth", search: { redirect: "/messenger" } });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Messages"
      title="Messages"
      className="relative cursor-pointer"
      onClick={openMessages}
    >
      <MessageCircle className="size-4" />
      {unreadCount > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-emerald px-1 text-[10px] font-bold leading-4 text-primary-foreground ring-2 ring-background">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : (
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-emerald" />
      )}
      {unreadCount > 0 ? <span className="sr-only">{unreadCount} unread messages</span> : null}
    </Button>
  );
}
