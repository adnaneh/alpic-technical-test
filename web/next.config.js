const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (!API_BASE) return [];
    return [
      { source: "/api/:path*", destination: `${API_BASE.replace(/\/$/, "")}/api/:path*` },
      { source: "/socket.io/:path*", destination: `${API_BASE.replace(/\/$/, "")}/socket.io/:path*` },
    ];
  },
};

module.exports = nextConfig;
