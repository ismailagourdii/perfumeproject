import type { NextConfig } from "next";
import path from "path";

/** Autorise `next/image` pour les médias Laravel sous `/storage/**` (Next 16 : `remotePatterns` remplace `domains`). */
function imageRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "http", hostname: "localhost", pathname: "/storage/**" },
    { protocol: "http", hostname: "127.0.0.1", pathname: "/storage/**" },
    { protocol: "https", hostname: "localhost", pathname: "/storage/**" },
    { protocol: "https", hostname: "127.0.0.1", pathname: "/storage/**" },
  ];
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  try {
    const u = new URL(raw);
    const protocol = (u.protocol === "https:" ? "https" : "http") as "http" | "https";
    if (u.hostname && !["localhost", "127.0.0.1"].includes(u.hostname)) {
      patterns.push({ protocol, hostname: u.hostname, pathname: "/storage/**" });
    }
  } catch {
    /* ignore */
  }
  return patterns;
}

const nextConfig: NextConfig = {
  // Évite que Turbopack prenne un lockfile parent (/Users/mac/package-lock.json) comme racine du monorepo.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Équivalent à `domains: ["localhost","127.0.0.1"]` + prod ; Next 16 recommande `remotePatterns`.
    remotePatterns: imageRemotePatterns(),
  },
};

export default nextConfig;
