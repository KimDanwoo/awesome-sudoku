import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      // 다른 필요한 도메인들...
    ],
    // 또는 Next.js 12.3.0 이상에서는 remotePatterns 사용 (권장)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = config.resolve.alias ?? {};
    config.resolve.alias["jotai"] = path.resolve(__dirname, "src/shared/state/jotai");
    config.resolve.alias["jotai/utils"] = path.resolve(__dirname, "src/shared/state/jotai/utils");
    return config;
  },
};

export default nextConfig;
