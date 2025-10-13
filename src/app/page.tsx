"use client";

import React, { useMemo } from "react";
import HeroSection from "@/components/Home/HeroSection";
import StatsSection from "@/components/Home/StatsSection";
import HowItWorksSection from "@/components/Home/HowItWorksSection";
import CtaSection from "@/components/Home/CtaSection";
import Header from "@/components/Layouts/Header";
import Footer from "@/components/Layouts/Footer";
// Map section removed for now

export default function HomePage() {
  // Precompute any values if needed later
  useMemo(() => null, []);

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-700">
      <Header />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      {/* Map section will be added later */}
      <CtaSection />
      <Footer />
    </main>
  );
}
