/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/chat",
        destination: "http://localhost:3001/chat",
      },
    ];
  },
};

module.exports = nextConfig;