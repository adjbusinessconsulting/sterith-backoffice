import type { Metadata } from "next";
import { EB_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

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

export const metadata: Metadata = {
  title: "Sterith Backoffice",
  description: "Inventori & manajemen toko",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${garamond.variable} ${hanken.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
