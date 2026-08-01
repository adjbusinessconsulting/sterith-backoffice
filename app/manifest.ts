import type { MetadataRoute } from "next";

// Preview (dev) builds install as a SEPARATE app: plain "Backoffice" with the
// muted dev icon, so a dev copy on the home screen is never mistaken for the
// real one beside it. Vercel sets VERCEL_ENV to 'preview' for branch deploys.
const isDev = process.env.VERCEL_ENV === "preview";

export default function manifest(): MetadataRoute.Manifest {
  const name = isDev ? "Backoffice" : "Sterith Back Office";
  const icon = isDev ? "/icon-dev-512.png" : "/icon-512.png";

  return {
    name,
    short_name: isDev ? "Backoffice" : "Back Office",
    description: isDev ? "Back Office — lingkungan pengembangan" : "Inventori & manajemen toko Sterith.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0D1117",
    theme_color: "#0D1117",
    icons: [
      { src: icon, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: icon, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: icon, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
