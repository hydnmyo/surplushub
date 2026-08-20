import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/lib/auth";
import {
  MESSENGER_STORAGE_KEY,
  MESSENGER_UPDATED_EVENT,
  addListingMessage,
  buyerParticipantId,
  createId,
  emptyMessengerState,
  loadMessengerState,
  participantIdForUser,
  saveMessengerState,
  unreadCountFor,
  type MessageAttachment,
  type MessengerConversation,
  type MessengerMessage,
  type MessengerState,
} from "@/lib/messenger";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type SendMessageInput = {
  body: string;
  attachments?: MessageAttachment[];
  clientId?: string;
};

type MessengerBackendStatus = "checking" | "supabase" | "local";

type MessengerContextValue = {
  state: MessengerState;
  currentParticipantId: string | null;
  unreadCount: number;
  backendStatus: MessengerBackendStatus;
  backendError: string | null;
  markConversationRead: (conversationId: string) => Promise<void>;
  sendTextMessage: (conversationId: string, input: SendMessageInput) => Promise<MessengerMessage>;
  retryMessage: (messageId: string) => Promise<void>;
  shareListing: (listingId: string) => string | null;
};

type SupabaseMessageRow = {
  id: string;
  conversation_id: string;
  sender_participant_id: string;
  body: string;
  status: "sending" | "sent" | "failed" | "read";
  shared_listing: MessengerMessage["sharedListing"] | null;
  purchase_request: MessengerMessage["purchaseRequest"] | null;
  created_at: string;
};

type SupabaseAttachmentRow = {
  id: string;
  message_id: string;
  kind: "image";
  name: string;
  mime_type: string;
  size: number;
  url: string;
  storage_path: string | null;
};

type SupabaseConversationRow = {
  id: string;
  listing_ids: string[];
  request_ids: string[];
  updated_at: string;
};

type SupabaseParticipantRow = {
  conversation_id: string;
  participant_id: string;
  user_id: string;
  role: "buyer" | "seller";
  name: string;
  avatar_text: string;
  image_url: string | null;
  online: boolean;
};

const MessengerContext = createContext<MessengerContextValue | null>(null);

export function MessengerProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [state, setState] = useState<MessengerState>(() => emptyMessengerState());
  const [backendStatus, setBackendStatus] = useState<MessengerBackendStatus>("checking");
  const [backendError, setBackendError] = useState<string | null>(null);
  const stateRef = useRef(state);
  const currentParticipantId = currentUser ? participantIdForUser(currentUser) : null;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const commitLocal = useCallback((next: MessengerState) => {
    saveMessengerState(next);
    setState(next);
  }, []);

  const loadLocal = useCallback(() => {
    setBackendStatus("local");
    setState(loadMessengerState());
  }, []);

  const loadSupabase = useCallback(async () => {
    if (!currentUser) {
      setState(emptyMessengerState());
      setBackendStatus("local");
      return;
    }

    try {
      const client = supabase as unknown as SupabaseMessengerClient;
      const { data: participantRows, error: participantError } = await client
        .from("messenger_participants")
        .select("*")
        .eq("user_id", currentUser.id);

      if (participantError) throw participantError;
      const participantsForUser = (participantRows ?? []) as SupabaseParticipantRow[];
      const conversationIds = Array.from(
        new Set(participantsForUser.map((row) => row.conversation_id)),
      );

      if (conversationIds.length === 0) {
        setState(emptyMessengerState());
        setBackendStatus("supabase");
        setBackendError(null);
        return;
      }

      const [
        { data: conversationRows, error: conversationError },
        { data: allParticipants, error: allParticipantsError },
      ] = await Promise.all([
        client.from("messenger_conversations").select("*").in("id", conversationIds),
        client.from("messenger_participants").select("*").in("conversation_id", conversationIds),
      ]);

      if (conversationError) throw conversationError;
      if (allParticipantsError) throw allParticipantsError;

      const { data: messageRows, error: messageError } = await client
        .from("messenger_messages")
        .select("*")
        .in("conversation_id", conversationIds);
      if (messageError) throw messageError;

      const supabaseMessages = (messageRows ?? []) as SupabaseMessageRow[];
      const messageIds = supabaseMessages.map((message) => message.id);
      const { data: attachmentRows, error: attachmentError } =
        messageIds.length > 0
          ? await client.from("messenger_attachments").select("*").in("message_id", messageIds)
          : { data: [], error: null };
      if (attachmentError) throw attachmentError;

      const attachmentsByMessage = new Map<string, MessageAttachment[]>();
      ((attachmentRows ?? []) as SupabaseAttachmentRow[]).forEach((attachment) => {
        const list = attachmentsByMessage.get(attachment.message_id) ?? [];
        list.push({
          id: attachment.id,
          kind: attachment.kind,
          name: attachment.name,
          mimeType: attachment.mime_type,
          size: attachment.size,
          url: attachment.url,
          ...(attachment.storage_path ? { storagePath: attachment.storage_path } : {}),
        });
        attachmentsByMessage.set(attachment.message_id, list);
      });

      const supabaseConversations = (conversationRows ?? []) as SupabaseConversationRow[];
      const supabaseParticipants = (allParticipants ?? []) as SupabaseParticipantRow[];

      const conversations: MessengerConversation[] = supabaseConversations.map((conversation) => ({
        id: conversation.id,
        listingIds: conversation.listing_ids,
        requestIds: conversation.request_ids,
        updatedAt: conversation.updated_at,
        participants: supabaseParticipants
          .filter((participant) => participant.conversation_id === conversation.id)
          .map((participant) => ({
            id: participant.participant_id,
            role: participant.role,
            name: participant.name,
            avatarText: participant.avatar_text,
            online: participant.online,
            ...(participant.image_url ? { imageUrl: participant.image_url } : {}),
          })),
      }));

      const messages: MessengerMessage[] = supabaseMessages
        .map((message) => ({
          id: message.id,
          conversationId: message.conversation_id,
          senderId: message.sender_participant_id,
          body: message.body,
          createdAt: message.created_at,
          status: message.status,
          readBy: [],
          ...(attachmentsByMessage.has(message.id)
            ? { attachments: attachmentsByMessage.get(message.id)! }
            : {}),
          ...(message.shared_listing ? { sharedListing: message.shared_listing } : {}),
          ...(message.purchase_request ? { purchaseRequest: message.purchase_request } : {}),
        }))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      setState({ conversations, messages });
      setBackendStatus("supabase");
      setBackendError(null);
    } catch (error) {
      setBackendStatus("local");
      setBackendError(
        error instanceof Error
          ? error.message
          : "Supabase Messenger tables or permissions are unavailable.",
      );
      setState(loadMessengerState());
    }
  }, [currentUser]);

  useEffect(() => {
    void loadSupabase();

    const sync = () => {
      if (backendStatus !== "supabase") setState(loadMessengerState());
    };
    window.addEventListener("storage", sync);
    window.addEventListener(MESSENGER_UPDATED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(MESSENGER_UPDATED_EVENT, sync);
    };
  }, [backendStatus, loadSupabase]);

  useEffect(() => {
    if (!currentUser || backendStatus !== "supabase") return;

    const client = supabase as unknown as SupabaseMessengerClient;
    const channel = client
      .channel(`messenger:user:${currentUser.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messenger_messages" },
        () => void loadSupabase(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messenger_attachments" },
        () => void loadSupabase(),
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [backendStatus, currentUser, loadSupabase]);

  const markConversationRead = useCallback(
    async (conversationId: string) => {
      if (!currentParticipantId) return;
      const now = new Date().toISOString();
      const next = {
        ...stateRef.current,
        messages: stateRef.current.messages.map((message) =>
          message.conversationId === conversationId &&
          !message.readBy.includes(currentParticipantId)
            ? {
                ...message,
                status: message.senderId === currentParticipantId ? message.status : "read",
                readBy: [...message.readBy, currentParticipantId],
              }
            : message,
        ),
      };
      if (backendStatus === "local") commitLocal(next);
      else setState(next);

      if (backendStatus === "supabase" && currentUser) {
        const client = supabase as unknown as SupabaseMessengerClient;
        await client.from("messenger_reads").upsert({
          conversation_id: conversationId,
          participant_id: currentParticipantId,
          user_id: currentUser.id,
          last_read_at: now,
        });
      }
    },
    [backendStatus, commitLocal, currentParticipantId, currentUser],
  );

  const sendTextMessage = useCallback(
    async (conversationId: string, input: SendMessageInput) => {
      if (!currentParticipantId || !currentUser) throw new Error("Sign in to send messages.");
      const body = input.body.trim();
      if (!body && (!input.attachments || input.attachments.length === 0)) {
        throw new Error("Write a message or attach a photo first.");
      }

      const existing = stateRef.current.messages.find((message) => message.id === input.clientId);
      if (existing?.status === "sending" || existing?.status === "sent") return existing;

      const conversation = stateRef.current.conversations.find(
        (item) => item.id === conversationId,
      );
      if (
        !conversation?.participants.some((participant) => participant.id === currentParticipantId)
      ) {
        throw new Error("You are not part of this conversation.");
      }

      const now = new Date().toISOString();
      const optimistic: MessengerMessage = {
        id: input.clientId ?? createId("MSG"),
        conversationId,
        senderId: currentParticipantId,
        body,
        createdAt: now,
        status: "sending",
        readBy: [currentParticipantId],
        ...(input.attachments?.length ? { attachments: input.attachments } : {}),
      };

      const withoutDuplicate = stateRef.current.messages.filter(
        (message) => message.id !== optimistic.id,
      );
      const optimisticState = {
        conversations: stateRef.current.conversations.map((item) =>
          item.id === conversationId ? { ...item, updatedAt: now } : item,
        ),
        messages: [...withoutDuplicate, optimistic],
      };
      setState(optimisticState);
      if (backendStatus === "local") saveMessengerState(optimisticState);

      try {
        if (backendStatus === "supabase") {
          const client = supabase as unknown as SupabaseMessengerClient;
          await client.from("messenger_conversations").upsert({
            id: conversation.id,
            listing_ids: conversation.listingIds,
            request_ids: conversation.requestIds,
            updated_at: now,
          });
          await client.from("messenger_participants").upsert(
            conversation.participants.map((participant) => ({
              conversation_id: conversation.id,
              participant_id: participant.id,
              user_id: participant.id === currentParticipantId ? currentUser.id : participant.id,
              role: participant.role,
              name: participant.name,
              avatar_text: participant.avatarText,
              image_url: participant.imageUrl ?? null,
              online: participant.online,
            })),
          );
          const { error: messageError } = await client.from("messenger_messages").insert({
            id: optimistic.id,
            conversation_id: conversationId,
            sender_participant_id: currentParticipantId,
            sender_user_id: currentUser.id,
            body,
            status: "sent",
            created_at: now,
          });
          if (messageError) throw messageError;

          if (input.attachments?.length) {
            const { error: attachmentError } = await client.from("messenger_attachments").insert(
              input.attachments.map((attachment) => ({
                id: attachment.id,
                message_id: optimistic.id,
                kind: attachment.kind,
                name: attachment.name,
                mime_type: attachment.mimeType,
                size: attachment.size,
                url: attachment.url,
                storage_path: attachment.storagePath ?? null,
              })),
            );
            if (attachmentError) throw attachmentError;
          }
        }

        const sent = { ...optimistic, status: "sent" as const };
        const sentState = {
          conversations: stateRef.current.conversations.map((item) =>
            item.id === conversationId ? { ...item, updatedAt: now } : item,
          ),
          messages: stateRef.current.messages.map((message) =>
            message.id === optimistic.id ? sent : message,
          ),
        };
        if (backendStatus === "local") commitLocal(sentState);
        else setState(sentState);
        return sent;
      } catch (error) {
        const failed: MessengerMessage = {
          ...optimistic,
          status: "failed" as const,
          ...(optimistic.attachments
            ? {
                attachments: optimistic.attachments.map((attachment) => ({
                  ...attachment,
                  error: error instanceof Error ? error.message : "Message failed to send.",
                })),
              }
            : {}),
        };
        const failedState = {
          ...stateRef.current,
          messages: stateRef.current.messages.map((message) =>
            message.id === optimistic.id ? failed : message,
          ),
        };
        setState(failedState);
        if (backendStatus === "local") saveMessengerState(failedState);
        throw error;
      }
    },
    [backendStatus, commitLocal, currentParticipantId, currentUser],
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      const message = stateRef.current.messages.find((item) => item.id === messageId);
      if (!message || message.status !== "failed") return;
      await sendTextMessage(message.conversationId, {
        body: message.body,
        clientId: message.id,
        ...(message.attachments ? { attachments: message.attachments } : {}),
      });
    },
    [sendTextMessage],
  );

  const shareListing = useCallback(
    (listingId: string) => {
      if (!currentUser) return null;
      const conversationId = addListingMessage(listingId, currentUser as AuthUser);
      loadLocal();
      return conversationId;
    },
    [currentUser, loadLocal],
  );

  const unreadCount = useMemo(
    () => (currentParticipantId ? unreadCountFor(state, currentParticipantId) : 0),
    [currentParticipantId, state],
  );

  const value = useMemo(
    () => ({
      state,
      currentParticipantId,
      unreadCount,
      backendStatus,
      backendError,
      markConversationRead,
      retryMessage,
      sendTextMessage,
      shareListing,
    }),
    [
      backendError,
      backendStatus,
      currentParticipantId,
      markConversationRead,
      retryMessage,
      sendTextMessage,
      shareListing,
      state,
      unreadCount,
    ],
  );

  return <MessengerContext.Provider value={value}>{children}</MessengerContext.Provider>;
}

export function useMessenger() {
  const context = useContext(MessengerContext);
  if (!context) throw new Error("useMessenger must be used inside MessengerProvider");
  return context;
}

export const participantIdForBuyer = buyerParticipantId;
export { MESSENGER_STORAGE_KEY };

type QueryResult = Promise<{ data: unknown[] | null; error: Error | null }>;
type WriteResult = Promise<{ error: Error | null }>;

type SupabaseQueryBuilder = {
  eq: (column: string, value: string) => QueryResult;
  in: (column: string, values: string[]) => QueryResult;
  order: (column: string, options: { ascending: boolean }) => QueryResult;
};

type SupabaseChannel = {
  on: (event: string, filter: Record<string, unknown>, callback: () => void) => SupabaseChannel;
  subscribe: () => unknown;
};

type SupabaseMessengerClient = {
  from: (table: string) => {
    select: (columns?: string) => SupabaseQueryBuilder;
    upsert: (payload: unknown) => WriteResult;
    insert: (payload: unknown) => WriteResult;
  };
  channel: (name: string) => SupabaseChannel;
  removeChannel: (channel: unknown) => Promise<unknown>;
};
