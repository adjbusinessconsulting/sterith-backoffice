import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sterith Back Office",
    short_name: "Back Office",
    description: "Inventori & manajemen toko Sterith.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0D1117",
    theme_color: "#0D1117",
    icons: [
      { src: "/icon-512.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
