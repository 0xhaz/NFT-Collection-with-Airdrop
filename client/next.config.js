/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  externals: [
    {
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    },
  ],
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
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/**/*",
      },
      {
        protocol: "https",
        hostname: "gateway.ipfs.io",
        pathname: "/ipfs/**/*",
      },
    ],
  },
};

module.exports = nextConfig;
