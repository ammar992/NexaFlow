import { Faq, FinalCta, Footer } from "@/components/marketing/closing";
import { Hero } from "@/components/marketing/hero";
import { Navbar } from "@/components/marketing/navbar";
import { BrandStrip, Challenges, FeatureShowcase, Modules, MultiTenant, Pricing } from "@/components/marketing/sections";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#0b1020] text-white [color-scheme:dark]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-[#0b1020]">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <BrandStrip />
        <Challenges />
        <FeatureShowcase />
        <Modules />
        <MultiTenant />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
