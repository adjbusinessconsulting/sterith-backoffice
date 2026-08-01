import type { Metadata } from "next";
import { EB_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import RegisterSW from "@/components/RegisterSW";

const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

// Preview (dev) builds get the muted icon and a plain name, so an installed dev
// copy is distinguishable from production on the home screen and in the tab bar.
const isDev = process.env.VERCEL_ENV === "preview";
const appTitle = isDev ? "Backoffice (Dev)" : "Sterith Back Office";
const appIcon = isDev ? "/icon-dev-512.png" : "/icon-512.png";

export const metadata: Metadata = {
  title: appTitle,
  description: "Inventori & manajemen toko",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: appIcon,
    apple: appIcon,
  },
  appleWebApp: {
    capable: true,
    title: isDev ? "Backoffice" : "Sterith Back Office",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${garamond.variable} ${hanken.variable}`}>
      <body>
        <RegisterSW />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
