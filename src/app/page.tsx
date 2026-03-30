import { HeroSection } from "@/product/components/landing/hero-section";
import { LandingCtaSection } from "@/product/components/landing/landing-cta-section";
import { PricingSection } from "@/product/components/landing/pricing-section";
import { productConfig } from "@/product/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${productConfig.name} — ${productConfig.tagline}`,
  description: `${productConfig.tagline} ${productConfig.credits.freeCredits} free analyses on signup.`,
  openGraph: {
    title: `${productConfig.name} — ${productConfig.tagline}`,
    description: `${productConfig.tagline} ${productConfig.credits.freeCredits} free analyses on signup.`,
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PricingSection />
      <LandingCtaSection />
    </>
  );
}
