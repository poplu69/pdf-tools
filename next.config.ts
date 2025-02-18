/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Tell Next.js to use 'src' as the base directory
  dir: "./src",
};

module.exports = nextConfig;
