"use client";

import React from "react";
import { navigationLinks } from "./constants";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
} from "@/components/ui/resizable-navbar";

export default function Header() {
  return (
    <div className="relative w-full">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navigationLinks} />
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <div className="flex items-center">
              <NavbarLogo />
            </div>
            <div className="flex items-center"></div>
          </MobileNavHeader>
        </MobileNav>
      </Navbar>
    </div>
  );
}
