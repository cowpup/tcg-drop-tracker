import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ShowType, ShowTier, ShowSource } from "@prisma/client/index.js";

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
    // Validate cron request
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const vercelCronHeader = request.headers.get("x-vercel-cron");

    const isVercelCron = vercelCronHeader === cronSecret;
    const isBearerAuth = authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !isBearerAuth) {
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
    const [tradingCardConShows, scdShows] = await Promise.all([
      scrapeTradingCardCon(),
      scrapeSportsCollectorsDigest(),
    ]);

    results.sourcesScraped = 2;
    const allShows = [...tradingCardConShows, ...scdShows];
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
