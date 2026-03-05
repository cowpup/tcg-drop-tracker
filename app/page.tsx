import Link from "next/link";
import { DropFeed } from "@/components/drops";
import { Calendar, MapPin, Bell } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
        <h1 className="text-3xl font-bold">TCG Drop Tracker</h1>
        <p className="mt-2 max-w-2xl text-blue-100">
          Track upcoming product drops, restocks, and trade shows for Pokemon,
          Magic: The Gathering, Yu-Gi-Oh!, Lorcana, One Piece, and more.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/calendar"
            className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            <Calendar className="h-4 w-4" />
            View Calendar
          </Link>
          <Link
            href="/shows"
            className="flex items-center gap-2 rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <MapPin className="h-4 w-4" />
            Find Trade Shows
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <Bell className="h-4 w-4" />
            Set Alerts
          </Link>
        </div>
      </section>

      {/* Drops Feed */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Upcoming Drops
        </h2>
        <DropFeed />
      </section>
    </div>
  );
}
