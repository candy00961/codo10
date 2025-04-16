/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
  },
  productionBrowserSourceMaps: true,
  env: {
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_DELIVERY_TOKEN,
    CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
  },
  webpack: (config, { isServer }) => {
    config.devtool = 'source-map';
    if (!isServer) {
      config.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      });
    }
    return config;
  },
  // cacheHandler: require('./cache-handler.js'), // Temporarily disabled due to build error
  // cacheMaxMemorySize: 0, // Temporarily disabled
};

module.exports = nextConfig;
