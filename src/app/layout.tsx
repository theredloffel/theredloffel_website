import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { KitchenProvider } from "@/context/KitchenContext";
import { NotificationToast } from "@/components/NotificationToast";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Red Löffel | Cloud Kitchen",
  description: "Gourmet cloud kitchen. Fresh burgers, rice bowls, loaded fries, and delicacies delivered hot to your doorstep.",
  keywords: ["cloud kitchen", "burgers", "rice bowls", "gourmet delivery", "the red loeffel"],
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#FAF8F5] text-[#1C1917] antialiased selection:bg-[#FED7AA] selection:text-[#9A3412] font-sans"
      >
        <Script
          id="bitwarden-sanitizer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  var origError = console.error;
                  console.error = function() {
                    for (var i = 0; i < arguments.length; i++) {
                      var arg = arguments[i];
                      if (typeof arg === 'string' && (arg.indexOf('bis_skin_checked') !== -1 || arg.indexOf('bis_register') !== -1)) {
                        return;
                      }
                    }
                    origError.apply(console, arguments);
                  };

                  function cleanExtAttrs() {
                    try {
                      var els = document.querySelectorAll('[bis_skin_checked],[bis_register]');
                      for (var j = 0; j < els.length; j++) {
                        els[j].removeAttribute('bis_skin_checked');
                        els[j].removeAttribute('bis_register');
                      }
                    } catch (e) {}
                  }

                  cleanExtAttrs();
                  if (typeof MutationObserver !== 'undefined') {
                    new MutationObserver(cleanExtAttrs).observe(document.documentElement, {
                      attributes: true,
                      subtree: true,
                      attributeFilter: ['bis_skin_checked', 'bis_register']
                    });
                  }
                }
              })();
            `,
          }}
        />
        <KitchenProvider>
          {children}
          <NotificationToast />
        </KitchenProvider>
      </body>
    </html>
  );
}
