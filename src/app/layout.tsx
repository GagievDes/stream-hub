import type { Metadata } from "next";
import { Bebas_Neue, Figtree, Newsreader } from "next/font/google";
import { NativeShell } from "@/components/native-shell";
import { SiteHeader } from "@/components/site-header";
import { ThemeBoot } from "@/components/theme-boot";
import { publicAsset } from "@/lib/utils";
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

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
});

const themeScript = `(function(){try{var t=localStorage.getItem("strain-theme");if(t!=="ink"&&t!=="editorial"&&t!=="glass")t="ink";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="ink";}})();`;

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
    <html
      lang="en"
      data-theme="ink"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeBoot />
        <NativeShell />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
