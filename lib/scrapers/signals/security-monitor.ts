import { BaseScraper, type HttpResponse } from "../base";
import type { SignalDetectionResult } from "@/types";
import { SignalType } from "@/types";
import type { RetailerMonitor } from "@prisma/client/index.js";

interface SecurityChange {
  statusChanged: boolean;
  bodySizeChanged: boolean;
  cloudflareAppeared: boolean;
  botManagementAppeared: boolean;
  redirectChainChanged: boolean;
}

/**
 * Security Monitor - Detects changes in retailer security posture.
 *
 * Watches for:
 * - HTTP status code changes
 * - Response body size changes (>40% difference)
 * - Cloudflare cf-ray header appearing
 * - Cloudflare bot management cookies appearing
 * - Redirect chain changes
 */
export class SecurityMonitor extends BaseScraper {
  /**
   * Compare current response against stored monitor state
   */
  private detectSecurityChanges(
    response: HttpResponse,
    monitor: RetailerMonitor
  ): SecurityChange {
    const changes: SecurityChange = {
      statusChanged: false,
      bodySizeChanged: false,
      cloudflareAppeared: false,
      botManagementAppeared: false,
      redirectChainChanged: false,
    };

    // Status code changed
    if (monitor.lastStatus !== null && monitor.lastStatus !== response.status) {
      changes.statusChanged = true;
    }

    // Body size changed significantly (>40%)
    if (monitor.lastBodySize !== null && monitor.lastBodySize > 0) {
      const sizeDiff = Math.abs(response.bodySize - monitor.lastBodySize);
      const percentChange = sizeDiff / monitor.lastBodySize;
      if (percentChange > 0.4) {
        changes.bodySizeChanged = true;
      }
    }

    // Cloudflare cf-ray header appeared
    const previousHeaders = (monitor.lastHeaders as Record<string, string>) || {};
    if (!previousHeaders["cf-ray"] && response.headers["cf-ray"]) {
      changes.cloudflareAppeared = true;
    }

    // Bot management cookies appeared
    const previousSetCookie = previousHeaders["set-cookie"] || "";
    const currentSetCookie = response.headers["set-cookie"] || "";
    if (
      !previousSetCookie.includes("__cf_bm") &&
      currentSetCookie.includes("__cf_bm")
    ) {
      changes.botManagementAppeared = true;
    }

    // Redirect chain changed
    const previousChain = (monitor.lastRedirectChain as string[]) || [];
    if (
      previousChain.length !== response.redirectChain.length ||
      previousChain.some((url, i) => url !== response.redirectChain[i])
    ) {
      changes.redirectChainChanged = true;
    }

    return changes;
  }

  /**
   * Determine if changes constitute a security escalation
   */
  private isSecurityEscalation(changes: SecurityChange): boolean {
    // Any of these indicate security escalation
    return (
      changes.cloudflareAppeared ||
      changes.botManagementAppeared ||
      (changes.statusChanged && changes.bodySizeChanged) // Both changed = likely challenge page
    );
  }

  /**
   * Build detection reason string
   */
  private buildDetectionReason(changes: SecurityChange): string {
    const reasons: string[] = [];

    if (changes.cloudflareAppeared) {
      reasons.push("Cloudflare protection activated");
    }
    if (changes.botManagementAppeared) {
      reasons.push("Bot management cookies detected");
    }
    if (changes.statusChanged) {
      reasons.push("HTTP status changed");
    }
    if (changes.bodySizeChanged) {
      reasons.push("Response size changed significantly");
    }
    if (changes.redirectChainChanged) {
      reasons.push("Redirect chain changed");
    }

    return reasons.join("; ");
  }

  /**
   * Check a URL for security changes against stored monitor state
   */
  async checkSecurity(
    url: string,
    monitor: RetailerMonitor
  ): Promise<SignalDetectionResult> {
    const response = await this.fetch(url);

    // If request failed completely, don't report as security change
    if (!response.ok && response.status === 0) {
      return {
        url,
        detected: false,
        signalType: null,
        metadata: {
          statusCode: 0,
          detectionReason: `Request failed: ${response.body}`,
        },
      };
    }

    // First-time check (no previous data) - just return current state
    if (monitor.lastStatus === null) {
      return {
        url,
        detected: false,
        signalType: null,
        metadata: {
          statusCode: response.status,
          bodySize: response.bodySize,
          headers: response.headers,
          redirectChain: response.redirectChain,
        },
      };
    }

    // Compare against previous state
    const changes = this.detectSecurityChanges(response, monitor);
    const isEscalation = this.isSecurityEscalation(changes);

    return {
      url,
      detected: isEscalation,
      signalType: isEscalation ? SignalType.SECURITY_ESCALATED : null,
      metadata: {
        statusCode: response.status,
        bodySize: response.bodySize,
        headers: response.headers,
        redirectChain: response.redirectChain,
        detectionReason: isEscalation
          ? this.buildDetectionReason(changes)
          : undefined,
      },
    };
  }

  /**
   * Standard scrape method (for interface compliance)
   */
  async scrape(url: string): Promise<SignalDetectionResult> {
    const response = await this.fetch(url);

    // Check for any security indicators
    const hasCloudflare = this.hasCloudflareProtection(response);
    const hasBotManagement = this.hasCloudfareBotManagement(response);

    return {
      url,
      detected: hasCloudflare || hasBotManagement,
      signalType: hasCloudflare || hasBotManagement ? SignalType.SECURITY_ESCALATED : null,
      metadata: {
        statusCode: response.status,
        bodySize: response.bodySize,
        headers: response.headers,
        redirectChain: response.redirectChain,
      },
    };
  }
}

// Singleton instance
export const securityMonitor = new SecurityMonitor();
