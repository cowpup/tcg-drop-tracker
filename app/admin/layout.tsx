import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Admin",
  description: "Admin dashboard for managing TCG drops, products, and trade shows.",
  pathname: "/admin",
  noIndex: true, // Don't index admin pages
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
