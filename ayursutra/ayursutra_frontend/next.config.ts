import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
    "10.243.0.162",
    "10.243.0.162:3000",
    "192.168.1.50",
    "192.168.1.50:3000",
    "192.168.56.77",
    "192.168.56.77:3000",
  ],
};

export default nextConfig;
