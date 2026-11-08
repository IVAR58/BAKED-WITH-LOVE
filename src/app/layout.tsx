import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSettings, publicSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default:
      "Baked with Love — Pâtisserie · Macarons artisanaux à Bordj Bou Arreridj",
    template: "%s · Baked with Love",
  },
  description:
    "Atelier spécialisé en macarons artisanaux à Bordj Bou Arreridj. Macarons, coffrets, pyramides et centres de table composés selon vos envies. Qualité, précision, élégance.",
  openGraph: {
    title: "Baked with Love — Pâtisserie",
    description:
      "Macarons artisanaux, coffrets et centres de table sur mesure — Bordj Bou Arreridj.",
    type: "website",
    locale: "fr_FR",
    images: [{ url: "/images/hero-macarons.jpg" }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSettings();
  const pub = publicSettings(s);

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Parisienne&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="bg-paper text-ink font-sans">
        <CartProvider>
          <Header
            storeName={pub.storeName}
            storeSubtitle={pub.storeSubtitle}
            announcement={pub.announcement}
            logoUrl={pub.logoUrl}
          />
          <main className="min-h-[60vh]">{children}</main>
          <Footer
            storeName={pub.storeName}
            storeSubtitle={pub.storeSubtitle}
            tagline={pub.tagline}
            city={pub.city}
            instagram={pub.instagram}
            whatsapp={pub.whatsapp}
            phone={pub.phone}
            logoUrl={pub.logoUrl}
          />
        </CartProvider>
      </body>
    </html>
  );
}
