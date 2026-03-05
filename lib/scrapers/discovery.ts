/**
 * Product Discovery Scrapers
 * Automatically discovers new TCG product URLs from retailer sites
 */

import { Retailer } from "@prisma/client/index.js";

export interface DiscoveredProduct {
  url: string;
  retailer: Retailer;
  name?: string;
}

/**
 * Extract a readable product name from a URL
 */
export function extractNameFromUrl(url: string, retailer: Retailer): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    switch (retailer) {
      case "POKEMON_CENTER": {
        // Format: /product/XXX-XXXXX/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-elite-trainer-box
        const match = path.match(/\/product\/[\w-]+\/([\w-]+)$/);
        if (match) {
          return formatSlugToName(match[1]);
        }
        break;
      }

      case "TARGET": {
        // Format: /p/product-name/-/A-XXXXXXXX
        const match = path.match(/\/p\/([\w-]+)\/-\/A-\d+/);
        if (match) {
          return formatSlugToName(match[1]);
        }
        break;
      }

      case "WALMART": {
        // Format: /ip/Product-Name/XXXXXXXXXX
        const match = path.match(/\/ip\/([\w-]+)\/\d+/);
        if (match) {
          return formatSlugToName(match[1]);
        }
        break;
      }

      case "AMAZON": {
        // Format: /dp/BXXXXXXXXX - name not in URL, return ASIN
        const match = path.match(/\/dp\/([A-Z0-9]+)/);
        if (match) {
          return `Amazon Product ${match[1]}`;
        }
        break;
      }

      case "GAMESTOP": {
        // Format: /toys-games/trading-cards/products/product-name/XXXXXX.html
        const match = path.match(/\/products\/([\w-]+)\/\d+\.html/);
        if (match) {
          return formatSlugToName(match[1]);
        }
        break;
      }

      case "BEST_BUY": {
        // Format: /site/product-name/XXXXXXX.p
        const match = path.match(/\/site\/([\w-]+)\/[\w]+\.p/);
        if (match) {
          return formatSlugToName(match[1]);
        }
        break;
      }

      case "TCG_PLAYER": {
        // Format: /product/XXXXXX/pokemon-sv-prismatic-evolutions-elite-trainer-box
        const match = path.match(/\/product\/\d+\/([\w-]+)/);
        if (match) {
          return formatSlugToName(match[1]);
        }
        break;
      }
    }

    // Fallback: use the last path segment
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0) {
      return formatSlugToName(segments[segments.length - 1]);
    }

    return "Unknown Product";
  } catch {
    return "Unknown Product";
  }
}

/**
 * Convert a URL slug to a readable name
 * e.g., "pokemon-tcg-scarlet-and-violet-prismatic-evolutions-elite-trainer-box"
 * -> "Pokemon TCG Scarlet And Violet Prismatic Evolutions Elite Trainer Box"
 */
function formatSlugToName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map(word => {
      // Keep common acronyms uppercase
      const acronyms = ["tcg", "etb", "ex", "gx", "sv", "mtg"];
      if (acronyms.includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .trim();
}

/**
 * Pokemon Center Discovery
 * Uses their search/category API endpoints
 */
export async function discoverPokemonCenter(): Promise<DiscoveredProduct[]> {
  const products: DiscoveredProduct[] = [];

  // Pokemon Center category endpoints to scrape
  const categories = [
    "trading-card-game",
    "elite-trainer-box",
    "booster-packs",
    "boxed-sets",
    "prismatic-evolutions",
    "surging-sparks",
    "destined-rivals",
    "journey-together",
  ];

  for (const category of categories) {
    try {
      // Try to fetch the category page
      const response = await fetch(
        `https://www.pokemoncenter.com/category/${category}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
          },
        }
      );

      if (!response.ok) continue;

      const html = await response.text();

      // Extract product URLs from HTML using regex
      // Pokemon Center URL pattern: /product/XXX-XXXXX/product-name
      const productPattern = /href="(\/product\/[\w-]+\/[\w-]+)"/g;
      let match;

      while ((match = productPattern.exec(html)) !== null) {
        const path = match[1];
        // Filter for TCG products only
        if (path.includes("pokemon-tcg") || path.includes("trading-card")) {
          const url = `https://www.pokemoncenter.com${path}`;
          if (!products.find(p => p.url === url)) {
            products.push({
              url,
              retailer: "POKEMON_CENTER",
              name: extractNameFromUrl(url, "POKEMON_CENTER"),
            });
          }
        }
      }
    } catch (error) {
      console.error(`Failed to discover from Pokemon Center category ${category}:`, error);
    }
  }

  return products;
}

/**
 * Target Discovery
 * Uses Target's RedSky API for product data
 */
export async function discoverTarget(): Promise<DiscoveredProduct[]> {
  const products: DiscoveredProduct[] = [];

  // Target search terms for TCG products
  const searchTerms = [
    "pokemon elite trainer box",
    "pokemon booster box",
    "pokemon tcg",
    "magic the gathering booster",
    "disney lorcana",
    "yugioh booster box",
    "one piece card game",
  ];

  for (const term of searchTerms) {
    try {
      // Target's search API
      const searchUrl = `https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&channel=WEB&count=24&default_purchasability_filter=true&keyword=${encodeURIComponent(term)}&offset=0&page=%2Fs%2F${encodeURIComponent(term)}&pricing_store_id=1771&scheduled_delivery_store_id=1771&store_ids=1771&visitor_id=auto`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
      });

      if (!response.ok) continue;

      const data = await response.json();

      // Extract products from response
      const searchResults = data?.data?.search?.products || [];

      for (const product of searchResults) {
        const tcin = product?.tcin;
        const title = product?.item?.product_description?.title;

        if (tcin) {
          // Construct Target product URL
          const slug = (title || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const url = `https://www.target.com/p/${slug}/-/A-${tcin}`;

          if (!products.find(p => p.url.includes(tcin))) {
            products.push({
              url,
              retailer: "TARGET",
              name: title || extractNameFromUrl(url, "TARGET"),
            });
          }
        }
      }
    } catch (error) {
      console.error(`Failed to discover from Target for "${term}":`, error);
    }
  }

  return products;
}

/**
 * Walmart Discovery
 * Uses Walmart's search API
 */
export async function discoverWalmart(): Promise<DiscoveredProduct[]> {
  const products: DiscoveredProduct[] = [];

  const searchTerms = [
    "pokemon elite trainer box",
    "pokemon booster box tcg",
    "magic the gathering booster box",
    "disney lorcana booster",
    "yugioh booster box",
    "one piece card game booster",
  ];

  for (const term of searchTerms) {
    try {
      // Walmart search page (will likely be blocked, but worth trying)
      const response = await fetch(
        `https://www.walmart.com/search?q=${encodeURIComponent(term)}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html",
          },
        }
      );

      if (!response.ok) continue;

      const html = await response.text();

      // Extract product URLs - Walmart format: /ip/Product-Name/XXXXXXXXXX
      const productPattern = /href="(\/ip\/[^"]+\/\d+)"/g;
      let match;

      while ((match = productPattern.exec(html)) !== null) {
        const path = match[1];
        const url = `https://www.walmart.com${path}`;

        if (!products.find(p => p.url === url)) {
          products.push({
            url,
            retailer: "WALMART",
            name: extractNameFromUrl(url, "WALMART"),
          });
        }
      }
    } catch (error) {
      console.error(`Failed to discover from Walmart for "${term}":`, error);
    }
  }

  return products;
}

/**
 * Amazon Discovery
 * Searches for TCG products via Amazon
 */
export async function discoverAmazon(): Promise<DiscoveredProduct[]> {
  const products: DiscoveredProduct[] = [];

  // Amazon product ASINs we know about - these are harder to discover automatically
  // We'll use known category browse nodes instead
  const knownCategories = [
    // Pokemon TCG category
    "https://www.amazon.com/s?k=pokemon+elite+trainer+box&rh=n%3A165793011",
    "https://www.amazon.com/s?k=pokemon+booster+box&rh=n%3A165793011",
  ];

  for (const categoryUrl of knownCategories) {
    try {
      const response = await fetch(categoryUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html",
        },
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Extract ASINs from Amazon pages
      // Pattern: /dp/BXXXXXXXXX or data-asin="BXXXXXXXXX"
      const asinPattern = /(?:\/dp\/|data-asin=")([A-Z0-9]{10})/g;
      let match;

      while ((match = asinPattern.exec(html)) !== null) {
        const asin = match[1];
        if (asin.startsWith("B")) { // Valid product ASIN
          const url = `https://www.amazon.com/dp/${asin}`;

          if (!products.find(p => p.url === url)) {
            products.push({
              url,
              retailer: "AMAZON",
              name: extractNameFromUrl(url, "AMAZON"),
            });
          }
        }
      }
    } catch (error) {
      console.error(`Failed to discover from Amazon:`, error);
    }
  }

  return products;
}

/**
 * TCGPlayer Discovery
 * Uses TCGPlayer's category pages
 */
export async function discoverTCGPlayer(): Promise<DiscoveredProduct[]> {
  const products: DiscoveredProduct[] = [];

  // TCGPlayer sealed product categories
  const categories = [
    "pokemon",
    "magic",
    "yugioh",
    "disney-lorcana",
    "one-piece-card-game",
  ];

  for (const category of categories) {
    try {
      const response = await fetch(
        `https://www.tcgplayer.com/search/all/product?productLineName=${category}&view=grid&ProductTypeName=Sealed`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html",
          },
        }
      );

      if (!response.ok) continue;

      const html = await response.text();

      // Extract product URLs
      const productPattern = /href="(\/product\/\d+\/[^"]+)"/g;
      let match;

      while ((match = productPattern.exec(html)) !== null) {
        const path = match[1];
        const url = `https://www.tcgplayer.com${path}`;

        if (!products.find(p => p.url === url)) {
          products.push({
            url,
            retailer: "TCG_PLAYER",
            name: extractNameFromUrl(url, "TCG_PLAYER"),
          });
        }
      }
    } catch (error) {
      console.error(`Failed to discover from TCGPlayer category ${category}:`, error);
    }
  }

  return products;
}

/**
 * Run all discovery scrapers
 */
export async function discoverAllProducts(): Promise<{
  products: DiscoveredProduct[];
  byRetailer: Record<string, number>;
  errors: string[];
}> {
  const allProducts: DiscoveredProduct[] = [];
  const errors: string[] = [];

  // Run all scrapers in parallel
  const results = await Promise.allSettled([
    discoverPokemonCenter(),
    discoverTarget(),
    discoverWalmart(),
    discoverAmazon(),
    discoverTCGPlayer(),
  ]);

  const retailers = ["POKEMON_CENTER", "TARGET", "WALMART", "AMAZON", "TCG_PLAYER"];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      allProducts.push(...result.value);
    } else {
      errors.push(`${retailers[index]}: ${result.reason}`);
    }
  });

  // Count by retailer
  const byRetailer: Record<string, number> = {};
  for (const product of allProducts) {
    byRetailer[product.retailer] = (byRetailer[product.retailer] || 0) + 1;
  }

  return {
    products: allProducts,
    byRetailer,
    errors,
  };
}
