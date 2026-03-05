/**
 * Sitemap-based Product Discovery
 * Parses retailer sitemaps to find product URLs at scale
 */

import { Retailer } from "@prisma/client/index.js";
import { extractNameFromUrl } from "./discovery";

export interface DiscoveredProduct {
  url: string;
  retailer: Retailer;
  name?: string;
}

// TCG-related keywords to filter products
const TCG_KEYWORDS = [
  "pokemon",
  "magic-the-gathering",
  "mtg",
  "yugioh",
  "yu-gi-oh",
  "lorcana",
  "one-piece-card",
  "trading-card",
  "booster",
  "elite-trainer",
  "etb",
  "collector-box",
  "blister",
  "bundle",
  "deck",
  "starter",
];

/**
 * Parse XML sitemap and extract URLs
 */
async function parseSitemap(sitemapUrl: string): Promise<string[]> {
  try {
    const response = await fetch(sitemapUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TCGDropTracker/1.0)",
        Accept: "application/xml,text/xml",
      },
    });

    if (!response.ok) return [];

    const xml = await response.text();

    // Extract all URLs from sitemap
    const urlPattern = /<loc>([^<]+)<\/loc>/g;
    const urls: string[] = [];
    let match;

    while ((match = urlPattern.exec(xml)) !== null) {
      urls.push(match[1]);
    }

    return urls;
  } catch (error) {
    console.error(`Failed to parse sitemap ${sitemapUrl}:`, error);
    return [];
  }
}

/**
 * Filter URLs for TCG-related products
 */
function filterTCGProducts(urls: string[]): string[] {
  return urls.filter((url) => {
    const lowercaseUrl = url.toLowerCase();
    return TCG_KEYWORDS.some((keyword) => lowercaseUrl.includes(keyword));
  });
}

/**
 * Pokemon Center Sitemap Discovery
 * Pokemon Center has a well-structured sitemap
 */
export async function discoverFromPokemonCenterSitemap(): Promise<
  DiscoveredProduct[]
> {
  const products: DiscoveredProduct[] = [];

  // Pokemon Center product sitemaps
  const sitemaps = [
    "https://www.pokemoncenter.com/sitemap-product-0.xml",
    "https://www.pokemoncenter.com/sitemap-product-1.xml",
    "https://www.pokemoncenter.com/sitemap-category-0.xml",
  ];

  for (const sitemap of sitemaps) {
    const urls = await parseSitemap(sitemap);

    // Filter for TCG products
    const tcgUrls = urls.filter(
      (url) =>
        url.includes("/product/") &&
        (url.includes("pokemon-tcg") ||
          url.includes("trading-card") ||
          url.includes("elite-trainer") ||
          url.includes("booster"))
    );

    for (const url of tcgUrls) {
      if (!products.find((p) => p.url === url)) {
        products.push({
          url,
          retailer: "POKEMON_CENTER",
          name: extractNameFromUrl(url, "POKEMON_CENTER"),
        });
      }
    }
  }

  return products;
}

/**
 * TCGPlayer Product Discovery
 * Uses TCGPlayer's category pages and API-like endpoints
 */
export async function discoverFromTCGPlayer(): Promise<DiscoveredProduct[]> {
  const products: DiscoveredProduct[] = [];

  // TCGPlayer sealed product categories with their IDs
  const categories = [
    { game: "pokemon", category: "sealed-products" },
    { game: "magic", category: "sealed-products" },
    { game: "yugioh", category: "sealed-products" },
    { game: "disney-lorcana", category: "sealed-products" },
    { game: "one-piece-card-game", category: "sealed-products" },
  ];

  for (const { game, category } of categories) {
    try {
      // TCGPlayer's product listing pages (paginated)
      for (let page = 1; page <= 5; page++) {
        const url = `https://www.tcgplayer.com/search/all/product?productLineName=${game}&view=grid&ProductTypeName=Sealed&page=${page}`;

        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "text/html",
          },
        });

        if (!response.ok) break;

        const html = await response.text();

        // Extract product URLs from search results
        const productPattern = /href="(\/product\/\d+\/[^"]+)"/g;
        let match;

        while ((match = productPattern.exec(html)) !== null) {
          const productUrl = `https://www.tcgplayer.com${match[1]}`;

          if (!products.find((p) => p.url === productUrl)) {
            products.push({
              url: productUrl,
              retailer: "TCG_PLAYER",
              name: extractNameFromUrl(productUrl, "TCG_PLAYER"),
            });
          }
        }

        // If we got fewer than expected products, stop pagination
        if (!html.includes('class="search-result"')) break;
      }
    } catch (error) {
      console.error(`Failed to discover TCGPlayer ${game}:`, error);
    }
  }

  return products;
}

/**
 * Target Product Discovery using their product feed
 */
export async function discoverFromTargetFeed(): Promise<DiscoveredProduct[]> {
  const products: DiscoveredProduct[] = [];

  // Target's TCG-related category IDs
  const categoryIds = [
    "5xtdx", // Trading Cards
    "5xtg5", // Pokemon Trading Cards
    "5xtg7", // Magic The Gathering
    "5xtga", // Yu-Gi-Oh
    "5xtgb", // Disney Lorcana
  ];

  for (const categoryId of categoryIds) {
    try {
      // Target's RedSky API for category products
      const apiUrl = `https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&channel=WEB&count=96&default_purchasability_filter=true&offset=0&page=%2Fc%2F${categoryId}&pricing_store_id=1771&store_ids=1771`;

      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const searchResults = data?.data?.search?.products || [];

      for (const product of searchResults) {
        const tcin = product?.tcin;
        const title = product?.item?.product_description?.title;

        if (tcin && title) {
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const url = `https://www.target.com/p/${slug}/-/A-${tcin}`;

          if (!products.find((p) => p.url.includes(tcin))) {
            products.push({
              url,
              retailer: "TARGET",
              name: title,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Failed to discover Target category ${categoryId}:`, error);
    }
  }

  return products;
}

/**
 * GameStop Discovery using their sitemap
 */
export async function discoverFromGameStopSitemap(): Promise<
  DiscoveredProduct[]
> {
  const products: DiscoveredProduct[] = [];

  // GameStop product sitemap
  const sitemapUrl = "https://www.gamestop.com/sitemap-product.xml";
  const urls = await parseSitemap(sitemapUrl);

  // Filter for trading card products
  const tcgUrls = filterTCGProducts(urls).filter((url) =>
    url.includes("/toys-games/trading-cards/")
  );

  for (const url of tcgUrls) {
    if (!products.find((p) => p.url === url)) {
      products.push({
        url,
        retailer: "GAMESTOP",
        name: extractNameFromUrl(url, "GAMESTOP"),
      });
    }
  }

  return products;
}

/**
 * Best Buy Discovery
 */
export async function discoverFromBestBuy(): Promise<DiscoveredProduct[]> {
  const products: DiscoveredProduct[] = [];

  // Best Buy trading card category
  const searchTerms = [
    "pokemon+elite+trainer+box",
    "pokemon+booster+box",
    "magic+the+gathering+booster",
    "disney+lorcana",
    "yugioh+booster+box",
  ];

  for (const term of searchTerms) {
    try {
      const searchUrl = `https://www.bestbuy.com/site/searchpage.jsp?st=${term}`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html",
        },
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Extract product URLs
      const productPattern = /href="(\/site\/[^"]+\/\d+\.p)"/g;
      let match;

      while ((match = productPattern.exec(html)) !== null) {
        const url = `https://www.bestbuy.com${match[1]}`;

        if (!products.find((p) => p.url === url)) {
          products.push({
            url,
            retailer: "BEST_BUY",
            name: extractNameFromUrl(url, "BEST_BUY"),
          });
        }
      }
    } catch (error) {
      console.error(`Failed to discover Best Buy ${term}:`, error);
    }
  }

  return products;
}

/**
 * Run all sitemap-based discovery
 */
export async function discoverFromAllSitemaps(): Promise<{
  products: DiscoveredProduct[];
  byRetailer: Record<string, number>;
  errors: string[];
}> {
  const allProducts: DiscoveredProduct[] = [];
  const errors: string[] = [];

  // Run all scrapers in parallel
  const results = await Promise.allSettled([
    discoverFromPokemonCenterSitemap(),
    discoverFromTCGPlayer(),
    discoverFromTargetFeed(),
    discoverFromGameStopSitemap(),
    discoverFromBestBuy(),
  ]);

  const retailers = [
    "POKEMON_CENTER",
    "TCG_PLAYER",
    "TARGET",
    "GAMESTOP",
    "BEST_BUY",
  ];

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
