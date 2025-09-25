/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: '*' }
    ],
  },
  serverExternalPackages: ['firebase-admin'],
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        util: false,
        url: false,
        net: false,
        tls: false,
        assert: false,
        dns: false,
        child_process: false,
        express: false,
        etag: false,
        mime: false,
        send: false,
        destroy: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
