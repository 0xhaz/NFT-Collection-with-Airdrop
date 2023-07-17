/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["*"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.hackernoon.com",
        pathname: "/images/**/*",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**/*",
      },
    ],
  },
};

module.exports = nextConfig;
