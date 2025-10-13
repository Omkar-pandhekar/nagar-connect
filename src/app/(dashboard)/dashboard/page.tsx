import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  // Get session in server component
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Protected Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2>Welcome, {session.user.name}!</h2>
        <p>Email: {session.user.email}</p>
        <p>Role: {session.user.role}</p>
        <p>User ID: {session.user.id}</p>
      </div>
    </div>
  );
}
