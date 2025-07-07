const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  customWorkerSrc: "service-worker", // folder kamu
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dkrgkvkdmnclzuoeuyqm.supabase.co",
        pathname: "/storage/v1/object/public/report-images/**",
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
