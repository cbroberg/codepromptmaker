import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@cpm/db', '@cpm/shared'],
};

export default nextConfig;
