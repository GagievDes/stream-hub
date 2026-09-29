import type { Metadata } from "next";
import { Bebas_Neue, Figtree } from "next/font/google";
import { DemoBanner } from "@/components/demo-banner";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lumina — Find movies & TV by name",
    template: "%s · Lumina",
  },
  description:
    "Browse movies and TV series by name via TMDB, then watch with vidsrc embeds using TMDB IDs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DemoBanner />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
