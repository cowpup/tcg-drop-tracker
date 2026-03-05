import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tcgplayer-cdn.tcgplayer.com",
      },
      {
        protocol: "https",
        hostname: "*.tcgplayer.com",
      },
      {
        protocol: "https",
        hostname: "images.pokemontcg.io",
      },
      {
        protocol: "https",
        hostname: "product-images.tcgplayer.com",
      },
      {
        protocol: "https",
        hostname: "*.pokemon.com",
      },
      {
        protocol: "https",
        hostname: "*.target.com",
      },
      {
        protocol: "https",
        hostname: "*.walmart.com",
      },
    ],
  },
};

export default nextConfig;
