/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://antigravity-e-commerce-uv1a.vercel.app/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'https://antigravity-e-commerce-uv1a.vercel.app/uploads/:path*',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: '995456103358-aaadinq4e56tcs4s0ram93kglqmn6bp4.apps.googleusercontent.com',
  },
};

export default nextConfig;
