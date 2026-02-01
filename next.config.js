/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  pageExtensions: ['page.js', 'page.jsx'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/perfil',
        destination: '/PerfilUsuario',
        permanent: false,
      },
      {
        source: '/perfil/:id',
        destination: '/PerfilUsuario',
        permanent: false,
      }
    ];
  },
};

module.exports = nextConfig;
