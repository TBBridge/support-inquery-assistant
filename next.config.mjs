/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse requires canvas which is optional
      config.externals = config.externals || [];
      config.externals.push('canvas');
    }
    return config;
  },
  // Allow images from external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
