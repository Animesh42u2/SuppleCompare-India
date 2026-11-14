/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pre-builds every page as plain HTML into /out, so hosting stays free
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
