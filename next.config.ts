import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.woff2': {
        loaders: ['file-loader'],
        as: '*.woff2',
      },
    },
  },
  allowedDevOrigins: [
    'localhost:3000',
    '10.16.61.31:3000',
    '192.168.1.0/24',
    '10.0.0.0/8',
  ],
};

export default nextConfig;
