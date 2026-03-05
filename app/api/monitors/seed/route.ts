import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Retailer } from "@prisma/client/index.js";
import { extractNameFromUrl } from "@/lib/scrapers/discovery";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

interface MonitorSeed {
  url: string;
  retailer: Retailer;
  name?: string;
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

  // MEGA EVOLUTION SERIES (2025)
  { url: "https://www.pokemoncenter.com/product/10-10372-109/pokemon-tcg-mega-evolution-perfect-order-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },

  // BLACK BOLT
  { url: "https://www.pokemoncenter.com/product/10-10037-118/pokemon-tcg-scarlet-and-violet-black-bolt-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },

  // POKEMON GO
  { url: "https://www.pokemoncenter.com/product/290-85033/pokemon-tcg-pokemon-go-pokemon-center-elite-trainer-box-plus", retailer: "POKEMON_CENTER" },

  // GENERATIONS
  { url: "https://www.pokemoncenter.com/product/290-80148/pokemon-tcg-generations-elite-trainer-box", retailer: "POKEMON_CENTER" },
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

  // POKEMON TCG - OBSIDIAN FLAMES
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-38-violet-obsidian-flames-elite-trainer-box/-/A-89315228", retailer: "TARGET" },

  // DISNEY LORCANA - SHIMMERING SKIES
  { url: "https://www.target.com/p/disney-lorcana-chapter-5-booster-pack-collectible-trading-cards/-/A-92568767", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-chapter-5-trove-box-collectible-trading-cards/-/A-92568771", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-chapter-5-starter-deck-a-collectible-trading-cards/-/A-92568761", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-chapter-5-starter-deck-b-collectible-trading-cards/-/A-92568783", retailer: "TARGET" },

  // DISNEY LORCANA - AZURITE SEA
  { url: "https://www.target.com/p/disney-lorcana-chapter-6-booster-pack-collectible-trading-cards/-/A-92568762", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-chapter-6-trove-box-collectible-trading-cards/-/A-92568775", retailer: "TARGET" },
  { url: "https://www.target.com/p/ravensburger-lorcana-tcg-azurite-sea-booster-pack-1-pack-12-cards/-/A-1001539486", retailer: "TARGET" },

  // DISNEY LORCANA - URSULA'S RETURN
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-ursula-39-s-return-illumineer-39-s-trove/-/A-91351711", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-ursula-39-s-return-booster-display-box/-/A-91351718", retailer: "TARGET" },

  // DISNEY LORCANA - ARCHAZIA'S ISLAND
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-archazia-39-s-island-booster-display-box/-/A-94458806", retailer: "TARGET" },
  { url: "https://www.target.com/p/ravensburger-disney-lorcana-tcg-archazia-s-island-single-booster-pack-12-cards-collectible-trading-cards-ideal-for-disney-fans-tcg-players/-/A-1003298520", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-archazia-39-s-island-illumineer-39-s-trove/-/A-94091389", retailer: "TARGET" },
  { url: "https://www.target.com/p/2025-disney-lorcana-chapter-7-starter-deck/-/A-94091407", retailer: "TARGET" },
  { url: "https://www.target.com/p/2025-disney-lorcana-chaptr-7-starter-deck-btrading-cards/-/A-94091390", retailer: "TARGET" },

  // MAGIC: THE GATHERING - FOUNDATIONS
  { url: "https://www.target.com/p/magic-the-gathering-3-packs-mtg-play-booster-pack-lot-mtg-foundations/-/A-1001539726", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-magic-the-gathering-foundations-jumpstart-2025-booster-box/-/A-1001560162", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-foundations-collector-booster/-/A-93319202", retailer: "TARGET" },
  { url: "https://www.target.com/p/wizards-of-the-coast-magic-the-gathering-foundations-play-booster-box/-/A-1001200700", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-foundations-bundle/-/A-93319190", retailer: "TARGET" },
  { url: "https://www.target.com/p/foundations-magic-the-gathering-jumpstart-booster-box/-/A-1001039708", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-foundations-beginner-box/-/A-93319170", retailer: "TARGET" },

  // MAGIC: THE GATHERING - DUSKMOURN
  { url: "https://www.target.com/p/duskmourn-house-of-horror-magic-the-gathering-play-booster-box/-/A-94187605", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-duskmourn-house-of-horror-collector-booster/-/A-92463469", retailer: "TARGET" },

  // MAGIC: THE GATHERING - OUTLAWS OF THUNDER JUNCTION
  { url: "https://www.target.com/p/magic-the-gathering-outlaws-of-thunder-junction-3-play-booster-pack/-/A-91312555", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-outlaws-of-thunder-junction-bundle/-/A-91312547", retailer: "TARGET" },
  { url: "https://www.target.com/p/outlaws-of-thunder-junction-magic-the-gathering-collector-box/-/A-94187615", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-outlaws-of-thunder-junction-commander-deck-desert-bloom/-/A-91128814", retailer: "TARGET" },

  // MAGIC: THE GATHERING - BLOOMBURROW
  { url: "https://www.target.com/p/magic-the-gathering-bloomburrow-commander-deck-squirreled-away/-/A-1001562603", retailer: "TARGET" },
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
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Surging-Spark-Build-and-Battle-Box/13671073441", retailer: "WALMART" },

  // POKEMON TCG - PALDEAN FATES
  { url: "https://www.walmart.com/ip/Pokemon-Trading-Card-Games-SV4-5-Paldean-Fates-Booster-Bundle/5226743077", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Trading-Card-Game-Scarlet-Violet-Paldean-Fates-LOT-of-36-Booster-Packs-Equivalent-of-a-Booster-Box/5374423200", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/POKEMON-TCG-SCARLET-AND-VIOLET-PALDEAN-FATES-POKEMON-EX-PREMIUM-COLLECTION-Shiny-Sprigatito/5359158942", retailer: "WALMART" },

  // ONE PIECE CARD GAME - OP-09
  { url: "https://www.walmart.com/ip/ONE-PIECE-Card-Game-The-Four-Emperors-OP-09-Booster-Box-Japanese/11455369401", retailer: "WALMART", name: "One Piece Card Game OP-09 The Four Emperors Booster Box (Japanese)" },
  { url: "https://www.walmart.com/ip/One-Piece-Card-Game-OP09-Booster-Box-English-Factory-Sealed-24-packs-Handmade-Promo-TCG-Fabrik/14864461646", retailer: "WALMART", name: "One Piece Card Game OP-09 Booster Box (English)" },
  { url: "https://www.walmart.com/ip/Emperors-in-the-New-World-OP-09-One-Piece-TCG-Bandai-Booster-Box/14553308605", retailer: "WALMART", name: "One Piece TCG OP-09 Emperors in the New World Booster Box" },
  { url: "https://www.walmart.com/ip/One-Piece-OP-09-Emperors-in-the-New-World-Booster-Box-Japanese-24-packs/10752009350", retailer: "WALMART", name: "One Piece Card Game OP-09 New Emperor Booster Box (Japanese)" },

  // ONE PIECE CARD GAME - OP-10
  { url: "https://www.walmart.com/ip/One-Piece-Royal-Blood-Booster-Box-OP10/15549118864", retailer: "WALMART", name: "One Piece Card Game OP-10 Royal Blood Booster Box" },
  { url: "https://www.walmart.com/ip/One-Piece-TCG-Royal-Lineage-OP-10-Japanese-Booster-Box/14575209051", retailer: "WALMART", name: "One Piece TCG OP-10 Royal Lineage Booster Box (Japanese)" },
  { url: "https://www.walmart.com/ip/One-Piece-Trading-Card-Game-Royal-Blood-Return-to-Dressrosa-Booster-Pack-ENGLISH-12-Cards/15593974228", retailer: "WALMART", name: "One Piece TCG Royal Blood Booster Pack (English)" },

  // ONE PIECE CARD GAME - PREMIUM
  { url: "https://www.walmart.com/ip/Bandai-One-Piece-Card-Game-Premium-Booster-The-Best-Storage-Box-Set/16705757026", retailer: "WALMART", name: "One Piece Card Game Premium Booster Storage Box Set" },
];

// ============================================================================
// AMAZON - VERIFIED REAL URLs (with real ASINs and product names)
// ============================================================================
const amazonUrls: MonitorSeed[] = [
  // POKEMON TCG - SCARLET & VIOLET BASE
  { url: "https://www.amazon.com/dp/B0BSNXK3H7", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet Elite Trainer Box (Random Color)" },
  { url: "https://www.amazon.com/dp/B0BTJ9VYC6", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet Elite Trainer Box - Miraidon Purple" },
  { url: "https://www.amazon.com/dp/B0BTJ9SHRY", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet Elite Trainer Box - Koraidon Red" },
  { url: "https://www.amazon.com/dp/B0BZQTDQ93", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet Elite Trainer Box - Miraidon" },
  { url: "https://www.amazon.com/dp/B0C1LDKZS8", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet Pokemon Center Elite Trainer Box (Koraidon)" },

  // POKEMON TCG - PRISMATIC EVOLUTIONS
  { url: "https://www.amazon.com/dp/B0DLPL7LC5", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet Prismatic Evolutions Elite Trainer Box" },

  // POKEMON TCG - JOURNEY TOGETHER
  { url: "https://www.amazon.com/dp/B0DSLY7DZZ", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet Journey Together Elite Trainer Box" },

  // POKEMON TCG - WHITE FLARE
  { url: "https://www.amazon.com/dp/B0F6Q92F5H", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet White Flare Elite Trainer Box" },

  // POKEMON TCG - DESTINED RIVALS
  { url: "https://www.amazon.com/dp/B0F2BDXW4J", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet Destined Rivals Elite Trainer Box" },

  // POKEMON TCG - SHROUDED FABLE
  { url: "https://www.amazon.com/dp/B0D4B4SL9X", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet Shrouded Fable Elite Trainer Box" },

  // POKEMON TCG - 151
  { url: "https://www.amazon.com/dp/B0C8YN3BY4", retailer: "AMAZON", name: "Pokemon TCG Scarlet & Violet 151 Elite Trainer Box" },
];

// ============================================================================
// GAMESTOP - VERIFIED REAL URLs
// ============================================================================
const gamestopUrls: MonitorSeed[] = [
  // POKEMON TCG
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-mega-evolution-elite-trainer-box/20023792.html", retailer: "GAMESTOP", name: "Pokemon TCG Mega Evolution Elite Trainer Box" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-pokemon-go-elite-trainer-box/11202780.html", retailer: "GAMESTOP", name: "Pokemon TCG Pokemon GO Elite Trainer Box" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-prismatic-evolutions-elite-trainer-box/417631.html", retailer: "GAMESTOP", name: "Pokemon TCG Prismatic Evolutions Elite Trainer Box" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-phantasmal-flames-elite-trainer-box/20027391.html", retailer: "GAMESTOP", name: "Pokemon TCG Phantasmal Flames Elite Trainer Box" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-destined-rivals-elite-trainer-box/20021586.html", retailer: "GAMESTOP", name: "Pokemon TCG Destined Rivals Elite Trainer Box" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-and-violet-elite-trainer-box-styles-may-vary/20020096.html", retailer: "GAMESTOP", name: "Pokemon TCG Scarlet & Violet Elite Trainer Box" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-and-violet---obsidian-flames-elite-trainer-box/20020098.html", retailer: "GAMESTOP", name: "Pokemon TCG Scarlet & Violet Obsidian Flames Elite Trainer Box" },
];

// ============================================================================
// BEST BUY - VERIFIED REAL URLs
// Source: bestbuy.com search results
// ============================================================================
const bestbuyUrls: MonitorSeed[] = [
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-elite-trainer-box/6606082.p", retailer: "BEST_BUY", name: "Pokemon TCG Scarlet & Violet Prismatic Evolutions Elite Trainer Box" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-booster-bundle/6606083.p", retailer: "BEST_BUY", name: "Pokemon TCG Scarlet & Violet Prismatic Evolutions Booster Bundle" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-surprise-box/10890190.p", retailer: "BEST_BUY", name: "Pokemon TCG Scarlet & Violet Prismatic Evolutions Surprise Box" },
];

// ============================================================================
// TCGPLAYER - Category/Search URLs
// ============================================================================
const tcgplayerUrls: MonitorSeed[] = [
  { url: "https://www.tcgplayer.com/product/501264/pokemon-sv03-obsidian-flames-obsidian-flames-elite-trainer-box", retailer: "TCG_PLAYER", name: "Pokemon Obsidian Flames Elite Trainer Box" },
  { url: "https://www.tcgplayer.com/product/528771/pokemon-sv-paldean-fates-paldean-fates-booster-bundle", retailer: "TCG_PLAYER", name: "Pokemon Paldean Fates Booster Bundle" },
  { url: "https://www.tcgplayer.com/product/593355/pokemon-sv-prismatic-evolutions-prismatic-evolutions-elite-trainer-box", retailer: "TCG_PLAYER", name: "Pokemon Prismatic Evolutions Elite Trainer Box" },
];

// Combine all monitors
const allMonitors: MonitorSeed[] = [
  ...pokemonCenterUrls,
  ...targetUrls,
  ...walmartUrls,
  ...amazonUrls,
  ...gamestopUrls,
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

        // Use explicit name if provided, otherwise extract from URL
        const name = monitor.name || extractNameFromUrl(monitor.url, monitor.retailer);

        await prisma.retailerMonitor.create({
          data: {
            url: monitor.url,
            retailer: monitor.retailer,
            name,
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
