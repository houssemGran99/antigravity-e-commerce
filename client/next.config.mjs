/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/:path*`,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: '995456103358-aaadinq4e56tcs4s0ram93kglqmn6bp4.apps.googleusercontent.com',
  },
};

export default nextConfig;
