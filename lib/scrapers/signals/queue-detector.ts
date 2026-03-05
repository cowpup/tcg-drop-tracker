import { BaseScraper } from "../base";
import type { SignalDetectionResult, QueueProvider } from "@/types";
import { SignalType } from "@/types";

/**
 * Queue Detector - Detects virtual waiting rooms and queue systems.
 *
 * Watches for:
 * - Queue-it redirects and JavaScript
 * - Cloudflare Waiting Room
 * - Generic queue indicators
 */
export class QueueDetector extends BaseScraper {
  /**
   * Check a URL for queue/waiting room activation
   */
  async scrape(url: string): Promise<SignalDetectionResult> {
    const response = await this.fetch(url);

    // If request failed completely
    if (!response.ok && response.status === 0) {
      return {
        url,
        detected: false,
        signalType: null,
        queueProvider: "NONE",
        metadata: {
          statusCode: 0,
          detectionReason: `Request failed: ${response.body}`,
        },
      };
    }

    // Detect queue provider
    const queueProvider = this.detectQueueProvider(response);
    const queueDetected = queueProvider !== "NONE";

    // Build detailed detection reason
    let detectionReason: string | undefined;
    if (queueDetected) {
      switch (queueProvider) {
        case "QUEUE_IT":
          detectionReason = this.getQueueItDetails(response);
          break;
        case "CLOUDFLARE":
          detectionReason = "Cloudflare Waiting Room detected";
          break;
        case "CUSTOM":
          detectionReason = "Custom queue/waiting room detected";
          break;
      }
    }

    return {
      url,
      detected: queueDetected,
      signalType: queueDetected ? SignalType.QUEUE_DETECTED : null,
      queueProvider,
      metadata: {
        statusCode: response.status,
        bodySize: response.bodySize,
        headers: response.headers,
        redirectChain: response.redirectChain,
        detectionReason,
      },
    };
  }

  /**
   * Get detailed Queue-it detection info
   */
  private getQueueItDetails(response: { redirectChain: string[]; body: string }): string {
    const details: string[] = ["Queue-it virtual queue detected"];

    // Check redirect chain for Queue-it domain
    const queueItRedirect = response.redirectChain.find((url) =>
      url.includes("queue-it.net")
    );
    if (queueItRedirect) {
      details.push(`Redirect to: ${new URL(queueItRedirect).hostname}`);
    }

    // Check for Queue-it event ID in body
    const eventIdMatch = response.body.match(/data-queueit-c="([^"]+)"/);
    if (eventIdMatch) {
      details.push(`Event ID: ${eventIdMatch[1]}`);
    }

    return details.join("; ");
  }

  /**
   * Quick check if a URL has an active queue (lighter than full scrape)
   */
  async hasActiveQueue(url: string): Promise<boolean> {
    const result = await this.scrape(url);
    return result.detected;
  }
}

// Singleton instance
export const queueDetector = new QueueDetector();
