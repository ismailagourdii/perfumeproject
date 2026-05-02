import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Évite que Turbopack prenne un lockfile parent (/Users/mac/package-lock.json) comme racine du monorepo.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
