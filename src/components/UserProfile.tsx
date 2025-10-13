"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please log in</div>;
  }

  return (
    <div className="p-4">
      <h2>Welcome, {session?.user?.name}!</h2>
      <p>Email: {session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>
      <Button onClick={() => signOut()}>Logout</Button>
    </div>
  );
}
