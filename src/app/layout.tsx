import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { FontSizeProvider } from "@/components/font-size-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { productConfig } from "@/product/config";
import type { Metadata } from "next";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: productConfig.name,
    template: `%s | ${productConfig.name}`,
  },
  description: productConfig.tagline,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: productConfig.name,
    title: productConfig.name,
    description: productConfig.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: productConfig.name,
    description: productConfig.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: productConfig.name,
  description: productConfig.tagline,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { --product-primary: ${productConfig.primaryColor}; }`,
          }}
        />
      </head>
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} font-[family-name:var(--font-dm-sans)] antialiased`}
      >
        <FontSizeProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SiteHeader />
            <main id="main-content">{children}</main>
            <SiteFooter />
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </FontSizeProvider>
      </body>
    </html>
  );
}
