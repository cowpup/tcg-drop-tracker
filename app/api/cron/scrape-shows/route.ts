import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { ShowType, ShowTier, ShowSource } from "@prisma/client/index.js";

const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];

interface ScrapedShow {
  name: string;
  organizer?: string;
  showType: ShowType;
  tier: ShowTier;
  startDate: Date;
  endDate: Date;
  venueName: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  country: string;
  website?: string;
  description?: string;
  source: ShowSource;
  sourceId: string;
}

// State name to abbreviation mapping
const STATE_ABBREVS: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
  montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", ohio: "OH",
  oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
  "district of columbia": "DC",
};

function normalizeState(state: string): string {
  const cleaned = state.trim().toLowerCase();
  // Already an abbreviation
  if (cleaned.length === 2) {
    return cleaned.toUpperCase();
  }
  return STATE_ABBREVS[cleaned] || state.toUpperCase();
}

// Infer show type from name/description
function inferShowType(name: string, description?: string): ShowType {
  const text = `${name} ${description || ""}`.toLowerCase();

  if (text.includes("collect-a-con") || text.includes("collectacon")) return "COLLECTACON";
  if (text.includes("comic-con") || text.includes("comic con") || text.includes("comiccon")) return "COMIC_CON";
  if (text.includes("regional championship") || text.includes("regionals")) return "REGIONAL_CHAMPIONSHIP";
  if (text.includes("national") || text.includes("worlds") || text.includes("championship")) return "NATIONALS";
  if (text.includes("game store") || text.includes("local league")) return "GAME_STORE_EVENT";

  return "CARD_SHOW";
}

// Infer tier from name/venue/tables
function inferTier(name: string, description?: string, tables?: number): ShowTier {
  const text = `${name} ${description || ""}`.toLowerCase();

  if (text.includes("national") || text.includes("nscc") || text.includes("world")) return "NATIONAL";
  if (text.includes("collect-a-con") || text.includes("collectacon")) return "MAJOR";
  if (tables && tables >= 300) return "MAJOR";
  if (tables && tables >= 100) return "REGIONAL";
  if (text.includes("regional") || text.includes("expo") || text.includes("convention")) return "REGIONAL";

  return "LOCAL";
}

// Parse date strings like "March 7-8" or "March 7" with year context
function parseDateRange(dateStr: string, year: number): { start: Date; end: Date } | null {
  try {
    // Handle formats like "March 7-8", "Mar 7-8, 2026", "March 7", etc.
    const months: Record<string, number> = {
      jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
      apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
      aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
      nov: 10, november: 10, dec: 11, december: 11,
    };

    const cleaned = dateStr.toLowerCase().trim();

    // Extract year if present
    const yearMatch = cleaned.match(/\b(202\d)\b/);
    const actualYear = yearMatch ? parseInt(yearMatch[1]) : year;

    // Match "Month Day-Day" or "Month Day"
    const rangeMatch = cleaned.match(/([a-z]+)\s+(\d{1,2})(?:\s*-\s*(\d{1,2}))?/);
    if (rangeMatch) {
      const month = months[rangeMatch[1]];
      if (month === undefined) return null;

      const startDay = parseInt(rangeMatch[2]);
      const endDay = rangeMatch[3] ? parseInt(rangeMatch[3]) : startDay;

      return {
        start: new Date(actualYear, month, startDay),
        end: new Date(actualYear, month, endDay),
      };
    }

    return null;
  } catch {
    return null;
  }
}

// Collect-A-Con 2026 schedule (from startickets.com, animecons.com)
// Their site is JS-rendered so we maintain this list manually
const COLLECTACON_2026: Array<{
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  venue: string;
  address: string;
  zip: string;
}> = [
  { city: "Houston", state: "TX", startDate: "2026-03-14", endDate: "2026-03-15", venue: "George R. Brown Convention Center", address: "1001 Avenida De Las Americas", zip: "77010" },
  { city: "Fort Worth", state: "TX", startDate: "2026-04-04", endDate: "2026-04-05", venue: "Fort Worth Convention Center", address: "1201 Houston St", zip: "76102" },
  { city: "Rosemont", state: "IL", startDate: "2026-04-25", endDate: "2026-04-26", venue: "Donald E. Stephens Convention Center", address: "5555 N River Rd", zip: "60018" },
  { city: "Cleveland", state: "OH", startDate: "2026-05-09", endDate: "2026-05-10", venue: "Huntington Convention Center", address: "300 Lakeside Ave E", zip: "44114" },
  { city: "Scottsdale", state: "AZ", startDate: "2026-05-16", endDate: "2026-05-17", venue: "Westworld of Scottsdale", address: "16601 N Pima Rd", zip: "85260" },
  { city: "Orlando", state: "FL", startDate: "2026-05-23", endDate: "2026-05-24", venue: "Orange County Convention Center", address: "9800 International Dr", zip: "32819" },
  { city: "Kansas City", state: "MO", startDate: "2026-06-13", endDate: "2026-06-14", venue: "Kansas City Convention Center", address: "301 W 13th St", zip: "64105" },
  { city: "Las Vegas", state: "NV", startDate: "2026-06-20", endDate: "2026-06-21", venue: "Las Vegas Convention Center", address: "3150 Paradise Rd", zip: "89109" },
  { city: "Edison", state: "NJ", startDate: "2026-07-11", endDate: "2026-07-12", venue: "New Jersey Convention & Exposition Center", address: "97 Sunfield Ave", zip: "08837" },
  { city: "Minneapolis", state: "MN", startDate: "2026-07-18", endDate: "2026-07-19", venue: "Minneapolis Convention Center", address: "1301 2nd Ave S", zip: "55403" },
];

// Scrape Collect-A-Con events
async function scrapeCollectACon(): Promise<ScrapedShow[]> {
  const shows: ScrapedShow[] = [];

  for (const event of COLLECTACON_2026) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    // Skip past events
    if (endDate < new Date()) continue;

    shows.push({
      name: `Collect-A-Con ${event.city} 2026`,
      organizer: "Collect-A-Con",
      showType: "COLLECTACON",
      tier: "MAJOR",
      startDate,
      endDate,
      venueName: event.venue,
      address: event.address,
      city: event.city,
      state: event.state,
      zip: event.zip,
      country: "US",
      website: "https://collectaconusa.com/",
      description: "The Nation's Largest Trading Card, Anime & Pop Culture Convention featuring 500+ dealers, celebrities, live concerts, box breaks, and more",
      source: "COLLECT_A_CON",
      sourceId: `cac-${event.city.toLowerCase().replace(/\s+/g, "-")}-2026`,
    });
  }

  return shows;
}

// Scrape Trading Card Con events
async function scrapeTradingCardCon(): Promise<ScrapedShow[]> {
  const shows: ScrapedShow[] = [];

  try {
    const response = await fetch("https://tradingcardcon.com/", {
      headers: {
        "User-Agent": "TCGDropTracker/1.0 (https://tcg-drop-tracker.vercel.app)",
      },
    });

    if (!response.ok) {
      console.error("TradingCardCon fetch failed:", response.status);
      return shows;
    }

    const html = await response.text();

    // Known 2026 events from their site
    const knownEvents = [
      { city: "Denver", state: "CO", dates: "Apr 10-12, 2026", venue: "TBA" },
      { city: "Chicago", state: "IL", dates: "May 1-3, 2026", venue: "Hilton Chicago" },
      { city: "Atlanta", state: "GA", dates: "May 8-10, 2026", venue: "TBA" },
      { city: "New Orleans", state: "LA", dates: "May 15-17, 2026", venue: "TBA" },
      { city: "Irvine", state: "CA", dates: "Jun 5-7, 2026", venue: "TBA" },
      { city: "Austin", state: "TX", dates: "Jul 10-12, 2026", venue: "TBA" },
      { city: "Philadelphia", state: "PA", dates: "Jul 24-26, 2026", venue: "TBA" },
    ];

    for (const event of knownEvents) {
      const dateRange = parseDateRange(event.dates, 2026);
      if (!dateRange) continue;

      shows.push({
        name: `Trading Card Con ${event.city} 2026`,
        organizer: "Trading Card Con",
        showType: "CARD_SHOW",
        tier: "MAJOR",
        startDate: dateRange.start,
        endDate: dateRange.end,
        venueName: event.venue,
        address: "TBA",
        city: event.city,
        state: event.state,
        country: "US",
        website: "https://tradingcardcon.com/",
        description: "Trading Card Con - The ultimate destination for trading card enthusiasts with 200+ vendors",
        source: "TRADING_CARD_CON",
        sourceId: `tcc-${event.city.toLowerCase()}-2026`,
      });
    }
  } catch (error) {
    console.error("Error scraping TradingCardCon:", error);
  }

  return shows;
}

// Scrape Sports Collectors Digest calendar
async function scrapeSportsCollectorsDigest(): Promise<ScrapedShow[]> {
  const shows: ScrapedShow[] = [];

  try {
    const response = await fetch("https://sportscollectorsdigest.com/collecting-101/show-calendar", {
      headers: {
        "User-Agent": "TCGDropTracker/1.0 (https://tcg-drop-tracker.vercel.app)",
      },
    });

    if (!response.ok) {
      console.error("SportsCollectorsDigest fetch failed:", response.status);
      return shows;
    }

    const html = await response.text();

    // Parse the calendar - it's organized by state with show entries
    // Format: <state section> -> date, city, venue, details

    // Extract shows using regex patterns
    // The page has entries like: "March 7: City - Show Name at Venue"

    const currentYear = new Date().getFullYear();

    // Simple pattern matching for common formats
    // "March 7-8: Santa Clara - East Bay Card Show at Convention Center"
    const showPattern = /([A-Z][a-z]+ \d{1,2}(?:-\d{1,2})?)[:\s]+([^-]+)\s*[-–]\s*([^@]+?)(?:\s+at\s+(.+?))?(?=\n|$)/gi;

    let match;
    let stateContext = "";

    // Look for state headers
    const statePattern = /^##?\s*([A-Za-z\s]+)$/gm;
    const stateMatches = html.matchAll(statePattern);

    for (const stateMatch of stateMatches) {
      const stateName = stateMatch[1].trim();
      const stateAbbrev = normalizeState(stateName);
      if (stateAbbrev.length !== 2) continue;

      // Find shows in this section
      const sectionStart = stateMatch.index!;
      const nextStateMatch = html.indexOf("\n## ", sectionStart + 1);
      const sectionEnd = nextStateMatch > 0 ? nextStateMatch : html.length;
      const section = html.slice(sectionStart, sectionEnd);

      // Parse entries in this state section
      const entryPattern = /\*\*([A-Za-z]+ \d{1,2}(?:-\d{1,2})?(?:,\s*\d{4})?)\*\*[:\s]*([^–\-\n]+?)(?:\s*[-–]\s*[""]?([^""]+?)[""]?)?\s+at\s+([^\n]+)/gi;

      while ((match = entryPattern.exec(section)) !== null) {
        try {
          const dateStr = match[1];
          const city = match[2]?.trim() || "Unknown";
          const showName = match[3]?.trim() || `${city} Card Show`;
          const venue = match[4]?.trim() || "TBA";

          const dateRange = parseDateRange(dateStr, currentYear);
          if (!dateRange) continue;

          // Skip past dates
          if (dateRange.end < new Date()) continue;

          const sourceId = `scd-${stateAbbrev}-${city.toLowerCase().replace(/\s+/g, "-")}-${dateRange.start.toISOString().split("T")[0]}`;

          shows.push({
            name: showName.includes("Card") || showName.includes("Show")
              ? showName
              : `${showName} Card Show`,
            organizer: showName,
            showType: inferShowType(showName),
            tier: inferTier(showName, venue),
            startDate: dateRange.start,
            endDate: dateRange.end,
            venueName: venue,
            address: "See website for address",
            city,
            state: stateAbbrev,
            country: "US",
            website: "https://sportscollectorsdigest.com/collecting-101/show-calendar",
            description: `Sports card show in ${city}, ${stateAbbrev}`,
            source: "SPORTS_COLLECTORS_DIGEST",
            sourceId,
          });
        } catch (e) {
          console.error("Error parsing show entry:", e);
        }
      }
    }
  } catch (error) {
    console.error("Error scraping SportsCollectorsDigest:", error);
  }

  return shows;
}

// POST /api/cron/scrape-shows - Scrape trade shows from external sources
export async function POST(request: NextRequest) {
  try {
    // Validate cron request OR admin user
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const vercelCronHeader = request.headers.get("x-vercel-cron");

    const isVercelCron = vercelCronHeader === cronSecret;
    const isBearerAuth = authHeader === `Bearer ${cronSecret}`;

    // Also allow admin users to trigger manually
    const { userId } = await auth();
    const isAdmin = userId && ADMIN_USER_IDS.includes(userId);

    if (!isVercelCron && !isBearerAuth && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const results = {
      sourcesScraped: 0,
      showsFound: 0,
      showsCreated: 0,
      showsSkipped: 0,
      errors: [] as string[],
    };

    // Scrape all sources in parallel
    const [collectAConShows, tradingCardConShows, scdShows] = await Promise.all([
      scrapeCollectACon(),
      scrapeTradingCardCon(),
      scrapeSportsCollectorsDigest(),
    ]);

    results.sourcesScraped = 3;
    const allShows = [...collectAConShows, ...tradingCardConShows, ...scdShows];
    results.showsFound = allShows.length;

    // Process each show
    for (const show of allShows) {
      try {
        // Check if show already exists by source + sourceId
        const existing = await prisma.tradeShow.findFirst({
          where: {
            source: show.source,
            sourceId: show.sourceId,
          },
        });

        if (existing) {
          results.showsSkipped++;
          continue;
        }

        // Also check for similar shows (same name + date + city)
        const similar = await prisma.tradeShow.findFirst({
          where: {
            name: { contains: show.name.split(" ").slice(0, 3).join(" "), mode: "insensitive" },
            city: { equals: show.city, mode: "insensitive" },
            startDate: show.startDate,
          },
        });

        if (similar) {
          results.showsSkipped++;
          continue;
        }

        // Create new show
        await prisma.tradeShow.create({
          data: {
            name: show.name,
            organizer: show.organizer,
            showType: show.showType,
            tier: show.tier,
            startDate: show.startDate,
            endDate: show.endDate,
            venueName: show.venueName,
            address: show.address,
            city: show.city,
            state: show.state,
            country: show.country,
            website: show.website,
            description: show.description,
            source: show.source,
            sourceId: show.sourceId,
            verified: false, // Needs admin review
            featured: false,
          },
        });
        results.showsCreated++;
      } catch (error) {
        const errorMsg = `Error creating show ${show.name}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    const duration = Date.now() - startTime;

    // Log job result
    await prisma.jobLog.create({
      data: {
        jobType: "scrape-shows",
        status: results.errors.length > 0 ? "partial" : "success",
        duration,
        itemsChecked: results.showsFound,
        itemsFound: results.showsCreated,
        errors: results.errors.slice(0, 10),
        metadata: {
          sourcesScraped: results.sourcesScraped,
          showsSkipped: results.showsSkipped,
          collectAConCount: collectAConShows.length,
          tradingCardConCount: tradingCardConShows.length,
          scdCount: scdShows.length,
        },
      },
    });

    console.log("Show scrape completed", { duration: `${duration}ms`, ...results });

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      ...results,
    });
  } catch (error) {
    console.error("Show scrape failed:", error);
    return NextResponse.json(
      { error: "Scrape failed", details: String(error) },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron and manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
