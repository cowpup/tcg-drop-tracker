import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Retailer Status",
  description:
    "Live monitoring of retailer security status and queue detection for TCG drops. Track Pokemon Center, Target, Walmart, and more.",
  pathname: "/retailers",
});

export default function RetailersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
