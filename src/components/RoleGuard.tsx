"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackUrl?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackUrl = "/unauthorized",
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role && !allowedRoles.includes(session.user.role)) {
      router.push(fallbackUrl);
      return;
    }
  }, [session, status, allowedRoles, fallbackUrl, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (session?.user?.role && !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return <>{children}</>;
}
