import type { Metadata } from "next";
import { Bebas_Neue, Figtree } from "next/font/google";
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
    default: "Strain Stream",
    template: "%s · Strain Stream",
  },
  description:
    "Strain Stream — browse movies and TV series, watch episodes, and continue where you left off.",
  applicationName: "Strain Stream",
  icons: {
    icon: [{ url: "/favicon.png?v=2", type: "image/png" }],
    apple: [{ url: "/icon-192.png?v=2" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
