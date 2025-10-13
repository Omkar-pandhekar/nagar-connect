"use client";

import Header from "@/components/Layouts/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/Layouts/AppSidebar";
import { NAVBAR_HEIGHT } from "@/components/Layouts/constants";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user?.role) {
      const userRole = session.user.role.toLowerCase();
      const currentPath = pathname?.toLowerCase();

      // Redirect to appropriate dashboard based on role
      if (userRole === "citizen" && !currentPath?.startsWith("/citizen")) {
        router.push("/citizen", { scroll: false });
      } else if (
        userRole === "field_staff" &&
        !currentPath?.startsWith("/staff")
      ) {
        router.push("/staff", { scroll: false });
      } else if (userRole === "admin" && !currentPath?.startsWith("/admin")) {
        router.push("/admin", { scroll: false });
      } else if (userRole === "ngo" && !currentPath?.startsWith("/ngo")) {
        router.push("/ngo", { scroll: false });
      }
    }
  }, [session?.user?.role, router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (!session?.user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">No user role found</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-primary-100">
        <Header />
        <div style={{ marginTop: `${NAVBAR_HEIGHT}px` }}>
          <main className="flex">
            <Sidebar
              userType={
                session.user.role.toLowerCase() as
                  | "citizen"
                  | "field_staff"
                  // | "admin"
                  | "ngo"
              }
            />
            <div className="flex-grow transition-all duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
