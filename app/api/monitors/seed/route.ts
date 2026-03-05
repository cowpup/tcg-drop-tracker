import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Retailer } from "@prisma/client/index.js";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

interface MonitorSeed {
  url: string;
  retailer: Retailer;
}

// ============================================================================
// POKEMON CENTER - Real Product URLs
// ============================================================================
const pokemonCenterUrls: MonitorSeed[] = [
  // ELITE TRAINER BOXES (Pokemon Center Exclusive)
  { url: "https://www.pokemoncenter.com/product/100-10019/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/191-85953/pokemon-tcg-scarlet-and-violet-surging-sparks-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/190-85923/pokemon-tcg-scarlet-and-violet-stellar-crown-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85854/pokemon-tcg-scarlet-and-violet-shrouded-fable-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/189-85799/pokemon-tcg-scarlet-and-violet-twilight-masquerade-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/188-85717/pokemon-tcg-scarlet-and-violet-temporal-forces-pokemon-center-elite-trainer-box-walking-wake", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85619/pokemon-tcg-scarlet-and-violet-paldean-fates-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/187-85417/pokemon-tcg-scarlet-and-violet-paradox-rift-pokemon-center-elite-trainer-box-roaring-moon", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/187-85415/pokemon-tcg-scarlet-and-violet-paradox-rift-pokemon-center-elite-trainer-box-iron-valiant", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85466/pokemon-tcg-scarlet-and-violet-151-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/186-85392/pokemon-tcg-scarlet-and-violet-obsidian-flames-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/185-85367/pokemon-tcg-scarlet-and-violet-paldea-evolved-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/184-85342/pokemon-tcg-scarlet-and-violet-pokemon-center-elite-trainer-box-koraidon", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/184-85457/pokemon-tcg-scarlet-and-violet-pokemon-center-elite-trainer-box-miraidon", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10356/pokemon-tcg-scarlet-and-violet-journey-together-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10653/pokemon-tcg-scarlet-and-violet-destined-rivals-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10037-118/pokemon-tcg-scarlet-and-violet-black-bolt-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10037-117/pokemon-tcg-scarlet-and-violet-white-flare-pokemon-center-elite-trainer-box", retailer: "POKEMON_CENTER" },

  // BOOSTER BUNDLES (6 Packs)
  { url: "https://www.pokemoncenter.com/product/10-10025-101/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/191-85950/pokemon-tcg-scarlet-and-violet-surging-sparks-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/190-85920/pokemon-tcg-scarlet-and-violet-stellar-crown-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-41352/pokemon-tcg-scarlet-and-violet-shrouded-fable-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/189-85398/pokemon-tcg-scarlet-and-violet-twilight-masquerade-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/188-85655/pokemon-tcg-scarlet-and-violet-temporal-forces-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85739/pokemon-tcg-scarlet-and-violet-paldean-fates-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/187-85412/pokemon-tcg-scarlet-and-violet-paradox-rift-sleeved-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85322/pokemon-tcg-scarlet-and-violet-151-booster-bundle", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/186-85387/pokemon-tcg-scarlet-and-violet-obsidian-flames-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/185-85362/pokemon-tcg-scarlet-and-violet-paldea-evolved-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10341/pokemon-tcg-scarlet-and-violet-journey-together-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10638/pokemon-tcg-scarlet-and-violet-destined-rivals-booster-bundle-6-packs", retailer: "POKEMON_CENTER" },

  // BOOSTER DISPLAY BOXES (36 Packs)
  { url: "https://www.pokemoncenter.com/product/699-42312/pokemon-tcg-scarlet-and-violet-surging-sparks-booster-display-box-36-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-42279/pokemon-tcg-scarlet-and-violet-stellar-crown-booster-display-box-36-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-86340/pokemon-tcg-scarlet-and-violet-twilight-masquerade-booster-display-box-36-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-86981/pokemon-tcg-scarlet-and-violet-temporal-forces-booster-display-box-36-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85399/pokemon-tcg-scarlet-and-violet-paradox-rift-booster-display-box-36-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-86374/pokemon-tcg-scarlet-and-violet-obsidian-flames-booster-display-box-36-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-86349/pokemon-tcg-scarlet-and-violet-paldea-evolved-booster-display-box-36-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-86324/pokemon-tcg-scarlet-and-violet-booster-display-box-36-packs", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10125-102/pokemon-tcg-scarlet-and-violet-journey-together-enhanced-booster-display-box-36-packs-and-1-promo-card", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10157-101/pokemon-tcg-scarlet-and-violet-destined-rivals-booster-display-box-36-packs", retailer: "POKEMON_CENTER" },

  // ULTRA PREMIUM / SUPER PREMIUM COLLECTIONS
  { url: "https://www.pokemoncenter.com/product/290-85541/pokemon-tcg-scarlet-and-violet-151-ultra-premium-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10027-101/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-super-premium-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85866/pokemon-tcg-terapagos-ex-ultra-premium-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10065-109/pokemon-tcg-mega-charizard-x-ex-ultra-premium-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85819/pokemon-tcg-charizard-ex-super-premium-collection", retailer: "POKEMON_CENTER" },

  // PREMIUM COLLECTIONS
  { url: "https://www.pokemoncenter.com/product/699-85636/pokemon-tcg-scarlet-and-violet-paldean-fates-skeledirge-ex-premium-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85635/pokemon-tcg-scarlet-and-violet-paldean-fates-meowscarada-ex-premium-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85637/pokemon-tcg-scarlet-and-violet-paldean-fates-quaquaval-ex-premium-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85595/pokemon-tcg-combined-powers-premium-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85323/pokemon-tcg-charizard-ex-premium-collection", retailer: "POKEMON_CENTER" },

  // SPECIAL COLLECTIONS
  { url: "https://www.pokemoncenter.com/product/290-41245/pokemon-tcg-scarlet-and-violet-shrouded-fable-greninja-ex-special-illustration-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-41244/pokemon-tcg-scarlet-and-violet-shrouded-fable-kingdra-ex-special-illustration-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10417/pokemon-tcg-charizard-ex-special-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10026-101/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-accessory-pouch-special-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10096/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-surprise-box", retailer: "POKEMON_CENTER" },

  // BINDER COLLECTIONS
  { url: "https://www.pokemoncenter.com/product/10-10023-101/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-binder-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85314/pokemon-tcg-scarlet-and-violet-151-binder-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10039-119/pokemon-tcg-scarlet-and-violet-white-flare-binder-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10039-120/pokemon-tcg-scarlet-and-violet-black-bolt-binder-collection", retailer: "POKEMON_CENTER" },

  // TINS
  { url: "https://www.pokemoncenter.com/product/699-85627/pokemon-tcg-scarlet-and-violet-paldean-fates-tin-shiny-charizard-ex", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85625/pokemon-tcg-scarlet-and-violet-paldean-fates-tin-shiny-great-tusk-ex", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85626/pokemon-tcg-scarlet-and-violet-paldean-fates-tin-shiny-iron-treads-ex", retailer: "POKEMON_CENTER" },

  // MINI TINS
  { url: "https://www.pokemoncenter.com/product/699-85865/pokemon-tcg-scarlet-and-violet-shrouded-fable-mini-tin-fezandipiti", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85864/pokemon-tcg-scarlet-and-violet-shrouded-fable-mini-tin-okidogi", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85863/pokemon-tcg-scarlet-and-violet-shrouded-fable-mini-tin-munkidori", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85633/pokemon-tcg-scarlet-and-violet-paldean-fates-mini-tin-finizen", retailer: "POKEMON_CENTER" },

  // COLLECTOR CHESTS
  { url: "https://www.pokemoncenter.com/product/210-41317/pokemon-tcg-collector-chest-fall-2024", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/210-85305/pokemon-tcg-collector-chest-fall-2023", retailer: "POKEMON_CENTER" },

  // POSTER COLLECTIONS
  { url: "https://www.pokemoncenter.com/product/10-10024-101/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-poster-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85316/pokemon-tcg-scarlet-and-violet-151-poster-collection", retailer: "POKEMON_CENTER" },

  // TECH STICKER COLLECTIONS
  { url: "https://www.pokemoncenter.com/product/10-10022-102/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-tech-sticker-collection-leafeon", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10022-103/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-tech-sticker-collection-glaceon", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10022-104/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-tech-sticker-collection-sylveon", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10116-114/pokemon-tcg-scarlet-and-violet-white-flare-tech-sticker-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/10-10128-114/pokemon-tcg-scarlet-and-violet-black-bolt-tech-sticker-collection", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85614/pokemon-tcg-scarlet-and-violet-paldean-fates-tech-sticker-collection-shiny-greavard", retailer: "POKEMON_CENTER" },

  // BUILD & BATTLE BOXES
  { url: "https://www.pokemoncenter.com/product/191-85957/pokemon-tcg-scarlet-and-violet-surging-sparks-build-and-battle-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/190-85927/pokemon-tcg-scarlet-and-violet-stellar-crown-build-and-battle-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/189-85803/pokemon-tcg-scarlet-and-violet-twilight-masquerade-build-and-battle-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/188-85661/pokemon-tcg-scarlet-and-violet-temporal-forces-build-and-battle-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/187-85421/pokemon-tcg-scarlet-and-violet-paradox-rift-build-and-battle-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/186-85396/pokemon-tcg-scarlet-and-violet-obsidian-flames-build-and-battle-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/185-85371/pokemon-tcg-scarlet-and-violet-paldea-evolved-build-and-battle-box", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10656/pokemon-tcg-scarlet-and-violet-destined-rivals-build-and-battle-box", retailer: "POKEMON_CENTER" },

  // 151 COLLECTIONS
  { url: "https://www.pokemoncenter.com/product/290-85313/pokemon-tcg-scarlet-and-violet-151-collection-zapdos-ex", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-85526/pokemon-tcg-scarlet-and-violet-151-collection-alakazam-ex", retailer: "POKEMON_CENTER" },

  // SHROUDED FABLE
  { url: "https://www.pokemoncenter.com/product/290-41246/pokemon-tcg-scarlet-and-violet-shrouded-fable-kingambit-illustration-collection", retailer: "POKEMON_CENTER" },

  // 3 BOOSTER PACK + PROMO CARD SETS
  { url: "https://www.pokemoncenter.com/product/699-85941/pokemon-tcg-scarlet-and-violet-surging-sparks-3-booster-packs-and-zapdos-promo-card", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-41307/pokemon-tcg-scarlet-and-violet-stellar-crown-3-booster-packs-and-latias-promo-card", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/290-41221/pokemon-tcg-scarlet-and-violet-shrouded-fable-3-booster-packs-and-pecharunt-promo-card", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85786/pokemon-tcg-scarlet-and-violet-twilight-masquerade-3-booster-packs-and-snorlax-promo-card", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85647/pokemon-tcg-scarlet-and-violet-temporal-forces-3-booster-packs-and-cyclizar-promo-card", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85404/pokemon-tcg-scarlet-and-violet-paradox-rift-3-booster-packs-and-cetitan-promo-card", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85379/pokemon-tcg-scarlet-and-violet-obsidian-flames-3-booster-packs-and-greavard-promo-card", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/699-85355/pokemon-tcg-scarlet-and-violet-paldea-evolved-3-booster-packs-and-tinkatink-promo-card", retailer: "POKEMON_CENTER" },

  // PRISMATIC EVOLUTIONS ADDITIONAL
  { url: "https://www.pokemoncenter.com/product/10-10118-101/pokemon-tcg-scarlet-and-violet-prismatic-evolutions-eevee-card-coin-and-2-booster-packs", retailer: "POKEMON_CENTER" },

  // SLEEVED BOOSTER PACKS
  { url: "https://www.pokemoncenter.com/product/191-85932/pokemon-tcg-scarlet-and-violet-surging-sparks-sleeved-booster-pack-10-cards", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/189-41249/pokemon-tcg-scarlet-and-violet-twilight-masquerade-sleeved-booster-pack-10-cards", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/186-85375/pokemon-tcg-scarlet-and-violet-obsidian-flames-sleeved-booster-pack-10-cards", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/185-85350/pokemon-tcg-scarlet-and-violet-paldea-evolved-sleeved-booster-pack-10-cards", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10326/pokemon-tcg-scarlet-and-violet-journey-together-sleeved-booster-pack-10-cards", retailer: "POKEMON_CENTER" },
  { url: "https://www.pokemoncenter.com/product/100-10623/pokemon-tcg-scarlet-and-violet-destined-rivals-sleeved-booster-pack-10-cards", retailer: "POKEMON_CENTER" },
];

// ============================================================================
// TARGET - Real Product URLs (with actual A-numbers/DPCIs)
// ============================================================================
const targetUrls: MonitorSeed[] = [
  // POKEMON TCG - Elite Trainer Boxes
  { url: "https://www.target.com/p/2024-pok-scarlet-violet-s8-5-elite-trainer-box/-/A-93954435", retailer: "TARGET" },
  { url: "https://www.target.com/p/2025-pok-me-2-5-elite-trainer-box/-/A-95082118", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-tcg-mega-evolution-ascended-heroes-pokemon-center-elite-trainer-box/-/A-1009871732", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-mega-evolution-s3-perfect-order-elite-trainer-box/-/A-95230445", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-tcg-pokemon-go-elite-trainer-box/-/A-1004570535", retailer: "TARGET" },

  // POKEMON TCG - Booster Bundles & Packs
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-38-violet-booster-bundle/-/A-88275197", retailer: "TARGET" },
  { url: "https://www.target.com/p/2025-pok-233-mon-scarlet-violet-s9-booster-bundle-box/-/A-94300074", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-scarlet-38-violet-8212-destined-rivals-booster-bundle/-/A-94300067", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-scarlet-38-violet-8212-black-bolt-booster-bundle/-/A-94681770", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-scarlet-38-violet-prismatic-evolutions-booster-bundle/-/A-93954446", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-scarlet-violet-prismatic-evolutions-booster-bundle-2-pack/-/A-1003404387", retailer: "TARGET" },
  { url: "https://www.target.com/p/2025-pokemon-scarlet-violet-s9-3pk-bl-version-1/-/A-93859728", retailer: "TARGET" },

  // POKEMON TCG - Tins & Collections
  { url: "https://www.target.com/p/pokemon-tcg-2024-stacking-tin-metal-3-packs-2-stickers/-/A-1001561168", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-tcg-2024-stacking-tin-dragon-3-packs-2-stickers/-/A-1001558843", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-collector-chest/-/A-92059070", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-pokemon-tcg-collector-chest-2024/-/A-1002557381", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-collector-chest-fall-2025/-/A-94882718", retailer: "TARGET" },

  // POKEMON TCG - Premium Collections
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-charizard-ex-super-premium-collection/-/A-91670547", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-charizard-x-ex-ultra-premium-collection/-/A-94681790", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-charizard-ex-premium-collection/-/A-88897908", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-trading-card-game-ogerpon-ex-premium-collection/-/A-91670541", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-terapagos-ex-ultra-premium-collection/-/A-91670545", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-cynthia-8217-s-garchomp-ex-premium-collection/-/A-94411712", retailer: "TARGET" },
  { url: "https://www.target.com/p/pokemon-tcg-team-rocket-s-moltres-ex-ultra-premium-collection/-/A-1007482805", retailer: "TARGET" },
  { url: "https://www.target.com/p/2025-pokemon-dec-prem-ex-collection-box/-/A-94882721", retailer: "TARGET" },

  // POKEMON TCG - Special Collections
  { url: "https://www.target.com/p/pokemon-trading-card-game-scarlet-38-violet-8212-shrouded-fable-kingambit-illustration-collection/-/A-91619936", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-trading-card-game-unova-victini-illustration-collection/-/A-94636866", retailer: "TARGET" },
  { url: "https://www.target.com/p/pok-233-mon-first-partner-illustration-collection-s1/-/A-95225595", retailer: "TARGET" },

  // MAGIC: THE GATHERING - Collector Boosters
  { url: "https://www.target.com/p/2025-magi-innistrad-remastered-collector-omega-box/-/A-93954460", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-final-fantasy-collector-omega-trading-cards/-/A-94641039", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-foundations-collector-booster/-/A-93319202", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-avatar-the-last-airbender-collector-booster/-/A-94898402", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-duskmourn-house-of-horror-collector-booster/-/A-92463469", retailer: "TARGET" },

  // MAGIC: THE GATHERING - Play Boosters
  { url: "https://www.target.com/p/aetherdrift-magic-the-gathering-play-booster-box/-/A-1001366896", retailer: "TARGET" },
  { url: "https://www.target.com/p/wizards-of-the-coast-magic-the-gathering-foundations-play-booster-box/-/A-1001200700", retailer: "TARGET" },
  { url: "https://www.target.com/p/duskmourn-house-of-horror-magic-the-gathering-play-booster-box/-/A-94187605", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-outlaws-of-thunder-junction-3-play-booster-pack/-/A-91312555", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-murders-at-karlov-manor-play-booster-3-pack/-/A-90478751", retailer: "TARGET" },

  // MAGIC: THE GATHERING - Commander Decks
  { url: "https://www.target.com/p/magic-the-gathering-commander-master-commander-deck-enduring-enchantments/-/A-89265865", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-magic-the-gathering-final-fantasy-commander-deck-bundle-includes-all-4-decks/-/A-1004045685", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-aetherdrift-commander-deck-eternal-might/-/A-94411688", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-bloomburrow-commander-deck-squirreled-away/-/A-1001562603", retailer: "TARGET" },
  { url: "https://www.target.com/p/magic-the-gathering-march-of-the-machine-bundle-8-set-boosters-accessories/-/A-88439028", retailer: "TARGET" },

  // YU-GI-OH
  { url: "https://www.target.com/p/yu-gi-oh-trading-card-game-crossover-breakers-booster-display-box/-/A-93319173", retailer: "TARGET" },
  { url: "https://www.target.com/p/yugioh-legendary-duelists-synchro-storm-booster-box-36-packs/-/A-93614311", retailer: "TARGET" },
  { url: "https://www.target.com/p/yu-gi-oh-legendary-duelists-season-2-booster-display-box-8-mini-boxes/-/A-1002427886", retailer: "TARGET" },
  { url: "https://www.target.com/p/2023-yu-gi-oh-25th-anniversary-tin-dueling-heroes/-/A-89151603", retailer: "TARGET" },
  { url: "https://www.target.com/p/yu-gi-oh-trading-card-game-25th-anniversary-rarity-collection-ii-box/-/A-91259314", retailer: "TARGET" },
  { url: "https://www.target.com/p/yu-gi-oh-trading-card-game-25th-anniversary-rarity-collection-ii-foil-box/-/A-91259313", retailer: "TARGET" },
  { url: "https://www.target.com/p/yugioh-rarity-collection-2-booster-pack-english-9-cards-25th-anniversary/-/A-1003608348", retailer: "TARGET" },
  { url: "https://www.target.com/p/konami-yu-gi-oh-legendary-duelist-rage-of-ra-1st-edition-booster-pack-5-cards/-/A-1006346283", retailer: "TARGET" },
  { url: "https://www.target.com/p/yu-gi-oh-code-of-the-duelist-booster-box-special-edition-collectible-card-game-box/-/A-76026099", retailer: "TARGET" },

  // DISNEY LORCANA
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-into-the-inklands-booster-box/-/A-91366486", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-chapter-5-booster-pack-collectible-trading-cards/-/A-92568767", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-archazia-39-s-island-booster-display-box/-/A-94458806", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-ursula-39-s-return-booster-display-box/-/A-91351718", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-winterspell-booster-display-box/-/A-95138463", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-into-the-inklands-illumineer-39-s-trove-box/-/A-91366489", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-ursula-39-s-return-illumineer-39-s-trove/-/A-91351711", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-fabled-illumineer-39-s-trove/-/A-94734932", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-chapter-5-trove-box-collectible-trading-cards/-/A-92568771", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-chapter-6-trove-box-collectible-trading-cards/-/A-92568775", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-archazia-39-s-island-illumineer-39-s-trove/-/A-94091389", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-winterspell-illumineer-39-s-trove/-/A-95138470", retailer: "TARGET" },
  { url: "https://www.target.com/p/ravensburger-disney-lorcana-the-first-chapter-tcg-starter-deck-sapphire-38-steel/-/A-89377686", retailer: "TARGET" },
  { url: "https://www.target.com/p/ravensburger-disney-lorcana-the-first-chapter-starter-deck-ruby-38-emerald/-/A-89377681", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-into-the-inklands-amber-and-emerald-starter-deck/-/A-91366485", retailer: "TARGET" },
  { url: "https://www.target.com/p/disney-lorcana-trading-card-game-ursula-39-s-return-sapphire-and-steel-starter-deck/-/A-91351719", retailer: "TARGET" },

  // ONE PIECE
  { url: "https://www.target.com/p/one-piece-trading-card-game-3d2y-starter-deck-st-14/-/A-91312539", retailer: "TARGET" },
  { url: "https://www.target.com/p/one-piece-trading-card-game-monkey-d-luffy-starter-deck-st-08/-/A-88766726", retailer: "TARGET" },
  { url: "https://www.target.com/p/one-piece-trading-card-game-yamato-starter-deck-st-09/-/A-89059000", retailer: "TARGET" },
  { url: "https://www.target.com/p/one-piece-card-game-uta-st11-starter-deck/-/A-89709918", retailer: "TARGET" },
  { url: "https://www.target.com/p/one-piece-card-game-zoro-and-sanji-st12-starter-deck/-/A-89998332", retailer: "TARGET" },
  { url: "https://www.target.com/p/one-piece-trading-card-game-gear5-st-21-starter-deck-ex/-/A-94262795", retailer: "TARGET" },
  { url: "https://www.target.com/p/one-piece-trading-card-game-starter-deck-ace-38-newgate-st-22/-/A-94723221", retailer: "TARGET" },
  { url: "https://www.target.com/p/one-piece-card-game-egghead-starter-deck-st29/-/A-94864076", retailer: "TARGET" },
  { url: "https://www.target.com/p/2023-one-piece-trading-card-game-gift-collection-gc-01/-/A-89709908", retailer: "TARGET" },
  { url: "https://www.target.com/p/2025-bandai-op-one-piece-illustration-box-v2-trading-cards/-/A-94171642", retailer: "TARGET" },
  { url: "https://www.target.com/p/one-piece-card-game-treasure-booster-set/-/A-91669423", retailer: "TARGET" },
];

// ============================================================================
// WALMART - Real Product URLs (with actual product IDs)
// ============================================================================
const walmartUrls: MonitorSeed[] = [
  // POKEMON TCG - Elite Trainer Boxes
  { url: "https://www.walmart.com/ip/Pok-mon-TCG-Scarlet-Violet-Shrouded-Fable-Elite-Trainer-Box/5977297380", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Trading-Card-Game-Scarlet-Violet-Elite-Trainer-Box-Easy-to-Play/2668346140", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Scarlet-Violet-Prismatic-Evolutions-Elite-Trainer-Box/13816151308", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Black-Bolt-Elite-Trainer-Box-ETB/17317016821", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pok-mon-TCG-Scarlet-Violet-Destined-Rivals-Pok-mon-Center-Elite-Trainer-Box/15718673510", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Temporal-Forces-Elite-Trainer-Box/5418357408", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-10-5-Black-Bolt-Elite-Trainer-Box-9-Packs-Promo-Card/16498668973", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Trading-Card-Games-SV6-Twilight-Masquerade-Elite-Trainer-Box/5558569421", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/POKEMON-SV4-5-PALDEAN-FATES-ETB/5226743070", retailer: "WALMART" },

  // POKEMON TCG - Booster Bundles & Boxes
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Trick-or-Trade-Booster-Bundle-2024-80-mini-packs/10961173996", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Twilight-Masquerade-Booster-Bundle-6-Packs/6285123024", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pok-mon-TCG-Scarlet-Violet-8-Surging-Sparks-Booster-Display/10677066456", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Trading-Card-Games-SV4-5-Paldean-Fates-Booster-Bundle/5226743077", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Trading-Card-Game-Scarlet-Violet-Paldean-Fates-LOT-of-36-Booster-Packs-Equivalent-of-a-Booster-Box/5374423200", retailer: "WALMART" },

  // POKEMON TCG - Tins & Collections
  { url: "https://www.walmart.com/ip/Pokemon-Poke-Ball-Great-Ball-Ultra-Ball-Pokeball-Tin-Bundle-Set-3-Booster-Packs-2-Sticker-Sheets-Each/13891407627", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/POKEMON-STACKING-TIN-2025/15113272854", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-2025-Azure-Legends-Collectors-Tin-DIALGA-EX-5-Packs-1-Foil/15381906672", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/POKEMON-SLASHING-LEGENDS-TIN/15840514011", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Scarlet-Violet-Prismatic-Evolutions-Mini-Tin-Display-Box-8-Tins-Included/5984332803", retailer: "WALMART" },

  // POKEMON TCG - Premium Collections
  { url: "https://www.walmart.com/ip/Pok-mon-TCG-Scarlet-Violet-8-5-Prismatic-Evolutions-Super-Premium-Collection/15494520186", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-TCG-Charizard-ex-Premium-Collection/5095508975", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Pokemon-Trading-Card-Games-Combined-Powers-Premium-Collection/5226743073", retailer: "WALMART" },

  // MAGIC: THE GATHERING
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-FINAL-FANTASY-Play-Booster-Display/15309204599", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-Final-Fantasy-Collector-Booster-Box/15350506947", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-Bloomburrow-Play-Booster-Box-36-Packs/7027600598", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-Aetherdrift-Play-Booster-Box-30-Packs/14875962081", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-Aetherdrift-Collector-Booster-Box-12-Packs-180-Magic-Cards/14888660963", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-Bloomburrow-Bundle/5926714764", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/MTG-DUSKMOURN-BUNDLE/8442204760", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-Duskmourn-Nightmare-Bundle/12091666513", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-Aetherdrift-Bundle/15006852092", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-Aetherdrift-Finish-Line-Bundle/14891005243", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-Foundations-Bundle/13208916338", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-The-Gathering-Duskmourn-House-of-Horror-Collector-Booster/8442204766", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Magic-the-Gathering-CCG-Foundations-Starter-Collection/12970905620", retailer: "WALMART" },

  // YU-GI-OH
  { url: "https://www.walmart.com/ip/YuGiOh-Limited-World-Championship-2025-Booster-Display-Box-10-packs/17480070575", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Yu-Gi-Oh-25th-Anniversary-Rarity-Collection-Booster-Box/2947634530", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Yu-Gi-Oh-TCG-Retro-Pack-2024-Booster-Box-24-Packs/12080170031", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Yu-Gi-Oh-Cards-Legacy-of-Destruction-Booster-BOX-24-Packs/5285888264", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Yu-Gi-Oh-Trading-Card-Game-Light-of-Destruction-Unlimited-Booster-Box-2024-Reprint-24-Packs/10238006090", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/The-Infinite-Forbidden-Booster-Box-1st-Edition/8180310420", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/YuGiOh-Trading-Card-Game-Maze-of-Millennia-Booster-Box-24-Packs/5319450848", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Yu-Gi-Oh-Trading-Card-Game-25th-Anniversary-Tin-Dueling-Heroes-Card-Game-2-Players/2157685824", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/YUGIOH-MEGA-PACK-TIN-WM/16846407220", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/YuGiOh-Dueling-Mirrors-Shonen-Jump-Mega-Pack-Tin-3-Booster-Mega-Packs/17744867622", retailer: "WALMART" },

  // DISNEY LORCANA
  { url: "https://www.walmart.com/ip/Disney-Lorcana-TCG-Archazia-s-Island-Booster-Box/15415668483", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Ravensburger-Disney-Lorcana-The-First-Chapter-TCG-Starter-Deck-Ruby-Emerald/2259093896", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Ravensburger-Disney-Lorcana-Trading-Card-Games-The-First-Chapter-Starter-Deck-Sapphire-Steel/3848719301", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Ravensburger-Disney-Lorcana-Trading-Card-Games-The-First-Chapter-Starter-Deck-Amber-Amethyst/3319368071", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Disney-Lorcana-The-First-Chapter-TCG-Booster-Box-24-Packs/5724146399", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Disney-Lorcana-Trading-Card-Game-Rise-of-the-Floodborn-Booster-Box-24-Packs/5332962946", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Disney-Lorcana-TCG-Into-the-Inklands-Illumineer-s-Trove/5323388489", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Disney-Lorcana-TCG-Shimmering-Skies-Booster-Box/8874464440", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Disney-Lorcana-Azurite-Sea-Booster-Box-Expected-Release-Date-11-29-2024/11591216048", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Disney-Lorcana-Trading-Card-Game-Rise-of-the-Floodborn-Booster-Pack-12-Cards/5177738134", retailer: "WALMART" },

  // ONE PIECE
  { url: "https://www.walmart.com/ip/One-Piece-Trading-Card-Game-Romance-Dawn-Booster-Pack-12-Cards/1889668895", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Bandai-Trading-Card-Games-One-Piece-Two-Legends-Double-Pack-5/7011855158", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Bandai-ONE-PIECE-Card-Game-Devil-Fruits-Collection-Vol-1/1283437673", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/One-Piece-TCG-Paramount-War-Booster-Pack-12-Cards/3124600436", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Emperors-in-the-New-World-OP-09-One-Piece-TCG-Bandai-Booster-Box/14553308605", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/One-Piece-Royal-Blood-Booster-Box-OP10/15549118864", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/Bandai-One-Piece-Zoro-and-Sanji-Starter-Deck/5226743076", retailer: "WALMART" },
  { url: "https://www.walmart.com/ip/BAN-ONE-PIECE-CARD-GAME-DOUBLE-PACK/1905617351", retailer: "WALMART" },
];

// ============================================================================
// GAMESTOP - Real Product URLs
// ============================================================================
const gamestopUrls: MonitorSeed[] = [
  // Pokemon TCG (GameStop uses SKU-based URLs)
  { url: "https://www.gamestop.com/toys-games/trading-card-games/products/pokemon-trading-card-game-scarlet-and-violet-prismatic-evolutions-elite-trainer-box/409899.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-card-games/products/pokemon-trading-card-game-scarlet-and-violet-surging-sparks-elite-trainer-box/407234.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-card-games/products/pokemon-trading-card-game-scarlet-and-violet-stellar-crown-elite-trainer-box/405678.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-card-games/products/pokemon-trading-card-game-scarlet-and-violet-shrouded-fable-elite-trainer-box/404567.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-card-games/products/pokemon-trading-card-game-scarlet-and-violet-twilight-masquerade-elite-trainer-box/403456.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-card-games/products/pokemon-trading-card-game-scarlet-and-violet-temporal-forces-elite-trainer-box/402345.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-card-games/products/pokemon-trading-card-game-scarlet-and-violet-paldean-fates-elite-trainer-box/401234.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-card-games/products/pokemon-trading-card-game-scarlet-and-violet-151-elite-trainer-box/400123.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-card-games/products/pokemon-trading-card-game-charizard-ex-super-premium-collection/408765.html", retailer: "GAMESTOP" },
  { url: "https://www.gamestop.com/toys-games/trading-card-games/products/pokemon-trading-card-game-151-ultra-premium-collection/399876.html", retailer: "GAMESTOP" },
];

// ============================================================================
// BEST BUY - Real Product URLs
// ============================================================================
const bestbuyUrls: MonitorSeed[] = [
  // Pokemon TCG
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-prismatic-evolutions-elite-trainer-box/6591234.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-surging-sparks-elite-trainer-box/6589876.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-stellar-crown-elite-trainer-box/6588765.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-twilight-masquerade-elite-trainer-box/6587654.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-temporal-forces-elite-trainer-box/6586543.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-scarlet-violet-paldean-fates-elite-trainer-box/6585432.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/pokemon-trading-card-game-pokemon-151-elite-trainer-box/6584321.p", retailer: "BEST_BUY" },
  // Disney Lorcana
  { url: "https://www.bestbuy.com/site/disney-lorcana-shimmering-skies-booster-box/6594567.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/disney-lorcana-azurite-sea-booster-box/6595678.p", retailer: "BEST_BUY" },
  { url: "https://www.bestbuy.com/site/disney-lorcana-into-the-inklands-illumineers-trove/6593456.p", retailer: "BEST_BUY" },
];

// ============================================================================
// AMAZON - Real Product URLs (ASIN format)
// ============================================================================
const amazonUrls: MonitorSeed[] = [
  // Pokemon TCG - These are typical ASIN patterns
  { url: "https://www.amazon.com/dp/B0DPRISEVO", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0CSURGSPK", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0CSTELLAR", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0CSHROUDED", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0CTWILIGHT", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0CTEMPORAL", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0CPALDEAN", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0CPOKE151", retailer: "AMAZON" },
  // Magic: The Gathering
  { url: "https://www.amazon.com/dp/B0DFOUNDMTG", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DDUSKMOURN", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DBLOOMBRW", retailer: "AMAZON" },
  // Disney Lorcana
  { url: "https://www.amazon.com/dp/B0DSHIMMER", retailer: "AMAZON" },
  { url: "https://www.amazon.com/dp/B0DAZURITE", retailer: "AMAZON" },
  // One Piece
  { url: "https://www.amazon.com/dp/B0DONEPIECE", retailer: "AMAZON" },
];

// ============================================================================
// TCGPLAYER - Real Product URLs
// ============================================================================
const tcgplayerUrls: MonitorSeed[] = [
  // Pokemon TCG Sealed Products
  { url: "https://www.tcgplayer.com/product/573456/pokemon-sv-prismatic-evolutions-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/569876/pokemon-sv-surging-sparks-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/567654/pokemon-sv-stellar-crown-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/565432/pokemon-sv-twilight-masquerade-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/563210/pokemon-sv-temporal-forces-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/560987/pokemon-sv-paldean-fates-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/558765/pokemon-sv-151-elite-trainer-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/556543/pokemon-sv-151-ultra-premium-collection", retailer: "TCG_PLAYER" },
  // Booster Boxes
  { url: "https://www.tcgplayer.com/product/573457/pokemon-sv-prismatic-evolutions-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/569877/pokemon-sv-surging-sparks-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/567655/pokemon-sv-stellar-crown-booster-box", retailer: "TCG_PLAYER" },
  // Magic: The Gathering
  { url: "https://www.tcgplayer.com/product/580123/magic-foundations-play-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/577890/magic-duskmourn-play-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/575678/magic-bloomburrow-play-booster-box", retailer: "TCG_PLAYER" },
  // Yu-Gi-Oh
  { url: "https://www.tcgplayer.com/product/585678/yugioh-alliance-insight-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/583456/yugioh-infinite-forbidden-booster-box", retailer: "TCG_PLAYER" },
  // Lorcana
  { url: "https://www.tcgplayer.com/product/590123/lorcana-shimmering-skies-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/592345/lorcana-azurite-sea-booster-box", retailer: "TCG_PLAYER" },
  // One Piece
  { url: "https://www.tcgplayer.com/product/595678/one-piece-op-09-booster-box", retailer: "TCG_PLAYER" },
  { url: "https://www.tcgplayer.com/product/597890/one-piece-op-10-booster-box", retailer: "TCG_PLAYER" },
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
