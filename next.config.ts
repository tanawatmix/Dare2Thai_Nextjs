
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@mui/material',
    '@emotion/react',
    '@emotion/styled',
    'react-icons',
    'react-parallax-tilt',
  ],
 images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wssuwegreksnzwhjnovp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;