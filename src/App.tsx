import { useState } from "react";
import Register, { UserData } from "./pages/Register";
import Chats from "./pages/Chats";
import Contacts from "./pages/Contacts";
import Groups from "./pages/Groups";
import Profile from "./pages/Profile";
import Icon from "@/components/ui/icon";

type Tab = "chats" | "contacts" | "groups" | "profile";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "chats", label: "Чаты", icon: "MessageCircle" },
  { id: "contacts", label: "Контакты", icon: "Users" },
  { id: "groups", label: "Группы", icon: "UsersRound" },
  { id: "profile", label: "Профиль", icon: "UserCircle" },
];

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("chats");

  if (!user) {
    return <Register onRegister={(u) => setUser(u)} />;
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Шапка */}
      <header className="glass border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center relative z-10" style={{ background: "var(--reg-btn)" }}>
            <Icon name="Truck" size={16} className="text-white relative z-10" />
          </div>
          <span className="font-display font-black text-lg" style={{ color: "var(--reg-text-primary)" }}>
            Gruz<span style={{ color: "var(--reg-accent)" }}> off</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
            <Icon name="Bell" size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center text-white text-xs font-bold relative z-10"
          >
            {user.firstName[0]}{user.lastName[0]}
          </button>
        </div>
      </header>

      {/* Контент */}
      <main className="flex-1 overflow-hidden">
        <div className={`h-full ${activeTab === "chats" ? "block" : "hidden"}`}>
          <Chats user={user} />
        </div>
        <div className={`h-full overflow-hidden ${activeTab === "contacts" ? "block" : "hidden"}`}>
          <Contacts />
        </div>
        <div className={`h-full overflow-hidden ${activeTab === "groups" ? "block" : "hidden"}`}>
          <Groups />
        </div>
        <div className={`h-full overflow-hidden ${activeTab === "profile" ? "block" : "hidden"}`}>
          <Profile user={user} onLogout={() => { setUser(null); setActiveTab("chats"); }} />
        </div>
      </main>

      {/* Нижняя навигация */}
      <nav className="glass border-t border-border flex-shrink-0 z-10">
        <div className="flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all duration-200 relative ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === tab.id && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
              )}
              <div className={`relative transition-transform duration-200 ${activeTab === tab.id ? "scale-110" : ""}`}>
                <Icon name={tab.icon} size={22} />
                {tab.id === "chats" && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 btn-gradient rounded-full flex items-center justify-center text-white text-[9px] font-bold relative z-10">
                    3
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-all ${activeTab === tab.id ? "opacity-100" : "opacity-60"}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </nav>
    </div>
  );
}