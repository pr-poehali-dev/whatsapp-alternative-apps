import { useState } from "react";
import Register, { UserData } from "./pages/Register";
import Chats from "./pages/Chats";
import Contacts from "./pages/Contacts";
import Groups from "./pages/Groups";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Icon from "@/components/ui/icon";

type Tab = "orders" | "chats" | "contacts" | "groups" | "profile";

// Номер телефона администратора — только он видит кнопку создания заявки
const ADMIN_PHONE = "+79991234567";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "orders",   label: "Заявки",    icon: "ClipboardList" },
  { id: "chats",    label: "Чаты",      icon: "MessageCircle" },
  { id: "contacts", label: "Контакты",  icon: "Users" },
  { id: "groups",   label: "Группы",    icon: "UsersRound" },
  { id: "profile",  label: "Профиль",   icon: "UserCircle" },
];

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [userPhone, setUserPhone] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  if (!user) {
    return (
      <Register
        onRegister={(u, phone) => {
          setUser(u);
          setUserPhone(phone || "");
        }}
      />
    );
  }

  const isAdmin = userPhone === ADMIN_PHONE;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Шапка */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0 z-10"
        style={{ background: "rgba(15,25,35,0.95)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--reg-btn)" }}>
            <Icon name="Truck" size={16} className="text-white" />
          </div>
          <div>
            <span className="font-display font-black text-base leading-none" style={{ color: "var(--reg-text-primary)" }}>
              Gruz<span style={{ color: "var(--reg-accent)" }}> off</span>
            </span>
            <div className="text-[10px] leading-none mt-0.5" style={{ color: "var(--reg-text-muted)" }}>{user.city}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg relative" style={{ color: "var(--reg-text-muted)" }}>
            <Icon name="Bell" size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--reg-accent)" }} />
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black"
            style={{ background: "var(--reg-btn)" }}
          >
            {user.firstName[0]}{user.lastName[0]}
          </button>
        </div>
      </header>

      {/* Контент */}
      <main className="flex-1 overflow-hidden">
        <div className={`h-full overflow-hidden ${activeTab === "orders" ? "block" : "hidden"}`}>
          <Orders user={user} isAdmin={isAdmin} />
        </div>
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
          <Profile user={user} onLogout={() => { setUser(null); setUserPhone(""); setActiveTab("orders"); }} />
        </div>
      </main>

      {/* Нижняя навигация */}
      <nav className="border-t border-border flex-shrink-0 z-10"
        style={{ background: "rgba(15,25,35,0.95)", backdropFilter: "blur(20px)" }}>
        <div className="flex">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all duration-200 relative"
                style={{ color: active ? "var(--reg-accent)" : "var(--reg-text-muted)" }}
              >
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: "var(--reg-accent)" }} />
                )}
                <div className={`relative transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                  <Icon name={tab.icon} size={21} />
                </div>
                <span className={`text-[10px] font-medium ${active ? "opacity-100" : "opacity-50"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </nav>
    </div>
  );
}
