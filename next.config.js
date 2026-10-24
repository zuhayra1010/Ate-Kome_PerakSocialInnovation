/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // mongoose must stay external to the server bundle on Vercel
  experimental: { serverComponentsExternalPackages: ['mongoose'] },
};

module.exports = nextConfig;
