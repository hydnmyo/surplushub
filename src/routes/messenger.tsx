import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  MessageCircle,
  Paperclip,
  RefreshCw,
  RotateCcw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  MAX_IMAGE_SIZE_BYTES,
  SUPPORTED_IMAGE_TYPES,
  useMessenger,
} from "@/components/messenger/MessengerProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  createId,
  otherParticipant,
  type MessageAttachment,
  type MessengerConversation,
  type MessengerMessage,
} from "@/lib/messenger";

export const Route = createFileRoute("/messenger")({
  head: () => ({
    meta: [
      { title: "Messages | SurplusHub" },
      {
        name: "description",
        content: "Buyer and seller conversations for SurplusHub material inquiries.",
      },
    ],
  }),
  component: MessengerPage,
});

type PendingPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  error: string | null;
};

function MessengerPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    backendError,
    backendStatus,
    currentParticipantId,
    markConversationRead,
    retryMessage,
    sendTextMessage,
    state,
  } = useMessenger();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [sending, setSending] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const deviceInputRef = useRef<HTMLInputElement | null>(null);
  const captureFallbackInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inFlightIdRef = useRef<string | null>(null);

  const conversations = useMemo(
    () =>
      [...state.conversations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [state.conversations],
  );

  useEffect(() => {
    if (!selectedConversationId && conversations[0]) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) void markConversationRead(selectedConversationId);
  }, [markConversationRead, selectedConversationId]);

  const selectedConversation =
    conversations.find((item) => item.id === selectedConversationId) ?? null;
  const selectedMessages = useMemo(
    () =>
      state.messages
        .filter((message) => message.conversationId === selectedConversationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [selectedConversationId, state.messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [pendingPhotos.length, selectedMessages]);

  const hasSendableContent = draft.trim().length > 0 || pendingPhotos.length > 0;
  const sendDisabled = !selectedConversationId || !hasSendableContent || sending;

  const addFiles = async (files: FileList | File[]) => {
    const selected = Array.from(files);
    const next: PendingPhoto[] = [];

    for (const file of selected) {
      try {
        const compressed = await prepareImageFile(file);
        next.push({
          id: createId("PHOTO"),
          file: compressed,
          previewUrl: URL.createObjectURL(compressed),
          progress: 0,
          error: null,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not add image.");
      }
    }

    setPendingPhotos((current) => [...current, ...next]);
  };

  const removePhoto = (id: string) => {
    setPendingPhotos((current) => {
      const removed = current.find((photo) => photo.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((photo) => photo.id !== id);
    });
  };

  const sendMessage = async () => {
    if (!selectedConversationId || sendDisabled) return;
    const clientId = createId("MSG");
    if (inFlightIdRef.current === clientId) return;
    inFlightIdRef.current = clientId;
    setSending(true);

    try {
      const attachments = await uploadPendingPhotos(pendingPhotos, {
        backendStatus,
        currentUserId: currentUser?.id ?? "local",
        messageId: clientId,
        onProgress: (id, progress) =>
          setPendingPhotos((current) =>
            current.map((photo) => (photo.id === id ? { ...photo, progress } : photo)),
          ),
      });

      await sendTextMessage(selectedConversationId, {
        body: draft,
        attachments,
        clientId,
      });

      setDraft("");
      pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setPendingPhotos([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Message failed to send.");
      setPendingPhotos((current) =>
        current.map((photo) => ({
          ...photo,
          error: photo.error ?? "Upload or send failed. Try again.",
        })),
      );
    } finally {
      inFlightIdRef.current = null;
      setSending(false);
    }
  };

  if (!currentUser || !currentParticipantId) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <MessageCircle className="size-10 text-primary" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Messages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in to view buyer and seller conversations.
        </p>
        <Button className="mt-5" asChild>
          <Link to="/auth" search={{ redirect: undefined, tab: undefined }}>
            Login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-0 sm:px-6 sm:py-6">
      <section className="grid h-full overflow-hidden border-border bg-background sm:rounded-lg sm:border lg:grid-cols-[360px_1fr]">
        <aside
          className={cn(
            "flex h-full min-h-0 flex-col border-border lg:border-r",
            selectedConversation ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <div>
              <h1 className="font-display text-lg font-semibold">Messages</h1>
              <p className="text-xs text-muted-foreground">Buyer and seller conversations</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close messages"
              onClick={() => void navigate({ to: "/" })}
            >
              <X className="size-4" />
            </Button>
          </div>
          {backendStatus === "local" && backendError ? (
            <div className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-xs text-muted-foreground">
              Messenger backend unavailable: {backendError}
            </div>
          ) : null}
          <ScrollArea className="min-h-0 flex-1">
            {conversations.length > 0 ? (
              <div className="divide-y divide-border">
                {conversations.map((conversation) => (
                  <ConversationRow
                    key={conversation.id}
                    conversation={conversation}
                    currentParticipantId={currentParticipantId}
                    messages={state.messages}
                    selected={conversation.id === selectedConversationId}
                    onSelect={() => setSelectedConversationId(conversation.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                Conversations will appear after a listing is shared or a purchase request is sent.
              </div>
            )}
          </ScrollArea>
        </aside>

        <section
          className={cn("min-h-0 flex-col", selectedConversation ? "flex" : "hidden lg:flex")}
        >
          {selectedConversation ? (
            <>
              <ConversationHeader
                conversation={selectedConversation}
                currentParticipantId={currentParticipantId}
                onBack={() => setSelectedConversationId(null)}
                onClose={() => void navigate({ to: "/" })}
              />
              <ScrollArea className="min-h-0 flex-1 bg-secondary/30">
                <div className="space-y-4 px-4 py-5 sm:px-6">
                  {selectedMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === currentParticipantId}
                      onPreviewImage={setPreviewImage}
                      onRetry={() =>
                        void retryMessage(message.id).catch((error) =>
                          toast.error(error instanceof Error ? error.message : "Retry failed."),
                        )
                      }
                    />
                  ))}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
              <form
                className="border-t border-border bg-background p-3 sm:p-4"
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  void sendMessage();
                }}
              >
                {pendingPhotos.length > 0 && (
                  <PhotoPreviewStrip
                    photos={pendingPhotos}
                    onPreview={setPreviewImage}
                    onRemove={removePhoto}
                  />
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={deviceInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      if (event.target.files) void addFiles(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                  <input
                    ref={captureFallbackInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => {
                      if (event.target.files) void addFiles(event.target.files);
                      event.currentTarget.value = "";
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Attach photo"
                        title="Attach photo"
                      >
                        <Paperclip className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem onClick={() => setCameraOpen(true)}>
                        <Camera className="size-4" /> Take Photo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deviceInputRef.current?.click()}>
                        <ImagePlus className="size-4" /> Choose From Device
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a message..."
                    className="max-h-32 min-h-11 resize-none"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage();
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Send message"
                    title="Send message"
                    disabled={sendDisabled}
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a conversation.
            </div>
          )}
        </section>
      </section>

      <CameraDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onFallback={() => captureFallbackInputRef.current?.click()}
        onUsePhoto={(file) => void addFiles([file])}
      />
      <Dialog open={previewImage !== null} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Photo preview</DialogTitle>
          </DialogHeader>
          {previewImage ? (
            <img
              src={previewImage}
              alt="Selected message attachment"
              className="max-h-[75vh] w-full rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PhotoPreviewStrip({
  onPreview,
  onRemove,
  photos,
}: {
  onPreview: (url: string) => void;
  onRemove: (id: string) => void;
  photos: PendingPhoto[];
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {photos.map((photo) => (
        <div key={photo.id} className="w-20">
          <div className="relative">
            <button type="button" onClick={() => onPreview(photo.previewUrl)} className="block">
              <img
                src={photo.previewUrl}
                alt={photo.file.name}
                className="size-20 rounded-md border border-border object-cover"
              />
            </button>
            <button
              type="button"
              aria-label={`Remove ${photo.file.name}`}
              className="absolute -right-2 -top-2 rounded-full bg-background p-1 shadow"
              onClick={() => onRemove(photo.id)}
            >
              <Trash2 className="size-3" />
            </button>
          </div>
          {photo.progress > 0 ? <Progress value={photo.progress} className="mt-1 h-1" /> : null}
          {photo.error ? <p className="mt-1 text-[10px] text-destructive">{photo.error}</p> : null}
        </div>
      ))}
    </div>
  );
}

function CameraDialog({
  onFallback,
  onOpenChange,
  onUsePhoto,
  open,
}: {
  onFallback: () => void;
  onOpenChange: (open: boolean) => void;
  onUsePhoto: (file: File) => void;
  open: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setCapturedFile(null);
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Live camera is unavailable on this device.");
      onFallback();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Camera permission was denied.");
      onFallback();
    }
  }, [capturedUrl, facingMode, onFallback, stopCamera]);

  useEffect(() => {
    if (open) void startCamera();
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  const capture = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.86),
    );
    if (!blob) return;
    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
    const url = URL.createObjectURL(file);
    setCapturedFile(file);
    setCapturedUrl(url);
    stopCamera();
  };

  const close = () => {
    stopCamera();
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Take Photo</DialogTitle>
        </DialogHeader>
        <div className="overflow-hidden rounded-lg border border-border bg-black">
          {capturedUrl ? (
            <img
              src={capturedUrl}
              alt="Captured photo"
              className="aspect-video w-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="aspect-video w-full object-contain"
            />
          )}
        </div>
        {cameraError ? <p className="text-sm text-destructive">{cameraError}</p> : null}
        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFacingMode((current) => (current === "environment" ? "user" : "environment"))
              }
            >
              <RefreshCw className="size-4" /> Switch
            </Button>
          </div>
          <div className="flex gap-2">
            {capturedUrl ? (
              <>
                <Button type="button" variant="outline" onClick={() => void startCamera()}>
                  <RotateCcw className="size-4" /> Retake
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (capturedFile) onUsePhoto(capturedFile);
                    close();
                  }}
                >
                  Use Photo
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => void capture()}>
                <Camera className="size-4" /> Capture
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConversationRow({
  conversation,
  currentParticipantId,
  messages,
  onSelect,
  selected,
}: {
  conversation: MessengerConversation;
  currentParticipantId: string;
  messages: MessengerMessage[];
  onSelect: () => void;
  selected: boolean;
}) {
  const participant = otherParticipant(conversation, currentParticipantId);
  const conversationMessages = messages
    .filter((message) => message.conversationId === conversation.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latest = conversationMessages[0];
  const unread = conversationMessages.filter(
    (message) =>
      message.senderId !== currentParticipantId && !message.readBy.includes(currentParticipantId),
  ).length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary",
        selected && "bg-mint/70",
      )}
    >
      <Avatar>
        {participant.imageUrl ? (
          <AvatarImage src={participant.imageUrl} alt={participant.name} />
        ) : null}
        <AvatarFallback>{participant.avatarText}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{participant.name}</p>
          {latest ? (
            <time className="shrink-0 text-[11px] text-muted-foreground">
              {formatMessageTime(latest.createdAt)}
            </time>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {latest ? latestPreview(latest) : "No messages yet"}
        </p>
      </div>
      {unread > 0 ? (
        <span className="flex min-w-5 items-center justify-center rounded-full bg-emerald px-1.5 text-[10px] font-bold leading-5 text-primary-foreground">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </button>
  );
}

function ConversationHeader({
  conversation,
  currentParticipantId,
  onBack,
  onClose,
}: {
  conversation: MessengerConversation;
  currentParticipantId: string;
  onBack: () => void;
  onClose: () => void;
}) {
  const participant = otherParticipant(conversation, currentParticipantId);

  return (
    <div className="flex h-16 items-center gap-3 border-b border-border px-3 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Back to conversations"
        className="lg:hidden"
        onClick={onBack}
      >
        <ArrowLeft className="size-4" />
      </Button>
      <Avatar className="size-9">
        {participant.imageUrl ? (
          <AvatarImage src={participant.imageUrl} alt={participant.name} />
        ) : null}
        <AvatarFallback>{participant.avatarText}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold">{participant.name}</h2>
        <p className="text-xs text-muted-foreground">
          {participant.role === "buyer" ? "Buyer" : "Seller"}
        </p>
      </div>
      <Button variant="ghost" size="icon" aria-label="Close messages" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  );
}

function MessageBubble({
  isOwn,
  message,
  onPreviewImage,
  onRetry,
}: {
  isOwn: boolean;
  message: MessengerMessage;
  onPreviewImage: (url: string) => void;
  onRetry: () => void;
}) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[min(36rem,82vw)] space-y-2", isOwn && "items-end")}>
        {message.body && (
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm shadow-sm",
              isOwn ? "bg-primary text-primary-foreground" : "border border-border bg-background",
            )}
          >
            <p className="whitespace-pre-wrap leading-6">{message.body}</p>
          </div>
        )}
        {message.attachments?.map((attachment) => (
          <button
            key={attachment.id}
            type="button"
            className="block cursor-pointer"
            onClick={() => onPreviewImage(attachment.url)}
          >
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-h-72 rounded-lg border border-border object-cover"
            />
          </button>
        ))}
        {message.sharedListing ? <SharedListingCard listing={message.sharedListing} /> : null}
        {message.purchaseRequest ? <PurchaseRequestCard request={message.purchaseRequest} /> : null}
        <div className={cn("flex items-center gap-2 px-1", isOwn && "justify-end")}>
          <p className="text-[11px] text-muted-foreground">
            {formatMessageTime(message.createdAt)} · {message.status}
          </p>
          {message.status === "failed" ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SharedListingCard({
  listing,
}: {
  listing: NonNullable<MessengerMessage["sharedListing"]>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      <img
        src={listing.imageUrl}
        alt={listing.title}
        className="aspect-[5/2] w-full object-cover"
      />
      <div className="space-y-3 p-3">
        <div>
          <p className="text-xs text-muted-foreground">{listing.category}</p>
          <h3 className="text-sm font-semibold">{listing.title}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Quantity</p>
            <p className="font-medium">{listing.quantity}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Price</p>
            <p className="font-medium">{listing.price}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium">Shared</p>
          </div>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to="/marketplace/$id" params={{ id: listing.listingId }}>
            View Listing
          </Link>
        </Button>
      </div>
    </div>
  );
}

function PurchaseRequestCard({
  request,
}: {
  request: NonNullable<MessengerMessage["purchaseRequest"]>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-primary/20 bg-background shadow-sm">
      <img
        src={request.imageUrl}
        alt={request.title}
        className="aspect-[5/2] w-full object-cover"
      />
      <div className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Purchase request</p>
            <h3 className="text-sm font-semibold">{request.title}</h3>
          </div>
          <Badge variant={request.status === "Pending" ? "warning" : "verified"}>
            {request.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Quantity</p>
            <p className="font-medium">{request.quantity}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Price</p>
            <p className="font-medium">{request.price}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium">{request.status}</p>
          </div>
        </div>
        {request.buyerNote ? (
          <p className="text-xs leading-5 text-muted-foreground">{request.buyerNote}</p>
        ) : null}
        <Button size="sm" variant="outline" asChild>
          <Link to="/marketplace/$id" params={{ id: request.listingId }}>
            View Listing
          </Link>
        </Button>
      </div>
    </div>
  );
}

async function uploadPendingPhotos(
  photos: PendingPhoto[],
  {
    backendStatus,
    currentUserId,
    messageId,
    onProgress,
  }: {
    backendStatus: "checking" | "supabase" | "local";
    currentUserId: string;
    messageId: string;
    onProgress: (id: string, progress: number) => void;
  },
): Promise<MessageAttachment[]> {
  const attachments: MessageAttachment[] = [];

  for (const photo of photos) {
    onProgress(photo.id, 20);

    if (backendStatus === "supabase") {
      const safeName = photo.file.name.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
      const path = `${currentUserId}/${messageId}/${photo.id}-${safeName}`;
      const { error } = await supabase.storage
        .from("messenger-attachments")
        .upload(path, photo.file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      onProgress(photo.id, 85);
      const { data } = supabase.storage.from("messenger-attachments").getPublicUrl(path);
      attachments.push({
        id: photo.id,
        kind: "image",
        name: photo.file.name,
        mimeType: photo.file.type,
        size: photo.file.size,
        url: data.publicUrl,
        storagePath: path,
        uploadProgress: 100,
      });
    } else {
      attachments.push({
        id: photo.id,
        kind: "image",
        name: photo.file.name,
        mimeType: photo.file.type,
        size: photo.file.size,
        url: photo.previewUrl,
        uploadProgress: 100,
      });
    }

    onProgress(photo.id, 100);
  }

  return attachments;
}

async function prepareImageFile(file: File) {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, WebP or GIF images are supported.");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES * 3) {
    throw new Error("Images must be 15 MB or smaller before compression.");
  }
  if (file.type === "image/gif" || file.size <= MAX_IMAGE_SIZE_BYTES) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.82),
  );
  bitmap.close();
  if (!blob) throw new Error("Could not compress image.");
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

function latestPreview(message: MessengerMessage) {
  if (message.purchaseRequest) return `Purchase request: ${message.purchaseRequest.title}`;
  if (message.sharedListing) return `Listing shared: ${message.sharedListing.title}`;
  if (message.attachments?.length) return "Image attachment";
  return message.body;
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
