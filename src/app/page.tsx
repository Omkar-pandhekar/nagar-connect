import Header from "@/components/Layouts/Header";
import Footer from "@/components/Layouts/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import HomeClientPage from "@/components/Home/HomeClientPage";
// Map section removed for now

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-700">
      <Header />
      <HomeClientPage session={session} />
      <Footer />
    </main>
  );
}
