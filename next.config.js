/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  pageExtensions: ['page.js', 'page.jsx'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
