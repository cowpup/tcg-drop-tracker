import type { Drop, Product, Signal, DiscordWebhook } from "@prisma/client/index.js";
import type { DiscordEmbed } from "@/types";
import { GameLabels, RetailerLabels, DropTypeLabels, SignalTypeLabels } from "@/types";

// Discord embed color codes
const COLORS = {
  DROP_ALERT: 0x5865f2, // Discord blurple
  RESTOCK: 0x57f287, // Green
  QUEUE_DETECTED: 0xfee75c, // Yellow/Gold
  SECURITY_ESCALATED: 0xed4245, // Red
  PRICE_CHANGE: 0x3498db, // Blue
  NEW_LISTING: 0x9b59b6, // Purple
};

// Rate limiting state
const rateLimitState = new Map<string, { until: number; retries: number }>();

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if webhook matches filter criteria
 */
function webhookMatchesFilters(
  webhook: DiscordWebhook,
  game?: string,
  retailer?: string,
  signalType?: string
): boolean {
  // Empty filter array means "all"
  if (game && webhook.games.length > 0 && !webhook.games.includes(game as never)) {
    return false;
  }
  if (retailer && webhook.retailers.length > 0 && !webhook.retailers.includes(retailer as never)) {
    return false;
  }
  if (signalType && webhook.signalTypes.length > 0 && !webhook.signalTypes.includes(signalType as never)) {
    return false;
  }
  return true;
}

/**
 * Send a message to a Discord webhook with rate limit handling
 */
async function sendToWebhook(
  webhookUrl: string,
  payload: { embeds: DiscordEmbed[] }
): Promise<boolean> {
  // Check rate limit state
  const rateLimit = rateLimitState.get(webhookUrl);
  if (rateLimit && Date.now() < rateLimit.until) {
    console.log(`Webhook rate limited until ${new Date(rateLimit.until).toISOString()}`);
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
      const retries = (rateLimit?.retries || 0) + 1;

      // Exponential backoff
      const backoffMs = waitMs * Math.pow(2, retries - 1);

      rateLimitState.set(webhookUrl, {
        until: Date.now() + backoffMs,
        retries,
      });

      console.log(`Rate limited, waiting ${backoffMs}ms before retry`);

      // Retry after backoff (up to 3 retries)
      if (retries <= 3) {
        await sleep(backoffMs);
        return sendToWebhook(webhookUrl, payload);
      }

      return false;
    }

    // Clear rate limit state on success
    if (response.ok) {
      rateLimitState.delete(webhookUrl);
    }

    return response.ok;
  } catch (error) {
    console.error(`Failed to send webhook: ${error}`);
    return false;
  }
}

/**
 * Build embed for a drop alert
 */
function buildDropEmbed(
  drop: Drop & { product: Product }
): DiscordEmbed {
  const gameName = GameLabels[drop.product.game] || drop.product.game;
  const retailerName = RetailerLabels[drop.retailer] || drop.retailer;
  const dropTypeName = DropTypeLabels[drop.dropType] || drop.dropType;

  const fields = [
    { name: "Game", value: gameName, inline: true },
    { name: "Retailer", value: retailerName, inline: true },
    { name: "Type", value: dropTypeName, inline: true },
  ];

  if (drop.price) {
    fields.push({ name: "Price", value: `$${drop.price.toFixed(2)}`, inline: true });
  }

  if (drop.scheduledAt) {
    fields.push({
      name: "Scheduled",
      value: new Date(drop.scheduledAt).toLocaleString(),
      inline: true,
    });
  }

  return {
    title: drop.product.name,
    description: drop.notes || undefined,
    url: drop.url || undefined,
    color: COLORS.DROP_ALERT,
    thumbnail: drop.product.imageUrl ? { url: drop.product.imageUrl } : undefined,
    fields,
    footer: { text: "TCG Drop Tracker" },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build embed for a signal alert (queue/security)
 */
function buildSignalEmbed(
  signal: Signal & { drop?: (Drop & { product: Product }) | null }
): DiscordEmbed {
  const signalTypeName = SignalTypeLabels[signal.type] || signal.type;
  const retailerName = RetailerLabels[signal.retailer] || signal.retailer;
  const isUrgent = signal.type === "QUEUE_DETECTED" || signal.type === "SECURITY_ESCALATED";

  const color = COLORS[signal.type as keyof typeof COLORS] || COLORS.DROP_ALERT;

  const fields = [
    { name: "Signal Type", value: signalTypeName, inline: true },
    { name: "Retailer", value: retailerName, inline: true },
  ];

  // Add metadata details
  const metadata = signal.metadata as Record<string, unknown>;
  if (metadata?.detectionReason) {
    fields.push({
      name: "Details",
      value: String(metadata.detectionReason),
      inline: false,
    });
  }

  let title = `${isUrgent ? "[URGENT] " : ""}${signalTypeName}`;
  let description = `Signal detected at ${retailerName}`;

  if (signal.drop?.product) {
    title = `${isUrgent ? "[URGENT] " : ""}${signal.drop.product.name}`;
    description = `${signalTypeName} for ${signal.drop.product.name} at ${retailerName}`;
  }

  return {
    title,
    description,
    url: signal.url,
    color,
    fields,
    footer: { text: "TCG Drop Tracker" },
    timestamp: signal.detectedAt.toISOString(),
  };
}

/**
 * Send drop alert to matching webhooks
 */
export async function sendDropAlert(
  drop: Drop & { product: Product },
  webhooks: DiscordWebhook[]
): Promise<{ sent: number; failed: number }> {
  const matchingWebhooks = webhooks.filter(
    (w) =>
      w.active &&
      webhookMatchesFilters(w, drop.product.game, drop.retailer)
  );

  if (matchingWebhooks.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const embed = buildDropEmbed(drop);
  let sent = 0;
  let failed = 0;

  for (const webhook of matchingWebhooks) {
    const success = await sendToWebhook(webhook.webhookUrl, { embeds: [embed] });
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Send signal alert to matching webhooks (for queue/security alerts)
 */
export async function sendSignalAlert(
  signal: Signal & { drop?: (Drop & { product: Product }) | null },
  webhooks: DiscordWebhook[]
): Promise<{ sent: number; failed: number }> {
  const matchingWebhooks = webhooks.filter(
    (w) =>
      w.active &&
      webhookMatchesFilters(
        w,
        signal.drop?.product.game,
        signal.retailer,
        signal.type
      )
  );

  if (matchingWebhooks.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const embed = buildSignalEmbed(signal);
  let sent = 0;
  let failed = 0;

  for (const webhook of matchingWebhooks) {
    const success = await sendToWebhook(webhook.webhookUrl, { embeds: [embed] });
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
