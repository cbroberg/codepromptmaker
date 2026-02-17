import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@cpm/db', '@cpm/shared'],
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
