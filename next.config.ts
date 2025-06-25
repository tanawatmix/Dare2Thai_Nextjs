
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@mui/material',
    '@emotion/react',
    '@emotion/styled',
    'react-icons',
    'react-parallax-tilt',
  ],
};



export default nextConfig;