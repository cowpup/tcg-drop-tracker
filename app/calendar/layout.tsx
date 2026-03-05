import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Drop Calendar",
  description:
    "View upcoming TCG product drops on our calendar. Subscribe to get Pokemon, MTG, Yu-Gi-Oh!, and Lorcana release dates in your calendar app.",
  pathname: "/calendar",
});

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
