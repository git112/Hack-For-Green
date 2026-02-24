import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import GovAirChatbot from "@/components/GovAirChatbot";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      
      {/* GovAir AI Chatbot for Public Users */}
      <GovAirChatbot
        userRole="Public"
        city="Delhi"
      />
    </div>
  );
}
