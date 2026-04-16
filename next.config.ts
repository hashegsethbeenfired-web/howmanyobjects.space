import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trim bytes from every response
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Long-cache the static assets Next generates a hash for; images stay
  // fresh thanks to content-hashed filenames.
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
