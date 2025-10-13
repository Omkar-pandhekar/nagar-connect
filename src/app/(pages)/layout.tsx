import Footer from "@/components/Layouts/Footer";
import Header from "@/components/Layouts/Header";
import React from "react";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
