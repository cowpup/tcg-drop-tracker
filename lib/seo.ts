import type { Metadata } from "next";

const SITE_NAME = "TCG Drop Tracker";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tcgdroptracker.com";
const DEFAULT_DESCRIPTION =
  "Track upcoming TCG product drops, restocks, and trade shows for Pokemon, Magic: The Gathering, Yu-Gi-Oh!, Lorcana, One Piece, and more.";

interface SEOParams {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  pathname?: string;
}

/**
 * Generate page metadata with consistent SEO defaults
 */
export function generateMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  noIndex = false,
  pathname = "",
}: SEOParams = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = `${SITE_URL}${pathname}`;
  const ogImage = image || `${SITE_URL}/og-default.png`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * Generate JSON-LD structured data for a product drop
 */
export function generateDropJsonLd(drop: {
  name: string;
  description?: string;
  price?: number;
  url?: string;
  image?: string;
  scheduledAt?: Date;
  retailer: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: drop.name,
    description: drop.description || `${drop.name} available at ${drop.retailer}`,
    image: drop.image,
    offers: {
      "@type": "Offer",
      price: drop.price,
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
      url: drop.url,
      seller: {
        "@type": "Organization",
        name: drop.retailer,
      },
      ...(drop.scheduledAt && {
        availabilityStarts: drop.scheduledAt.toISOString(),
      }),
    },
  };
}

/**
 * Generate JSON-LD structured data for a trade show event
 */
export function generateEventJsonLd(show: {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  venueName: string;
  address: string;
  city: string;
  state: string;
  website?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: show.name,
    description: show.description || `${show.name} trading card game event`,
    startDate: show.startDate.toISOString(),
    endDate: show.endDate.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: show.venueName,
      address: {
        "@type": "PostalAddress",
        streetAddress: show.address,
        addressLocality: show.city,
        addressRegion: show.state,
        addressCountry: "US",
      },
    },
    ...(show.website && { url: show.website }),
  };
}
