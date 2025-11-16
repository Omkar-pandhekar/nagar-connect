"use client";

import React from "react";
import HeroSection from "./HeroSection";
import StatsSection from "./StatsSection";
import HowItWorksSection from "./HowItWorksSection";
import CtaSection from "./CtaSection";

const Home = () => {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      {/* Map section will be added later */}
      <CtaSection />
    </>
  );
};

export default Home;
