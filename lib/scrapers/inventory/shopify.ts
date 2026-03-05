import { BaseScraper } from "../base";
import type { SignalDetectionResult } from "@/types";
import { SignalType } from "@/types";

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    available: boolean;
    inventory_quantity?: number;
  }>;
}

interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

/**
 * Generic Shopify inventory scraper.
 * Works with any Shopify store by accessing the public /products.json endpoint.
 */
export class ShopifyScraper extends BaseScraper {
  /**
   * Fetch all products from a Shopify store
   */
  async getProducts(storeUrl: string): Promise<ShopifyProduct[]> {
    const url = new URL("/products.json", storeUrl);
    url.searchParams.set("limit", "250");

    const response = await this.fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    try {
      const data = JSON.parse(response.body) as ShopifyProductsResponse;
      return data.products || [];
    } catch {
      throw new Error("Failed to parse Shopify products response");
    }
  }

  /**
   * Check availability for a specific product handle
   */
  async checkProductAvailability(
    storeUrl: string,
    productHandle: string
  ): Promise<{
    available: boolean;
    variants: Array<{ title: string; available: boolean; price: string }>;
  }> {
    const url = new URL(`/products/${productHandle}.json`, storeUrl);
    const response = await this.fetch(url.toString());

    if (!response.ok) {
      return { available: false, variants: [] };
    }

    try {
      const data = JSON.parse(response.body) as { product: ShopifyProduct };
      const variants = data.product.variants.map((v) => ({
        title: v.title,
        available: v.available,
        price: v.price,
      }));

      return {
        available: variants.some((v) => v.available),
        variants,
      };
    } catch {
      return { available: false, variants: [] };
    }
  }

  /**
   * Scrape for inventory changes (restock detection)
   */
  async scrape(url: string): Promise<SignalDetectionResult> {
    try {
      const storeUrl = new URL(url).origin;
      const products = await this.getProducts(storeUrl);

      // Find products that are available
      const availableProducts = products.filter((p) =>
        p.variants.some((v) => v.available)
      );

      return {
        url,
        detected: availableProducts.length > 0,
        signalType: availableProducts.length > 0 ? SignalType.RESTOCK : null,
        metadata: {
          totalProducts: products.length,
          availableProducts: availableProducts.length,
          products: availableProducts.slice(0, 5).map((p) => ({
            title: p.title,
            handle: p.handle,
            variants: p.variants
              .filter((v) => v.available)
              .map((v) => ({ title: v.title, price: v.price })),
          })),
        },
      };
    } catch (error) {
      return {
        url,
        detected: false,
        signalType: null,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }
}

// Singleton instance
export const shopifyScraper = new ShopifyScraper();
