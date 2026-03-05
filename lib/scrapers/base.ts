import type { SignalDetectionResult, QueueProvider } from "@/types";

// Realistic browser headers for plain HTTP requests
const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
  bodySize: number;
  redirectChain: string[];
  ok: boolean;
}

export interface ScraperConfig {
  timeout?: number;
  headers?: Record<string, string>;
  followRedirects?: boolean;
  maxRedirects?: number;
}

const DEFAULT_CONFIG: Required<ScraperConfig> = {
  timeout: 10000,
  headers: DEFAULT_HEADERS,
  followRedirects: true,
  maxRedirects: 5,
};

/**
 * Base scraper class for making HTTP requests with realistic browser headers.
 * Designed for signal detection (security monitoring, queue detection).
 */
export abstract class BaseScraper {
  protected config: Required<ScraperConfig>;

  constructor(config: ScraperConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Make a plain HTTP GET request with tracking of redirects
   */
  protected async fetch(url: string): Promise<HttpResponse> {
    const redirectChain: string[] = [];
    let currentUrl = url;
    let redirectCount = 0;

    while (redirectCount < this.config.maxRedirects) {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      try {
        const response = await fetch(currentUrl, {
          method: "GET",
          headers: this.config.headers,
          redirect: "manual", // Handle redirects manually to track chain
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check for redirect
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get("location");
          if (location && this.config.followRedirects) {
            redirectChain.push(currentUrl);
            // Handle relative URLs
            currentUrl = new URL(location, currentUrl).toString();
            redirectCount++;
            continue;
          }
        }

        // Read body
        const body = await response.text();

        // Convert headers to plain object
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key.toLowerCase()] = value;
        });

        return {
          status: response.status,
          headers,
          body,
          bodySize: body.length,
          redirectChain,
          ok: response.ok,
        };
      } catch (error) {
        clearTimeout(timeoutId);

        // Return error response
        return {
          status: 0,
          headers: {},
          body: error instanceof Error ? error.message : "Unknown error",
          bodySize: 0,
          redirectChain,
          ok: false,
        };
      }
    }

    // Max redirects exceeded
    return {
      status: 0,
      headers: {},
      body: "Max redirects exceeded",
      bodySize: 0,
      redirectChain,
      ok: false,
    };
  }

  /**
   * Check if response indicates Cloudflare protection
   */
  protected hasCloudflareProtection(response: HttpResponse): boolean {
    const { headers, body } = response;

    // Check for cf-ray header (Cloudflare signature)
    if (headers["cf-ray"]) return true;

    // Check for Cloudflare server header
    if (headers["server"]?.toLowerCase().includes("cloudflare")) return true;

    // Check for Cloudflare challenge page indicators
    if (
      body.includes("cf-browser-verification") ||
      body.includes("cf_chl_opt") ||
      body.includes("__cf_chl_rt_tk")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Check for Cloudflare bot management cookies
   */
  protected hasCloudfareBotManagement(response: HttpResponse): boolean {
    const setCookie = response.headers["set-cookie"] || "";
    return (
      setCookie.includes("__cf_bm") || setCookie.includes("cf_clearance")
    );
  }

  /**
   * Detect queue provider from response
   */
  protected detectQueueProvider(response: HttpResponse): QueueProvider {
    const { headers, body, redirectChain } = response;

    // Queue-it detection
    if (
      redirectChain.some((url) => url.includes("queue-it.net")) ||
      headers["x-queueit-token"] ||
      body.includes("queue-it.net") ||
      body.includes("QueueITHelpers")
    ) {
      return "QUEUE_IT";
    }

    // Cloudflare Waiting Room detection
    if (
      body.includes("cf-waiting-room") ||
      body.includes("Checking if the site connection is secure") ||
      headers["cf-waiting-room"]
    ) {
      return "CLOUDFLARE";
    }

    // Generic queue indicators
    if (
      body.includes("waiting room") ||
      body.includes("virtual queue") ||
      body.includes("you are in line")
    ) {
      return "CUSTOM";
    }

    return "NONE";
  }

  /**
   * Abstract method - implement specific scraping logic
   */
  abstract scrape(url: string): Promise<SignalDetectionResult>;
}
