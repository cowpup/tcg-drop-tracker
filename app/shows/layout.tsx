import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Trade Shows & Events",
  description:
    "Find TCG trade shows, card shows, and conventions near you. Browse Pokemon, MTG, and Yu-Gi-Oh! events with map and list views.",
  pathname: "/shows",
});

export default function ShowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
