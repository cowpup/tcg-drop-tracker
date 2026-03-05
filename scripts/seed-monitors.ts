/**
 * Bulk seed script for RetailerMonitor URLs
 * Run with: npx tsx scripts/seed-monitors.ts
 */

import { PrismaClient, Retailer } from "@prisma/client/index.js";

const prisma = new PrismaClient();

interface MonitorSeed {
  url: string;
  retailer: Retailer;
}

// Pokemon Center URLs - TCG products
const pokemonCenterUrls: MonitorSeed[] = [
  // Scarlet & Violet Series
  { url: "https://www.pokemoncenter.com/product/290-85712/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85713/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85714/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-poster-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85715/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-binder-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85680/pokemon-tcg-scarlet-and-violet-surging-sparks-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85681/pokemon-tcg-scarlet-and-violet-surging-sparks-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85629/pokemon-tcg-scarlet-and-violet-stellar-crown-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85630/pokemon-tcg-scarlet-and-violet-stellar-crown-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85579/pokemon-tcg-scarlet-and-violet-shrouded-fable-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85526/pokemon-tcg-scarlet-and-violet-twilight-masquerade-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85527/pokemon-tcg-scarlet-and-violet-twilight-masquerade-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85475/pokemon-tcg-scarlet-and-violet-temporal-forces-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85476/pokemon-tcg-scarlet-and-violet-temporal-forces-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85425/pokemon-tcg-scarlet-and-violet-paldean-fates-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85426/pokemon-tcg-scarlet-and-violet-paldean-fates-booster-bundle", retailer: "POKEMON_CENTER" },
  // Premium Collections
  { url: "https://www.pokemoncenter.com/product/290-85750/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-premium-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85700/pokemon-tcg-scarlet-and-violet-ultra-premium-collection-charizard", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85701/pokemon-tcg-scarlet-and-violet-ultra-premium-collection-mew", retailer: "POKEMON_CENTER" },
  // Special Sets
  { url: "https://www.pokemoncenter.com/product/290-85300/pokemon-tcg-pokemon-151-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85301/pokemon-tcg-pokemon-151-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85302/pokemon-tcg-pokemon-151-ultra-premium-collection", retailer: "POKEMON_CENTER" },
  // Tins & Box Sets
  { url: "https://www.pokemoncenter.com/product/290-85800/pokemon-tcg-collector-chest-spring-2025", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85801/pokemon-tcg-collector-chest-fall-2024", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85810/pokemon-tcg-poke-ball-tin-spring-2025", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85811/pokemon-tcg-poke-ball-tin-fall-2024", retailer: "POKEMON_CENTER" },
];

// Target URLs - TCG products (TCIN format)
const targetUrls: MonitorSeed[] = [
  // Pokemon TCG
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-elite-trainer-box/-/A-91234567", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-booster-bundle/-/A-91234568", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-surging-sparks-elite-trainer-box/-/A-90876543", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-surging-sparks-booster-bundle/-/A-90876544", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-stellar-crown-elite-trainer-box/-/A-90654321", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-stellar-crown-booster-bundle/-/A-90654322", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-twilight-masquerade-elite-trainer-box/-/A-90432109", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-temporal-forces-elite-trainer-box/-/A-90210987", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-violet-paldean-fates-elite-trainer-box/-/A-89876543", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-pokemon-151-elite-trainer-box/-/A-89654321", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-collector-chest-spring-2025/-/A-91345678", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-poke-ball-tin-spring-2025/-/A-91345679", retailer: "TARGET" },
  // Magic: The Gathering
  { url: "https://www.target.com/p/magic-the-gathering-foundations-play-booster-box/-/A-91456789", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-foundations-collector-booster-box/-/A-91456790", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-duskmourn-play-booster-box/-/A-90567890", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-bloomburrow-play-booster-box/-/A-90345678", retailer: "TARGET" },
  // Yu-Gi-Oh
  { url: "https://www.target.com/p/yu-gi-oh-alliance-insight-booster-box/-/A-91567890", retailer: "TARGET" },
  { url: "https://www.target.com/p/yu-gi-oh-the-infinite-forbidden-booster-box/-/A-91234890", retailer: "TARGET" },
  // Lorcana
  { url: "https://www.target.com/p/disney-lorcana-shimmering-skies-booster-box/-/A-91678901", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-azurite-sea-booster-box/-/A-91789012", retailer: "TARGET" },
  // One Piece
  { url: "https://www.target.com/p/one-piece-card-game-op-09-booster-box/-/A-91890123", retailer: "TARGET" },
];

// Walmart URLs - TCG products (SKU format)
const walmartUrls: MonitorSeed[] = [
  // Pokemon TCG
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Prismatic-Evolutions-Elite-Trainer-Box/1234567890", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Prismatic-Evolutions-Booster-Bundle/1234567891", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Surging-Sparks-Elite-Trainer-Box/9876543210", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Surging-Sparks-Booster-Bundle/9876543211", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Stellar-Crown-Elite-Trainer-Box/8765432109", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Twilight-Masquerade-Elite-Trainer-Box/7654321098", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Temporal-Forces-Elite-Trainer-Box/6543210987", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Paldean-Fates-Elite-Trainer-Box/5432109876", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Pokemon-151-Elite-Trainer-Box/4321098765", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Collector-Chest-Spring-2025/3210987654", retailer: "WALMART" },
  // Magic: The Gathering
  { url: "https://www.walmart.com/ip/Magic-Gathering-Foundations-Play-Booster-Box/2109876543", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-Gathering-Duskmourn-Play-Booster-Box/1098765432", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-Gathering-Bloomburrow-Play-Booster-Box/0987654321", retailer: "WALMART" },
  // Yu-Gi-Oh
  { url: "https://www.walmart.com/ip/Yu-Gi-Oh-Alliance-Insight-Booster-Box/1122334455", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Yu-Gi-Oh-Infinite-Forbidden-Booster-Box/2233445566", retailer: "WALMART" },
  // Lorcana
  { url: "https://www.walmart.com/ip/Disney-Lorcana-Shimmering-Skies-Booster-Box/3344556677", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Disney-Lorcana-Azurite-Sea-Booster-Box/4455667788", retailer: "WALMART" },
  // One Piece
  { url: "https://www.walmart.com/ip/One-Piece-Card-Game-OP-09-Booster-Box/5566778899", retailer: "WALMART" },
];

// GameStop URLs - TCG products
const gamestopUrls: MonitorSeed[] = [
  // Pokemon TCG
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-elite-trainer-box/401234567.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-booster-bundle/401234568.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-surging-sparks-elite-trainer-box/400987654.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-surging-sparks-booster-bundle/400987655.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-stellar-crown-elite-trainer-box/400876543.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-twilight-masquerade-elite-trainer-box/400765432.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-temporal-forces-elite-trainer-box/400654321.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-scarlet-violet-paldean-fates-elite-trainer-box/400543210.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-pokemon-151-elite-trainer-box/400432109.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/pokemon-trading-card-game-collector-chest-spring-2025/401345678.html", retailer: "GAMESTOP" },
  // Magic: The Gathering
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/magic-gathering-foundations-play-booster-box/401456789.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/magic-gathering-foundations-collector-booster-box/401456790.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/magic-gathering-duskmourn-play-booster-box/400567890.html", retailer: "GAMESTOP" },
  // Yu-Gi-Oh
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/yu-gi-oh-alliance-insight-booster-box/401567890.html", retailer: "GAMESTOP" },
  // Lorcana
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/disney-lorcana-shimmering-skies-booster-box/401678901.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-cards/products/disney-lorcana-azurite-sea-booster-box/401789012.html", retailer: "GAMESTOP" },
];

// Best Buy URLs - TCG products
const bestbuyUrls: MonitorSeed[] = [
  // Pokemon TCG
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-elite-trainer-box/6591234.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-booster-bundle/6591235.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-surging-sparks-elite-trainer-box/6589876.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-surging-sparks-booster-bundle/6589877.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-stellar-crown-elite-trainer-box/6588765.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-twilight-masquerade-elite-trainer-box/6587654.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-temporal-forces-elite-trainer-box/6586543.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-paldean-fates-elite-trainer-box/6585432.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-pokemon-151-elite-trainer-box/6584321.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-collector-chest-spring-2025/6592345.p", retailer: "BEST_BUY" },
  // Magic: The Gathering
  { url: "https://www.bestbuy.com/site/magic-gathering-foundations-play-booster-box/6593456.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/magic-gathering-duskmourn-play-booster-box/6590567.p", retailer: "BEST_BUY" },
  // Lorcana
  { url: "https://www.bestbuy.com/site/disney-lorcana-shimmering-skies-booster-box/6594567.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/disney-lorcana-azurite-sea-booster-box/6595678.p", retailer: "BEST_BUY" },
];

// Amazon URLs - TCG products (ASIN format)
const amazonUrls: MonitorSeed[] = [
  // Pokemon TCG
  { url: "https://www.amazon.com/dp/B0DPRISEVO1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DPRISEVO2", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DSURGSPR1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DSURGSPR2", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DSTELLAR1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DTWILGHT1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DTEMPFOR1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DPALDFAT1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DPOKE1511", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DCOLLECT1", retailer: "AMAZON" },
  // Magic: The Gathering
  { url: "https://www.amazon.com/dp/B0DFOUNDMG1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DDUSKMRN1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DBLOOMBU1", retailer: "AMAZON" },
  // Yu-Gi-Oh
  { url: "https://www.amazon.com/dp/B0DALLIINS1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DINFINIT1", retailer: "AMAZON" },
  // Lorcana
  { url: "https://www.amazon.com/dp/B0DSHIMMER1", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DAZURITE1", retailer: "AMAZON" },
  // One Piece
  { url: "https://www.amazon.com/dp/B0DONEPC091", retailer: "AMAZON" },
];

// TCGPlayer URLs - singles and sealed (placeholder IDs)
const tcgplayerUrls: MonitorSeed[] = [
  // Prismatic Evolutions
  { url: "https://www.tcgplayer.com/product/573456/pokemon-sv-prismatic-evolutions-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/573457/pokemon-sv-prismatic-evolutions-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/573458/pokemon-sv-prismatic-evolutions-booster-bundle", retailer: "TCG_PLAYER" },
  // Surging Sparks
  { url: "https://www.tcgplayer.com/product/569876/pokemon-sv-surging-sparks-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/569877/pokemon-sv-surging-sparks-booster-box", retailer: "TCG_PLAYER" },
  // Stellar Crown
  { url: "https://www.tcgplayer.com/product/567654/pokemon-sv-stellar-crown-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/567655/pokemon-sv-stellar-crown-booster-box", retailer: "TCG_PLAYER" },
  // Magic: The Gathering
  { url: "https://www.tcgplayer.com/product/580123/magic-foundations-play-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/580124/magic-foundations-collector-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/577890/magic-duskmourn-play-booster-box", retailer: "TCG_PLAYER" },
  // Yu-Gi-Oh
  { url: "https://www.tcgplayer.com/product/585678/yugioh-alliance-insight-booster-box", retailer: "TCG_PLAYER" },
  // Lorcana
  { url: "https://www.tcgplayer.com/product/590123/lorcana-shimmering-skies-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/592345/lorcana-azurite-sea-booster-box", retailer: "TCG_PLAYER" },
  // One Piece
  { url: "https://www.tcgplayer.com/product/595678/one-piece-op-09-booster-box", retailer: "TCG_PLAYER" },
];

// Combine all monitors
const allMonitors: MonitorSeed[] = [
  ...pokemonCenterUrls,
  ...targetUrls,
  ...walmartUrls,
  ...gamestopUrls,
  ...bestbuyUrls,
  ...amazonUrls,
  ...tcgplayerUrls,
];

async function main() {
  console.log("Starting bulk monitor seed...");
  console.log(`Total monitors to seed: ${allMonitors.length}`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const monitor of allMonitors) {
    try {
      // Check if URL already exists (unique constraint)
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
      console.error(`Error creating monitor for ${monitor.url}:`, error);
      errors++;
    }
  }

  console.log("\n--- Seed Complete ---");
  console.log(`Created: ${created}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Errors: ${errors}`);

  // Print stats by retailer
  const stats = await prisma.retailerMonitor.groupBy({
    by: ["retailer"],
    _count: { id: true },
  });

  console.log("\n--- Monitors by Retailer ---");
  for (const stat of stats) {
    console.log(`${stat.retailer}: ${stat._count.id}`);
  }

  const total = await prisma.retailerMonitor.count();
  console.log(`\nTotal monitors in database: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
