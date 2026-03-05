// Import from Prisma for internal use
import {
  SignalType as PrismaSignalType,
} from "@prisma/client/index.js";

// Re-export Prisma types for use throughout the app
export type {
  Product,
  Drop,
  Signal,
  RetailerMonitor,
  TradeShow,
  UserPreference,
  DiscordWebhook,
} from "@prisma/client/index.js";

export {
  Game,
  ProductType,
  Retailer,
  DropType,
  DropStatus,
  SignalType,
  ShowType,
  ShowTier,
} from "@prisma/client/index.js";

// Queue provider types for signal detection
export type QueueProvider = "QUEUE_IT" | "CLOUDFLARE" | "CUSTOM" | "NONE";

// Signal detection result from scrapers
export interface SignalDetectionResult {
  url: string;
  detected: boolean;
  signalType: PrismaSignalType | null;
  queueProvider?: QueueProvider;
  metadata: Record<string, unknown>;
}

// Filter types for drop feed
export interface DropFilters {
  game?: string;
  retailer?: string;
  dropType?: string;
  status?: string;
}

// Filter types for trade shows
export interface ShowFilters {
  state?: string;
  showType?: string;
  startDate?: Date;
  endDate?: Date;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Discord embed for notifications
export interface DiscordEmbed {
  title: string;
  description?: string;
  url?: string;
  color?: number;
  thumbnail?: { url: string };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: { text: string };
  timestamp?: string;
}

// Display labels for enums
export const GameLabels: Record<string, string> = {
  POKEMON: "Pokémon",
  MTG: "Magic: The Gathering",
  YUGIOH: "Yu-Gi-Oh!",
  LORCANA: "Lorcana",
  ONEPIECE: "One Piece",
  SPORTS: "Sports Cards",
  OTHER: "Other",
};

export const RetailerLabels: Record<string, string> = {
  POKEMON_CENTER: "Pokémon Center",
  TARGET: "Target",
  WALMART: "Walmart",
  AMAZON: "Amazon",
  GAMESTOP: "GameStop",
  BEST_BUY: "Best Buy",
  TCG_PLAYER: "TCGplayer",
  SHOPIFY: "Shopify Store",
  OTHER: "Other",
};

export const DropTypeLabels: Record<string, string> = {
  NEW_RELEASE: "New Release",
  RESTOCK: "Restock",
  EXCLUSIVE: "Exclusive",
  PREORDER: "Pre-Order",
  FLASH_SALE: "Flash Sale",
};

export const DropStatusLabels: Record<string, string> = {
  UPCOMING: "Upcoming",
  LIVE: "Live Now",
  QUEUE_ACTIVE: "Queue Active",
  SOLD_OUT: "Sold Out",
  CANCELLED: "Cancelled",
};

export const SignalTypeLabels: Record<string, string> = {
  RESTOCK: "Restock",
  QUEUE_DETECTED: "Queue Detected",
  SECURITY_ESCALATED: "Security Escalated",
  PRICE_CHANGE: "Price Change",
  NEW_LISTING: "New Listing",
};

export const ShowTypeLabels: Record<string, string> = {
  CARD_SHOW: "Card Show",
  COMIC_CON: "Comic Con",
  COLLECTACON: "Collect-a-Con",
  REGIONAL_CHAMPIONSHIP: "Regional Championship",
  NATIONALS: "Nationals",
  GAME_STORE_EVENT: "Game Store Event",
  OTHER: "Other",
};

export const ShowTierLabels: Record<string, string> = {
  LOCAL: "Local",
  REGIONAL: "Regional",
  MAJOR: "Major",
  NATIONAL: "National",
};
