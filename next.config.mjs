/** @type {import('next').NextConfig} */

// Backend (Express + Socket.io) manzili. Eski API'lar shu serverda ishlaydi.
// Standart: http://localhost:3000. O'zgartirish uchun .env.local da BACKEND_URL bering.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Barcha /api va /socket.io so'rovlarini mavjud backendga proxy qilamiz.
    // Shu tufayli frontend kodida eski nisbiy yo'llar (/api/...) o'zgarmasdan ishlaydi.
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/socket.io",
        destination: `${BACKEND_URL}/socket.io/`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${BACKEND_URL}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
