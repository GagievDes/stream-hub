import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { NativeShell } from "@/components/native-shell";
import { SiteHeader } from "@/components/site-header";
import { publicAsset } from "@/lib/utils";
import "./globals.css";

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
    icon: [{ url: `${publicAsset("/favicon.png")}?v=2`, type: "image/png" }],
    apple: [{ url: `${publicAsset("/icon-192.png")}?v=2` }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NativeShell />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
