import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Retailer } from "@prisma/client/index.js";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

// Monitor seed data
interface MonitorSeed {
  url: string;
  retailer: Retailer;
}

// Pokemon Center URLs
const pokemonCenterUrls: MonitorSeed[] = [
  { url: "https://www.pokemoncenter.com/product/290-85712/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85713/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85714/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-poster-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85680/pokemon-tcg-scarlet-and-violet-surging-sparks-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85681/pokemon-tcg-scarlet-and-violet-surging-sparks-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85629/pokemon-tcg-scarlet-and-violet-stellar-crown-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85630/pokemon-tcg-scarlet-and-violet-stellar-crown-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85579/pokemon-tcg-scarlet-and-violet-shrouded-fable-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85526/pokemon-tcg-scarlet-and-violet-twilight-masquerade-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85527/pokemon-tcg-scarlet-and-violet-twilight-masquerade-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85475/pokemon-tcg-scarlet-and-violet-temporal-forces-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85425/pokemon-tcg-scarlet-and-violet-paldean-fates-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85300/pokemon-tcg-pokemon-151-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85700/pokemon-tcg-scarlet-and-violet-ultra-premium-collection-charizard", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85800/pokemon-tcg-collector-chest-spring-2025", retailer: "POKEMON_CENTER" },
];

// Target URLs
const targetUrls: MonitorSeed[] = [
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-elite-trainer-box/-/A-91234567", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-booster-bundle/-/A-91234568", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-surging-sparks-elite-trainer-box/-/A-90876543", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-stellar-crown-elite-trainer-box/-/A-90654321", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-twilight-masquerade-elite-trainer-box/-/A-90432109", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-paldean-fates-elite-trainer-box/-/A-89876543", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-pokemon-151-elite-trainer-box/-/A-89654321", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-foundations-play-booster-box/-/A-91456789", retailer: "TARGET" },
  { url: "https://www.target.com/p/yu-gi-oh-alliance-insight-booster-box/-/A-91567890", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-shimmering-skies-booster-box/-/A-91678901", retailer: "TARGET" },
];

// Walmart URLs
const walmartUrls: MonitorSeed[] = [
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Prismatic-Evolutions-Elite-Trainer-Box/1234567890", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Prismatic-Evolutions-Booster-Bundle/1234567891", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Surging-Sparks-Elite-Trainer-Box/9876543210", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Stellar-Crown-Elite-Trainer-Box/8765432109", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Paldean-Fates-Elite-Trainer-Box/5432109876", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Pokemon-151-Elite-Trainer-Box/4321098765", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-Gathering-Foundations-Play-Booster-Box/2109876543", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Yu-Gi-Oh-Alliance-Insight-Booster-Box/1122334455", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Disney-Lorcana-Shimmering-Skies-Booster-Box/3344556677", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/One-Piece-Card-Game-OP-09-Booster-Box/5566778899", retailer: "WALMART" },
];

// GameStop URLs
const gamestopUrls: MonitorSeed[] = [
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-elite-trainer-box/401234567.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-booster-bundle/401234568.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-surging-sparks-elite-trainer-box/400987654.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-stellar-crown-elite-trainer-box/400876543.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-paldean-fates-elite-trainer-box/400543210.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/magic-gathering-foundations-play-booster-box/401456789.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/yu-gi-oh-alliance-insight-booster-box/401567890.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/disney-lorcana-shimmering-skies-booster-box/401678901.html", retailer: "GAMESTOP" },
];

// Best Buy URLs
const bestbuyUrls: MonitorSeed[] = [
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-elite-trainer-box/6591234.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-booster-bundle/6591235.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-surging-sparks-elite-trainer-box/6589876.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-stellar-crown-elite-trainer-box/6588765.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-paldean-fates-elite-trainer-box/6585432.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/magic-gathering-foundations-play-booster-box/6593456.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/disney-lorcana-shimmering-skies-booster-box/6594567.p", retailer: "BEST_BUY" },
];

// Amazon URLs
const amazonUrls: MonitorSeed[] = [
  { url: "https://www.amazon.com/dp/B0DPRISEVO1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DPRISEVO2", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DSURGSPR1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DSTELLAR1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DPALDFAT1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DPOKE1511", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DFOUNDMG1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DALLIINS1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DSHIMMER1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DONEPC091", retailer: "AMAZON" },
];

// TCGPlayer URLs
const tcgplayerUrls: MonitorSeed[] = [
  { url: "https://www.tcgplayer.com/product/573456/pokemon-sv-prismatic-evolutions-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/573457/pokemon-sv-prismatic-evolutions-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/569876/pokemon-sv-surging-sparks-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/567654/pokemon-sv-stellar-crown-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/580123/magic-foundations-play-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/585678/yugioh-alliance-insight-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/590123/lorcana-shimmering-skies-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/595678/one-piece-op-09-booster-box", retailer: "TCG_PLAYER" },
];

const allMonitors: MonitorSeed[] = [
  ...pokemonCenterUrls,
  ...targetUrls,
  ...walmartUrls,
  ...gamestopUrls,
  ...bestbuyUrls,
  ...amazonUrls,
  ...tcgplayerUrls,
];

// POST /api/monitors/seed - Bulk seed monitors (admin only)
export async function POST() {
  try {
    // Check for admin access
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const monitor of allMonitors) {
      try {
        const existing = await prisma.retailerMonitor.findUnique({
          where: { url: monitor.url },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.retailerMonitor.create({
          data: {
            url: monitor.url,
            retailer: monitor.retailer,
          },
        });
        created++;
      } catch (error) {
        errors.push(`${monitor.url}: ${error}`);
      }
    }

    // Get stats by retailer
    const stats = await prisma.retailerMonitor.groupBy({
      by: ["retailer"],
      _count: { id: true },
    });

    const total = await prisma.retailerMonitor.count();

    return NextResponse.json({
      success: true,
      created,
      skipped,
      errors: errors.length,
      errorDetails: errors.slice(0, 10),
      total,
      byRetailer: stats.reduce((acc, s) => {
        acc[s.retailer] = s._count.id;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/monitors/seed - Get seed stats
export async function GET() {
  try {
    const stats = await prisma.retailerMonitor.groupBy({
      by: ["retailer"],
      _count: { id: true },
    });

    const total = await prisma.retailerMonitor.count();

    return NextResponse.json({
      seedAvailable: allMonitors.length,
      currentTotal: total,
      byRetailer: stats.reduce((acc, s) => {
        acc[s.retailer] = s._count.id;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
