import type { AuthUser } from "@/lib/auth";
import {
  businessById,
  categoryImage,
  categoryName,
  listingById,
  priceLabel,
  type Listing,
} from "@/lib/data";

export const MESSENGER_STORAGE_KEY = "surplushub.messenger.v1";
export const MESSENGER_UPDATED_EVENT = "surplushub.messenger.updated";
export const DEMO_BUYER_ID = "buyer-yangon-craft";
export const DEMO_BUYER_NAME = "Yangon Craft Collective";

export type ParticipantRole = "buyer" | "seller";
export type MessageStatus = "sending" | "sent" | "failed" | "read";
export type PurchaseMessageStatus = "Pending" | "Accepted" | "Rejected" | "Completed" | "Countered";
export type AttachmentKind = "image";

export type MessengerParticipant = {
  id: string;
  role: ParticipantRole;
  name: string;
  avatarText: string;
  imageUrl?: string;
  online: boolean;
};

export type MessageAttachment = {
  id: string;
  kind: AttachmentKind;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  storagePath?: string;
  uploadProgress?: number;
  error?: string;
};

export type SharedListingPayload = {
  listingId: string;
  title: string;
  category: string;
  imageUrl: string;
  price: string;
  quantity: string;
  sellerName: string;
};

export type PurchaseRequestPayload = {
  requestId: string;
  listingId: string;
  title: string;
  imageUrl: string;
  quantity: string;
  price: string;
  buyerNote: string;
  requestedAt: string;
  status: PurchaseMessageStatus;
};

export type MessengerMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  status: MessageStatus;
  readBy: string[];
  attachments?: MessageAttachment[];
  sharedListing?: SharedListingPayload;
  purchaseRequest?: PurchaseRequestPayload;
};

export type MessengerConversation = {
  id: string;
  participants: MessengerParticipant[];
  updatedAt: string;
  listingIds: string[];
  requestIds: string[];
};

export type MessengerState = {
  conversations: MessengerConversation[];
  messages: MessengerMessage[];
};

export const participantIdForUser = (user: AuthUser) =>
  user.role === "business" && user.businessId
    ? sellerParticipantId(user.businessId)
    : buyerParticipantId(user.id);

export const buyerParticipantId = (buyerId: string) => `buyer:${buyerId}`;
export const sellerParticipantId = (businessId: string) => `seller:${businessId}`;

export const demoBuyerUser = {
  id: DEMO_BUYER_ID,
  name: DEMO_BUYER_NAME,
  role: "buyer",
} as const satisfies AuthUser;

export function emptyMessengerState(): MessengerState {
  return { conversations: [], messages: [] };
}

// Mock messaging fallback for the prototype. Replace this function with backend/API
// hydration when SurplusHub messaging is persisted server-side.
export function mockMessengerState(): MessengerState {
  const primaryListing = listingById("cotton-fabric-surplus");
  const secondaryListing = listingById("denim-offcuts");
  const now = Date.now();

  if (!primaryListing || !secondaryListing) return emptyMessengerState();

  const primaryConversationId = createConversationId(DEMO_BUYER_ID, primaryListing.sellerId);
  const secondaryBuyerId = "buyer-eco-bag";
  const secondaryConversationId = createConversationId(secondaryBuyerId, secondaryListing.sellerId);

  return {
    conversations: [
      {
        id: primaryConversationId,
        listingIds: [primaryListing.id],
        requestIds: ["REQ-MOCK-20481"],
        updatedAt: new Date(now - 1000 * 60 * 24).toISOString(),
        participants: [
          {
            id: buyerParticipantId(DEMO_BUYER_ID),
            role: "buyer",
            name: DEMO_BUYER_NAME,
            avatarText: "YC",
            online: true,
          },
          {
            id: sellerParticipantId(primaryListing.sellerId),
            role: "seller",
            name: businessById(primaryListing.sellerId)?.name ?? "SurplusHub Seller",
            avatarText: businessById(primaryListing.sellerId)?.initials ?? "SH",
            online: true,
          },
        ],
      },
      {
        id: secondaryConversationId,
        listingIds: [secondaryListing.id],
        requestIds: [],
        updatedAt: new Date(now - 1000 * 60 * 86).toISOString(),
        participants: [
          {
            id: buyerParticipantId(secondaryBuyerId),
            role: "buyer",
            name: "EcoBag Myanmar",
            avatarText: "EM",
            online: false,
          },
          {
            id: sellerParticipantId(secondaryListing.sellerId),
            role: "seller",
            name: businessById(secondaryListing.sellerId)?.name ?? "SurplusHub Seller",
            avatarText: businessById(secondaryListing.sellerId)?.initials ?? "SH",
            online: true,
          },
        ],
      },
    ],
    messages: [
      {
        id: "MSG-MOCK-1",
        conversationId: primaryConversationId,
        senderId: buyerParticipantId(DEMO_BUYER_ID),
        body: "Hi, can you reserve these rolls for inspection tomorrow morning?",
        createdAt: new Date(now - 1000 * 60 * 68).toISOString(),
        status: "sent",
        readBy: [buyerParticipantId(DEMO_BUYER_ID)],
      },
      {
        id: "MSG-MOCK-2",
        conversationId: primaryConversationId,
        senderId: sellerParticipantId(primaryListing.sellerId),
        body: "Yes, we can prepare samples and confirm loading access.",
        createdAt: new Date(now - 1000 * 60 * 42).toISOString(),
        status: "sent",
        readBy: [sellerParticipantId(primaryListing.sellerId)],
      },
      {
        id: "MSG-MOCK-3",
        conversationId: primaryConversationId,
        senderId: buyerParticipantId(DEMO_BUYER_ID),
        body: "Sent a purchase request. Self pickup Preferred date: 2026-08-21",
        createdAt: new Date(now - 1000 * 60 * 24).toISOString(),
        status: "sent",
        readBy: [buyerParticipantId(DEMO_BUYER_ID)],
        purchaseRequest: {
          requestId: "REQ-MOCK-20481",
          listingId: primaryListing.id,
          title: primaryListing.title,
          imageUrl: categoryImage(primaryListing.category),
          quantity: "25 kg",
          price: "112,500 MMK",
          buyerNote: "We need fabric for a small bag production run.",
          requestedAt: "2026-08-21",
          status: "Pending",
        },
      },
      {
        id: "MSG-MOCK-4",
        conversationId: secondaryConversationId,
        senderId: buyerParticipantId(secondaryBuyerId),
        body: "Shared a material listing.",
        createdAt: new Date(now - 1000 * 60 * 86).toISOString(),
        status: "sent",
        readBy: [
          buyerParticipantId(secondaryBuyerId),
          sellerParticipantId(secondaryListing.sellerId),
        ],
        sharedListing: buildSharedListingPayload(secondaryListing),
      },
    ],
  };
}

export function loadMessengerState(): MessengerState {
  if (typeof window === "undefined") return emptyMessengerState();

  try {
    const stored = window.localStorage.getItem(MESSENGER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as MessengerState) : mockMessengerState();
  } catch {
    window.localStorage.removeItem(MESSENGER_STORAGE_KEY);
    return mockMessengerState();
  }
}

export function saveMessengerState(state: MessengerState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MESSENGER_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(MESSENGER_UPDATED_EVENT));
}

export function otherParticipant(
  conversation: MessengerConversation,
  currentParticipantId: string,
) {
  return (
    conversation.participants.find((participant) => participant.id !== currentParticipantId) ??
    conversation.participants[0]!
  );
}

export function unreadCountFor(state: MessengerState, participantId: string) {
  return state.messages.filter(
    (message) => message.senderId !== participantId && !message.readBy.includes(participantId),
  ).length;
}

export function createConversationId(buyerId: string, sellerBusinessId: string) {
  return `conv:${buyerId}:${sellerBusinessId}`;
}

export function upsertConversationForListing(
  state: MessengerState,
  listing: Listing,
  currentUser: AuthUser,
) {
  const seller = businessById(listing.sellerId);
  const isSeller = currentUser.role === "business" && currentUser.businessId === listing.sellerId;
  const buyerId = isSeller ? DEMO_BUYER_ID : currentUser.id;
  const buyerName = isSeller ? DEMO_BUYER_NAME : currentUser.businessName || currentUser.name;
  const conversationId = createConversationId(buyerId, listing.sellerId);
  const existing = state.conversations.find((conversation) => conversation.id === conversationId);

  if (existing) {
    return {
      state,
      conversation: existing,
      currentParticipantId: isSeller
        ? sellerParticipantId(listing.sellerId)
        : buyerParticipantId(buyerId),
    };
  }

  const conversation: MessengerConversation = {
    id: conversationId,
    listingIds: [listing.id],
    requestIds: [],
    updatedAt: new Date().toISOString(),
    participants: [
      {
        id: buyerParticipantId(buyerId),
        role: "buyer",
        name: buyerName,
        avatarText: initialsFor(buyerName),
        online: !isSeller,
      },
      {
        id: sellerParticipantId(listing.sellerId),
        role: "seller",
        name: seller?.name ?? "SurplusHub Seller",
        avatarText: seller?.initials ?? "SH",
        online: isSeller,
      },
    ],
  };

  return {
    state: {
      ...state,
      conversations: [conversation, ...state.conversations],
    },
    conversation,
    currentParticipantId: isSeller
      ? sellerParticipantId(listing.sellerId)
      : buyerParticipantId(buyerId),
  };
}

export function buildSharedListingPayload(listing: Listing): SharedListingPayload {
  const seller = businessById(listing.sellerId);

  return {
    listingId: listing.id,
    title: listing.title,
    category: categoryName(listing.category),
    imageUrl: categoryImage(listing.category),
    price: priceLabel(listing),
    quantity: `${listing.quantity.toLocaleString("en-US")} ${listing.unit}`,
    sellerName: seller?.name ?? "SurplusHub Seller",
  };
}

export function addListingMessage(listingId: string, currentUser: AuthUser) {
  const listing = listingById(listingId);
  if (!listing) throw new Error("Material listing unavailable.");

  let state = loadMessengerState();
  const upserted = upsertConversationForListing(state, listing, currentUser);
  state = upserted.state;

  const now = new Date().toISOString();
  const message: MessengerMessage = {
    id: createId("MSG"),
    conversationId: upserted.conversation.id,
    senderId: upserted.currentParticipantId,
    body: "Shared a material listing.",
    createdAt: now,
    status: "sent",
    readBy: [upserted.currentParticipantId],
    sharedListing: buildSharedListingPayload(listing),
  };

  saveMessengerState({
    conversations: state.conversations.map((conversation) =>
      conversation.id === upserted.conversation.id
        ? {
            ...conversation,
            updatedAt: now,
            listingIds: Array.from(new Set([...conversation.listingIds, listing.id])),
          }
        : conversation,
    ),
    messages: [...state.messages, message],
  });

  return upserted.conversation.id;
}

export function addPurchaseRequestMessage({
  buyerId,
  buyerName,
  fulfillment,
  listingId,
  message,
  offeredPrice,
  preferredDate,
  quantity,
  requestId,
  sellerBusinessId,
  unit,
}: {
  buyerId: string;
  buyerName: string;
  fulfillment: string;
  listingId: string;
  message: string;
  offeredPrice: number;
  preferredDate: string;
  quantity: number;
  requestId: string;
  sellerBusinessId: string;
  unit: string;
}) {
  const listing = listingById(listingId);
  if (!listing) return;

  const buyerUser = { id: buyerId, name: buyerName, role: "buyer" } as const satisfies AuthUser;
  let state = loadMessengerState();
  const upserted = upsertConversationForListing(state, listing, buyerUser);
  state = upserted.state;

  if (state.messages.some((item) => item.purchaseRequest?.requestId === requestId)) return;

  const now = new Date().toISOString();
  const bodyParts = ["Sent a purchase request."];
  if (fulfillment) bodyParts.push(fulfillment);
  if (preferredDate) bodyParts.push(`Preferred date: ${preferredDate}`);

  const newMessage: MessengerMessage = {
    id: createId("MSG"),
    conversationId: upserted.conversation.id,
    senderId: buyerParticipantId(buyerId),
    body: bodyParts.join(" "),
    createdAt: now,
    status: "sent",
    readBy: [buyerParticipantId(buyerId)],
    purchaseRequest: {
      requestId,
      listingId,
      title: listing.title,
      imageUrl: categoryImage(listing.category),
      quantity: `${quantity.toLocaleString("en-US")} ${unit}`,
      price: `${offeredPrice.toLocaleString("en-US")} MMK`,
      buyerNote: message,
      requestedAt: preferredDate || now,
      status: "Pending",
    },
  };

  saveMessengerState({
    conversations: state.conversations.map((conversation) =>
      conversation.id === upserted.conversation.id
        ? {
            ...conversation,
            updatedAt: now,
            requestIds: Array.from(new Set([...conversation.requestIds, requestId])),
            listingIds: Array.from(new Set([...conversation.listingIds, listingId])),
          }
        : conversation,
    ),
    messages: [...state.messages, newMessage],
  });
}

export function syncPurchaseRequestMessageStatus(requestId: string, status: PurchaseMessageStatus) {
  const state = loadMessengerState();
  saveMessengerState({
    ...state,
    conversations: state.conversations.map((conversation) =>
      conversation.requestIds.includes(requestId)
        ? { ...conversation, updatedAt: new Date().toISOString() }
        : conversation,
    ),
    messages: state.messages.map((message) =>
      message.purchaseRequest?.requestId === requestId
        ? {
            ...message,
            purchaseRequest: {
              ...message.purchaseRequest,
              status,
            },
          }
        : message,
    ),
  });
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
