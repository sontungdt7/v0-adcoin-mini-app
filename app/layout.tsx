import type React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import { RootLayoutProvider } from "@/components/root-layout-provider";
import type { Metadata } from "next";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  return {
    other: {
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl:
          "https://bf86a94d-4eae-4e2b-a5d4-561fd4558851-00-13dju1adontpd.sisko.replit.dev/base-coin.jpg",
        button: {
          title: `Launch Adcoin`,
          action: {
            type: "launch_miniapp",
            name: "Adcoin",
            url: "https://bf86a94d-4eae-4e2b-a5d4-561fd4558851-00-13dju1adontpd.sisko.replit.dev/",
            splashImageUrl:
              "https://bf86a94d-4eae-4e2b-a5d4-561fd4558851-00-13dju1adontpd.sisko.replit.dev/degen-coin.jpg",
            splashBackgroundColor: "#000000",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <RootLayoutProvider>
          {children}
          <Analytics />
        </RootLayoutProvider>
      </body>
    </html>
  );
}
