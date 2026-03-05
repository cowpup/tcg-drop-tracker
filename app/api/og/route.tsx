import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "TCG Drop Tracker";
  const subtitle = searchParams.get("subtitle") || "Track TCG product drops and trade shows";
  const game = searchParams.get("game");
  const type = searchParams.get("type") || "default";

  // Color schemes based on game/type
  const colors: Record<string, { bg: string; accent: string }> = {
    POKEMON: { bg: "#3B82F6", accent: "#60A5FA" },
    MTG: { bg: "#0891B2", accent: "#22D3EE" },
    YUGIOH: { bg: "#F59E0B", accent: "#FCD34D" },
    LORCANA: { bg: "#22C55E", accent: "#4ADE80" },
    ONEPIECE: { bg: "#EF4444", accent: "#F87171" },
    signal: { bg: "#DC2626", accent: "#F87171" },
    default: { bg: "#4F46E5", accent: "#818CF8" },
  };

  const colorScheme = colors[game || type] || colors.default;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colorScheme.bg,
          backgroundImage: `linear-gradient(135deg, ${colorScheme.bg} 0%, ${colorScheme.accent} 100%)`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: "white",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colorScheme.bg}
              strokeWidth="2"
            >
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          <h1
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              margin: 0,
              lineHeight: 1.2,
              textShadow: "0 2px 20px rgba(0,0,0,0.2)",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.9)",
              marginTop: 20,
              maxWidth: 800,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            tcgdroptracker.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
