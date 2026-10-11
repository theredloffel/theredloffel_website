import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { KitchenProvider } from "@/context/KitchenContext";
import { NotificationToast } from "@/components/NotificationToast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Red Löffel | Le Bistro Artisanal Cloud Kitchen",
  description: "Michelin-inspired artisanal cloud kitchen. Wood-fired sourdough, handmade fresh pasta, and gourmet delicacies delivered hot to your doorstep.",
  keywords: ["cloud kitchen", "artisanal bistro", "wood-fired pizza", "fresh pasta", "gourmet delivery", "the red loeffel"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#FAF8F5] text-[#1C1917] antialiased selection:bg-[#FED7AA] selection:text-[#9A3412] font-sans">
        <KitchenProvider>
          {children}
          <NotificationToast />
        </KitchenProvider>
      </body>
    </html>
  );
}
