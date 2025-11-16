"use client";
import React from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Heading({ title, subtitle }: HeaderProps) {
  return (
    <div className="mb-5">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-xl text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
