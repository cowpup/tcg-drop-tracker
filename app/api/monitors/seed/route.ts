import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Retailer } from "@prisma/client/index.js";
import { extractNameFromUrl } from "@/lib/scrapers/discovery";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

interface MonitorSeed {
  url: string;
  retailer: Retailer;
}

// ============================================================================
// POKEMON CENTER - VERIFIED REAL URLs
// ============================================================================
const pokemonCenterUrls: MonitorSeed[] = [
  // PRISMATIC EVOLUTIONS
  { url: "https://www.pokemoncenter.com/product/100-10019/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/BUNDLE1098/prismatic-evolutions-pokemon-center-elite-trainer-box-espeon-pin-and-playmat-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10027-101/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-super-premium-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10096/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-surprise-box", retailer: "POKEMON_CENTER" },

  // SURGING SPARKS
  { url: "https://www.pokemoncenter.com/product/191-85953/pokemon-tcg-scarlet-and-violet-surging-sparks-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/BUNDLE1157/scarlet-and-violet-surging-sparks-booster-display-box-and-battle-academy-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/191-85957/pokemon-tcg-scarlet-and-violet-surging-sparks-build-and-battle-box", retailer: "POKEMON_CENTER" },

  // OBSIDIAN FLAMES
  { url: "https://www.pokemoncenter.com/product/186-85392/pokemon-tcg-scarlet-and-violet-obsidian-flames-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },

  // DESTINED RIVALS
  { url: "https://www.pokemoncenter.com/product/100-10653/pokemon-tcg-scarlet-and-violet-destined-rivals-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10656/pokemon-tcg-scarlet-and-violet-destined-rivals-build-and-battle-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10638/pokemon-tcg-scarlet-and-violet-destined-rivals-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
];

// ============================================================================
// TARGET - VERIFIED REAL URLs (with actual A-numbers/DPCIs)
// ============================================================================
const targetUrls: MonitorSeed[] = [
  // POKEMON TCG - PRISMATIC EVOLUTIONS
  { url: "https://www.target.com/p/2024-pok-scarlet-violet-s8-5-elite-trainer-box/-/A-93954435", retailer: "TARGET" },

  // POKEMON TCG - SURGING SPARKS
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-38-violet-surging-sparks-elite-trainer-box/-/A-91619922", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-tcg-scarlet-violet-surging-sparks-pokemon-center-elite-trainer-box/-/A-1001539734", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-38-violet-surging-sparks-booster-bundle/-/A-91619929", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-scarlet-violet-surging-sparks-booster-trading-cards/-/A-93486336", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-38-violet-surging-sparks-three-booster-blister-zapados/-/A-91619928", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-38-violet-surging-sparks-three-booster-blister-quagsire/-/A-91619945", retailer: "TARGET" },

  // POKEMON TCG - PALDEAN FATES
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-scarlet-38-violet-8212-paldean-fates-elite-trainer-box/-/A-89432659", retailer: "TARGET" },

  // POKEMON TCG - PALDEA EVOLVED
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-38-violet-paldea-evolved-elite-trainer-box/-/A-88164371", retailer: "TARGET" },

  // DISNEY LORCANA - SHIMMERING SKIES
  { url: "https://www.target.com/p/disney-lorcana-chapter-5-booster-pack-collectible-trading-cards/-/A-92568767", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-chapter-5-trove-box-collectible-trading-cards/-/A-92568771", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-chapter-5-starter-deck-a-collectible-trading-cards/-/A-92568761", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-10-page-portfolio-collectible-trading-cards/-/A-92568763", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-chapter-5-starter-deck-b-collectible-trading-cards/-/A-92568783", retailer: "TARGET" },

  // MAGIC: THE GATHERING - FOUNDATIONS
  { url: "https://www.target.com/p/magic-the-gathering-3-packs-mtg-play-booster-pack-lot-mtg-foundations/-/A-1001539726", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-magic-the-gathering-foundations-jumpstart-2025-booster-box/-/A-1001560162", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-foundations-collector-booster/-/A-93319202", retailer: "TARGET" },
  { url: "https://www.target.com/p/wizards-of-the-coast-magic-the-gathering-foundations-play-booster-box/-/A-1001200700", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-foundations-bundle/-/A-93319190", retailer: "TARGET" },
  { url: "https://www.target.com/p/foundations-magic-the-gathering-jumpstart-booster-box/-/A-1001039708", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-magic-the-gathering-foundations-jumpstart-booster-pack/-/A-1001539594", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-foundations-beginner-box/-/A-93319170", retailer: "TARGET" },
];

// ============================================================================
// WALMART - VERIFIED REAL URLs
// ============================================================================
const walmartUrls: MonitorSeed[] = [
  // POKEMON TCG - PRISMATIC EVOLUTIONS
  { url: "https://www.walmart.com/ip/Pokemon-Scarlet-Violet-Prismatic-Evolutions-Elite-Trainer-Box/13816151308", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pok-mon-Scarlet-Violet-Prismatic-Evolutions-Elite-Trainer-Box-ETB/15160152062", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Scarlet-Violet-Prismatic-Evolutions-Elite-Trainer-Box-ETB/15116619982", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Prismatic-Evolutions-Elite-Trainer-Box-Booster-Bundle/16817304907", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Prismatic-Evolutions-ETB-Elite-Trainer-Box-Pokemon-Center-Exclusive/15036972508", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-SV8-5-Scarlet-and-Violet-Prismatic-Evolutions-Elite-Trainer-Box-2-Pack/15009009930", retailer: "WALMART" },

  // POKEMON TCG - SURGING SPARKS
  { url: "https://www.walmart.com/ip/Pok-mon-TCG-Scarlet-Violet-8-Surging-Sparks-Booster-Display/10677066456", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Trading-Card-Games-Scarlet-Violet-8-Surging-Sparks-Booster-Bundle/10692754252", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pok-mon-Scarlet-Violet-Surging-Sparks-Elite-Trainer-Box/11478805541", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Tcg-Surging-Sparks-18-Packs-Half-Booster-Box/14934256354", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Scarlet-Violet-Surging-Sparks-Booster-Pack-10-Cards/13832571516", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Surging-Sparks-Booster-Bundle/15341224796", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pok-eacute-mon-TCG-Surging-Sparks-Sleeved-Booster/13902900523", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Scarlet-Violet-Surging-Sparks-Booster-Bundle-2-Pack/13762651129", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Surging-Spark-Build-and-Battle-Box/13671073441", retailer: "WALMART" },
];

// ============================================================================
// AMAZON - VERIFIED REAL URLs (with real ASINs)
// ============================================================================
const amazonUrls: MonitorSeed[] = [
  // POKEMON TCG - SCARLET & VIOLET BASE
  { url: "https://www.amazon.com/dp/B0BSNXK3H7", retailer: "AMAZON" }, // SV ETB Random Color
  { url: "https://www.amazon.com/dp/B0BTJ9VYC6", retailer: "AMAZON" }, // SV ETB Miraidon Purple
  { url: "https://www.amazon.com/dp/B0BTJ9SHRY", retailer: "AMAZON" }, // SV ETB Koraidon Red
  { url: "https://www.amazon.com/dp/B0BZQTDQ93", retailer: "AMAZON" }, // SV ETB Miraidon
  { url: "https://www.amazon.com/dp/B0C1LDKZS8", retailer: "AMAZON" }, // SV Pokemon Center ETB Koraidon

  // POKEMON TCG - PRISMATIC EVOLUTIONS
  { url: "https://www.amazon.com/dp/B0DLPL7LC5", retailer: "AMAZON" }, // Prismatic Evolutions ETB

  // POKEMON TCG - JOURNEY TOGETHER
  { url: "https://www.amazon.com/dp/B0DSLY7DZZ", retailer: "AMAZON" }, // Journey Together ETB

  // POKEMON TCG - WHITE FLARE
  { url: "https://www.amazon.com/dp/B0F6Q92F5H", retailer: "AMAZON" }, // White Flare ETB

  // POKEMON TCG - DESTINED RIVALS
  { url: "https://www.amazon.com/dp/B0F2BDXW4J", retailer: "AMAZON" }, // Destined Rivals ETB

  // POKEMON TCG - SHROUDED FABLE
  { url: "https://www.amazon.com/dp/B0D4B4SL9X", retailer: "AMAZON" }, // Shrouded Fable ETB
];

// ============================================================================
// BEST BUY - VERIFIED REAL URLs
// ============================================================================
const bestbuyUrls: MonitorSeed[] = [
  // Prismatic Evolutions (verified from search)
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-elite-trainer-box/6612553.p", retailer: "BEST_BUY" },
];

// ============================================================================
// TCGPLAYER - Common search/category URLs (these work for monitoring)
// ============================================================================
const tcgplayerUrls: MonitorSeed[] = [
  // TCGPlayer sealed product category pages
  { url: "https://www.tcgplayer.com/search/pokemon/sv08-surging-sparks?productLineName=pokemon&setName=sv08-surging-sparks&view=grid&ProductTypeName=Sealed", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/search/pokemon/sv-prismatic-evolutions?productLineName=pokemon&setName=sv-prismatic-evolutions&view=grid&ProductTypeName=Sealed", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/search/pokemon/svp-scarlet-and-violet-promos?productLineName=pokemon&view=grid&ProductTypeName=Sealed", retailer: "TCG_PLAYER" },
];

// Combine all monitors
const allMonitors: MonitorSeed[] = [
  ...pokemonCenterUrls,
  ...targetUrls,
  ...walmartUrls,
  ...amazonUrls,
  ...bestbuyUrls,
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
            name: extractNameFromUrl(monitor.url, monitor.retailer),
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
