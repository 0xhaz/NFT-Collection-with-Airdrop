/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.hackernoon.com",
        pathname: "/images/**/*",
      },
    ],
  },
};

module.exports = nextConfig;
