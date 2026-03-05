import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { ShowType, ShowTier } from "@prisma/client/index.js";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

interface ShowSeed {
  name: string;
  organizer?: string;
  showType: ShowType;
  tier: ShowTier;
  startDate: string;
  endDate: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  country?: string;
  lat?: number;
  lng?: number;
  website?: string;
  ticketUrl?: string;
  description?: string;
  featured?: boolean;
}

// ============================================================================
// COLLECT-A-CON - THE NATION'S LARGEST TRADING CARD CONVENTION
// Source: https://collectaconusa.com/
// Only shows from March 5, 2026 onward
// ============================================================================
const collectAConShows: ShowSeed[] = [
  {
    name: "Collect-A-Con Orlando 2026",
    organizer: "Collect-A-Con",
    showType: "COLLECTACON",
    tier: "MAJOR",
    startDate: "2026-05-23",
    endDate: "2026-05-24",
    venueName: "Orange County Convention Center",
    address: "9800 International Dr",
    city: "Orlando",
    state: "FL",
    zip: "32819",
    lat: 28.4264,
    lng: -81.4689,
    website: "https://collectaconusa.com/orlando/",
    description: "Florida's largest trading card and collectibles event",
    featured: true,
  },
  {
    name: "Collect-A-Con Kansas City 2026",
    organizer: "Collect-A-Con",
    showType: "COLLECTACON",
    tier: "MAJOR",
    startDate: "2026-06-20",
    endDate: "2026-06-21",
    venueName: "Kansas City Convention Center",
    address: "301 W 13th St",
    city: "Kansas City",
    state: "MO",
    zip: "64105",
    lat: 39.0997,
    lng: -94.5786,
    website: "https://collectaconusa.com/kc/",
    description: "Annual Kansas City trading card convention",
    featured: true,
  },
  {
    name: "Collect-A-Con Chicago 2026",
    organizer: "Collect-A-Con",
    showType: "COLLECTACON",
    tier: "MAJOR",
    startDate: "2026-10-10",
    endDate: "2026-10-11",
    venueName: "Donald E. Stephens Convention Center",
    address: "5555 N River Rd",
    city: "Rosemont",
    state: "IL",
    zip: "60018",
    lat: 41.9853,
    lng: -87.8654,
    website: "https://collectaconusa.com/chicago/",
    description: "Chicago's premier trading card and collectibles show",
    featured: true,
  },
  {
    name: "Collect-A-Con New Jersey 2026",
    organizer: "Collect-A-Con",
    showType: "COLLECTACON",
    tier: "MAJOR",
    startDate: "2026-11-21",
    endDate: "2026-11-22",
    venueName: "Meadowlands Exposition Center",
    address: "355 Plaza Dr",
    city: "Secaucus",
    state: "NJ",
    zip: "07094",
    lat: 40.7879,
    lng: -74.0604,
    website: "https://collectaconusa.com/new-jersey/",
    description: "East Coast trading card and collectibles convention",
    featured: true,
  },
  {
    name: "Collect-A-Con Los Angeles 2026",
    organizer: "Collect-A-Con",
    showType: "COLLECTACON",
    tier: "MAJOR",
    startDate: "2026-12-19",
    endDate: "2026-12-20",
    venueName: "Los Angeles Convention Center",
    address: "1201 S Figueroa St",
    city: "Los Angeles",
    state: "CA",
    zip: "90015",
    lat: 34.0407,
    lng: -118.2689,
    website: "https://collectaconusa.com/losangeles/",
    description: "West Coast's largest trading card convention",
    featured: true,
  },
  // 2027 Shows
  {
    name: "Collect-A-Con Dallas 2027",
    organizer: "Collect-A-Con",
    showType: "COLLECTACON",
    tier: "MAJOR",
    startDate: "2027-06-12",
    endDate: "2027-06-13",
    venueName: "Kay Bailey Hutchison Convention Center",
    address: "650 S Griffin St",
    city: "Dallas",
    state: "TX",
    zip: "75202",
    lat: 32.7757,
    lng: -96.8011,
    website: "https://collectaconusa.com/dallas/",
    description: "The Nation's Largest Trading Card, Anime and Pop Culture Convention",
  },
];

// ============================================================================
// THE NATIONAL - LARGEST SPORTS CARD SHOW
// Source: https://www.nsccshow.com/
// ============================================================================
const nationalShows: ShowSeed[] = [
  {
    name: "The National Sports Collectors Convention 2026",
    organizer: "NSCC",
    showType: "CARD_SHOW",
    tier: "NATIONAL",
    startDate: "2026-07-29",
    endDate: "2026-08-02",
    venueName: "Donald E. Stephens Convention Center",
    address: "5555 N River Rd",
    city: "Rosemont",
    state: "IL",
    zip: "60018",
    lat: 41.9853,
    lng: -87.8654,
    website: "https://www.nsccshow.com/",
    ticketUrl: "https://www.nsccshow.com/tickets",
    description: "The 46th National Sports Collectors Convention - the largest trading card and memorabilia show in the world",
    featured: true,
  },
  {
    name: "The National Sports Collectors Convention 2027",
    organizer: "NSCC",
    showType: "CARD_SHOW",
    tier: "NATIONAL",
    startDate: "2027-07-28",
    endDate: "2027-08-01",
    venueName: "Donald E. Stephens Convention Center",
    address: "5555 N River Rd",
    city: "Rosemont",
    state: "IL",
    zip: "60018",
    lat: 41.9853,
    lng: -87.8654,
    website: "https://www.nsccshow.com/",
    description: "The 47th National Sports Collectors Convention - three consecutive years in Rosemont",
    featured: true,
  },
];

// ============================================================================
// POKEMON TCG REGIONAL CHAMPIONSHIPS
// Source: https://championships.pokemon.com/
// ============================================================================
const pokemonRegionals: ShowSeed[] = [
  {
    name: "Pokemon North America International Championships 2026",
    organizer: "The Pokemon Company",
    showType: "NATIONALS",
    tier: "NATIONAL",
    startDate: "2026-06-12",
    endDate: "2026-06-14",
    venueName: "New Orleans Ernest N. Morial Convention Center",
    address: "900 Convention Center Blvd",
    city: "New Orleans",
    state: "LA",
    zip: "70130",
    lat: 29.9428,
    lng: -90.0649,
    website: "https://championships.pokemon.com/",
    description: "Pokemon TCG, VGC, and Pokemon GO North American International Championship",
    featured: true,
  },
  {
    name: "Pittsburgh Pokemon Regional Championships 2026",
    organizer: "The Pokemon Company",
    showType: "REGIONAL_CHAMPIONSHIP",
    tier: "REGIONAL",
    startDate: "2026-09-18",
    endDate: "2026-09-21",
    venueName: "David L. Lawrence Convention Center",
    address: "1000 Fort Duquesne Blvd",
    city: "Pittsburgh",
    state: "PA",
    zip: "15222",
    lat: 40.4460,
    lng: -80.0096,
    website: "https://championships.pokemon.com/",
    description: "Pokemon TCG and VGC Regional Championship tournament",
    featured: true,
  },
  {
    name: "Milwaukee Pokemon Regional Championships 2026",
    organizer: "The Pokemon Company",
    showType: "REGIONAL_CHAMPIONSHIP",
    tier: "REGIONAL",
    startDate: "2026-10-09",
    endDate: "2026-10-12",
    venueName: "Wisconsin Center",
    address: "400 W Wisconsin Ave",
    city: "Milwaukee",
    state: "WI",
    zip: "53203",
    lat: 43.0389,
    lng: -87.9167,
    website: "https://championships.pokemon.com/",
    description: "Pokemon TCG and VGC Regional Championship tournament",
  },
  {
    name: "Pokemon World Championships 2026",
    organizer: "The Pokemon Company",
    showType: "NATIONALS",
    tier: "NATIONAL",
    startDate: "2026-08-14",
    endDate: "2026-08-16",
    venueName: "Anaheim Convention Center",
    address: "800 W Katella Ave",
    city: "Anaheim",
    state: "CA",
    zip: "92802",
    lat: 33.8003,
    lng: -117.9200,
    website: "https://championships.pokemon.com/",
    description: "The Pokemon World Championships - the pinnacle of competitive Pokemon",
    featured: true,
  },
];

// ============================================================================
// MAJOR GAMING CONVENTIONS - 2026 and beyond
// ============================================================================
const gamingConventions: ShowSeed[] = [
  {
    name: "San Diego Comic-Con 2026",
    organizer: "Comic-Con International",
    showType: "COMIC_CON",
    tier: "NATIONAL",
    startDate: "2026-07-23",
    endDate: "2026-07-26",
    venueName: "San Diego Convention Center",
    address: "111 W Harbor Dr",
    city: "San Diego",
    state: "CA",
    zip: "92101",
    lat: 32.7066,
    lng: -117.1627,
    website: "https://www.comic-con.org/",
    description: "The world's largest comic and pop culture convention, featuring exclusive Pokemon and TCG releases",
    featured: true,
  },
  {
    name: "Gen Con 2026",
    organizer: "Gen Con LLC",
    showType: "OTHER",
    tier: "NATIONAL",
    startDate: "2026-07-30",
    endDate: "2026-08-02",
    venueName: "Indiana Convention Center",
    address: "100 S Capitol Ave",
    city: "Indianapolis",
    state: "IN",
    zip: "46225",
    lat: 39.7640,
    lng: -86.1638,
    website: "https://www.gencon.com/",
    description: "The largest tabletop gaming convention in North America featuring Magic: The Gathering, Pokemon TCG, and more",
    featured: true,
  },
  {
    name: "PAX West 2026",
    organizer: "ReedPop",
    showType: "OTHER",
    tier: "MAJOR",
    startDate: "2026-08-28",
    endDate: "2026-08-31",
    venueName: "Seattle Convention Center",
    address: "705 Pike St",
    city: "Seattle",
    state: "WA",
    zip: "98101",
    lat: 47.6112,
    lng: -122.3329,
    website: "https://west.paxsite.com/",
    description: "Major gaming convention featuring Pokemon Company booths and exclusive cards",
  },
  {
    name: "New York Comic Con 2026",
    organizer: "ReedPop",
    showType: "COMIC_CON",
    tier: "NATIONAL",
    startDate: "2026-10-08",
    endDate: "2026-10-11",
    venueName: "Jacob K. Javits Convention Center",
    address: "429 11th Ave",
    city: "New York",
    state: "NY",
    zip: "10001",
    lat: 40.7573,
    lng: -74.0026,
    website: "https://www.newyorkcomiccon.com/",
    description: "East Coast's largest pop culture convention with Pokemon and TCG presence",
    featured: true,
  },
  {
    name: "PAX Unplugged 2026",
    organizer: "ReedPop",
    showType: "OTHER",
    tier: "MAJOR",
    startDate: "2026-12-04",
    endDate: "2026-12-06",
    venueName: "Pennsylvania Convention Center",
    address: "1101 Arch St",
    city: "Philadelphia",
    state: "PA",
    zip: "19107",
    lat: 39.9543,
    lng: -75.1598,
    website: "https://unplugged.paxsite.com/",
    description: "Tabletop gaming convention with TCG tournaments and exclusive releases",
  },
];

// ============================================================================
// REGIONAL CARD SHOWS - 2026 and beyond (VERIFIED)
// Sources: dallascardshow.com, htowncardshow.com, denvercardshows.com, miamitcgconvention.com
// ============================================================================
const regionalCardShows: ShowSeed[] = [
  // DALLAS CARD SHOW - Verified from dallascardshow.com
  {
    name: "Dallas Card Show March 2026",
    organizer: "Dallas Card Show",
    showType: "CARD_SHOW",
    tier: "MAJOR",
    startDate: "2026-03-12",
    endDate: "2026-03-15",
    venueName: "Marriott Dallas Allen Hotel & Convention Center",
    address: "800 Central Expy S",
    city: "Allen",
    state: "TX",
    zip: "75013",
    lat: 33.1032,
    lng: -96.6706,
    website: "https://www.dallascardshow.com/",
    ticketUrl: "https://www.dallascardshow.com/vipandadmissions",
    description: "The largest sports card show in the U.S. with 700+ vendor tables, auction houses, card grading, and Trade Night",
    featured: true,
  },
  // H-TOWN CARD SHOW - Verified from htowncardshow.com
  {
    name: "H-Town Cards and Collectibles Show March 2026",
    organizer: "H-Town Card Show",
    showType: "CARD_SHOW",
    tier: "REGIONAL",
    startDate: "2026-03-07",
    endDate: "2026-03-08",
    venueName: "Humble Civic Center",
    address: "8233 Will Clayton Pkwy",
    city: "Humble",
    state: "TX",
    zip: "77338",
    lat: 29.9988,
    lng: -95.2622,
    website: "https://htowncardshow.com/",
    description: "Houston's premier trading card show featuring sports cards, Pokemon, TCG, and memorabilia",
  },
  // DENVER CARD SHOWS - Verified from denvercardshows.com
  {
    name: "Denver Card Shows April 2026",
    organizer: "Denver Card Shows",
    showType: "CARD_SHOW",
    tier: "REGIONAL",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
    venueName: "National Western Livestock Center",
    address: "4655 Humboldt St",
    city: "Denver",
    state: "CO",
    zip: "80216",
    lat: 39.7833,
    lng: -104.9711,
    website: "https://denvercardshows.com/",
    ticketUrl: "https://denvercardshows.com/tickets",
    description: "Colorado's largest trading card show with vintage & modern sports cards, comics, toys, video games, and more",
  },
  {
    name: "Denver Card Shows June 2026",
    organizer: "Denver Card Shows",
    showType: "CARD_SHOW",
    tier: "REGIONAL",
    startDate: "2026-06-26",
    endDate: "2026-06-28",
    venueName: "National Western Livestock Center",
    address: "4655 Humboldt St",
    city: "Denver",
    state: "CO",
    zip: "80216",
    lat: 39.7833,
    lng: -104.9711,
    website: "https://denvercardshows.com/",
    description: "Colorado's largest trading card show",
  },
  {
    name: "Denver Card Shows August 2026",
    organizer: "Denver Card Shows",
    showType: "CARD_SHOW",
    tier: "REGIONAL",
    startDate: "2026-08-28",
    endDate: "2026-08-30",
    venueName: "National Western Livestock Center",
    address: "4655 Humboldt St",
    city: "Denver",
    state: "CO",
    zip: "80216",
    lat: 39.7833,
    lng: -104.9711,
    website: "https://denvercardshows.com/",
    description: "Colorado's largest trading card show",
  },
  {
    name: "Denver Card Shows October 2026",
    organizer: "Denver Card Shows",
    showType: "CARD_SHOW",
    tier: "REGIONAL",
    startDate: "2026-10-23",
    endDate: "2026-10-25",
    venueName: "National Western Livestock Center",
    address: "4655 Humboldt St",
    city: "Denver",
    state: "CO",
    zip: "80216",
    lat: 39.7833,
    lng: -104.9711,
    website: "https://denvercardshows.com/",
    description: "Colorado's largest trading card show",
  },
  {
    name: "Denver Card Shows December 2026",
    organizer: "Denver Card Shows",
    showType: "CARD_SHOW",
    tier: "REGIONAL",
    startDate: "2026-12-11",
    endDate: "2026-12-13",
    venueName: "National Western Livestock Center",
    address: "4655 Humboldt St",
    city: "Denver",
    state: "CO",
    zip: "80216",
    lat: 39.7833,
    lng: -104.9711,
    website: "https://denvercardshows.com/",
    description: "Colorado's largest trading card show",
  },
  // MIAMI TCG CONVENTION - Verified from miamitcgconvention.com
  {
    name: "Miami TCG Convention March 2026",
    organizer: "Miami TCG Convention",
    showType: "CARD_SHOW",
    tier: "REGIONAL",
    startDate: "2026-03-07",
    endDate: "2026-03-08",
    venueName: "GStar Studios",
    address: "2060 S Congress Ave",
    city: "Palm Springs",
    state: "FL",
    zip: "33406",
    lat: 26.6359,
    lng: -80.0858,
    website: "https://miamitcgconvention.com/",
    description: "South Florida's premier TCG convention featuring Pokemon, One Piece, Lorcana, vendors, and tournaments",
  },
  // COLLECT-A-CON ATLANTA - Verified from collectaconusa.com
  {
    name: "Collect-A-Con Atlanta September 2026",
    organizer: "Collect-A-Con",
    showType: "COLLECTACON",
    tier: "MAJOR",
    startDate: "2026-09-26",
    endDate: "2026-09-27",
    venueName: "Georgia World Congress Center",
    address: "285 Andrew Young International Blvd NW",
    city: "Atlanta",
    state: "GA",
    zip: "30313",
    lat: 33.7606,
    lng: -84.3963,
    website: "https://collectaconusa.com/atlanta/",
    description: "Collect-A-Con Atlanta with 500+ dealers, celebrities, LIVE concerts, box breaks, and more",
    featured: true,
  },
  // FRONT ROW CARD SHOW ATLANTA - Verified from frontrowcardshow.com
  {
    name: "Front Row Card Show Atlanta March 2026",
    organizer: "Front Row Card Show",
    showType: "CARD_SHOW",
    tier: "REGIONAL",
    startDate: "2026-03-28",
    endDate: "2026-03-29",
    venueName: "Georgia International Convention Center",
    address: "2000 Convention Center Concourse",
    city: "College Park",
    state: "GA",
    zip: "30337",
    lat: 33.6407,
    lng: -84.4488,
    website: "https://frontrowcardshow.com/collections/atlanta",
    description: "Sports cards, TCG, comics, toys, video games, memorabilia, and collectibles",
  },
];

// Combine all shows
const allShows: ShowSeed[] = [
  ...collectAConShows,
  ...nationalShows,
  ...pokemonRegionals,
  ...gamingConventions,
  ...regionalCardShows,
];

// POST /api/shows/seed - Bulk seed trade shows (admin only)
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const show of allShows) {
      try {
        // Check if show already exists (by name and start date)
        const existing = await prisma.tradeShow.findFirst({
          where: {
            name: show.name,
            startDate: new Date(show.startDate),
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.tradeShow.create({
          data: {
            name: show.name,
            organizer: show.organizer,
            showType: show.showType,
            tier: show.tier,
            startDate: new Date(show.startDate),
            endDate: new Date(show.endDate),
            venueName: show.venueName,
            address: show.address,
            city: show.city,
            state: show.state,
            zip: show.zip,
            country: show.country || "US",
            lat: show.lat,
            lng: show.lng,
            website: show.website,
            ticketUrl: show.ticketUrl,
            description: show.description,
            featured: show.featured ?? false,
          },
        });
        created++;
      } catch (error) {
        errors.push(`${show.name}: ${error}`);
      }
    }

    // Get stats by type
    const stats = await prisma.tradeShow.groupBy({
      by: ["showType"],
      _count: { id: true },
    });

    const total = await prisma.tradeShow.count();

    return NextResponse.json({
      success: true,
      created,
      skipped,
      errors: errors.length,
      errorDetails: errors.slice(0, 10),
      total,
      byShowType: stats.reduce((acc, s) => {
        acc[s.showType] = s._count.id;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error("Seed shows error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/shows/seed - Get seed stats
export async function GET() {
  try {
    const stats = await prisma.tradeShow.groupBy({
      by: ["showType"],
      _count: { id: true },
    });

    const total = await prisma.tradeShow.count();

    return NextResponse.json({
      seedAvailable: allShows.length,
      currentTotal: total,
      byShowType: stats.reduce((acc, s) => {
        acc[s.showType] = s._count.id;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
