/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Vercel serverless environment
  experimental: {
    serverComponentsExternalPackages: [
      'pdf-parse',
      'mammoth'
    ],
    outputFileTracingIncludes: {
      '/api/**': [
        './node_modules/pdf-parse/**',
        './node_modules/mammoth/**'
      ]
    }
  },
  
  // Webpack configuration for native dependencies
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        'mammoth': 'commonjs mammoth'
      });
    }
    return config;
  },

  // API route configuration for longer timeouts
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 