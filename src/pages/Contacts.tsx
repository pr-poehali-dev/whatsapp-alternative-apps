import { useState } from "react";
import Icon from "@/components/ui/icon";

const ROLE_COLORS: Record<string, string> = {
  superadmin: "from-red-500 to-orange-500",
  admin: "from-violet-500 to-purple-600",
  moderator: "from-blue-500 to-cyan-500",
  user: "from-emerald-500 to-teal-500",
};

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Суперадмин",
  admin: "Администратор",
  moderator: "Модератор",
  user: "Пользователь",
};

const CONTACTS = [
  { id: 1, name: "Алексей Петров", city: "Москва", role: "admin", online: true, age: 34 },
  { id: 2, name: "Мария Сидорова", city: "Санкт-Петербург", role: "moderator", online: true, age: 28 },
  { id: 3, name: "Дмитрий Козлов", city: "Казань", role: "user", online: false, age: 31 },
  { id: 4, name: "Елена Новикова", city: "Екатеринбург", role: "superadmin", online: true, age: 42 },
  { id: 5, name: "Сергей Морозов", city: "Новосибирск", role: "user", online: false, age: 25 },
  { id: 6, name: "Анна Волкова", city: "Краснодар", role: "moderator", online: false, age: 30 },
  { id: 7, name: "Павел Лебедев", city: "Москва", role: "admin", online: true, age: 38 },
  { id: 8, name: "Ольга Семёнова", city: "Ростов-на-Дону", role: "user", online: false, age: 27 },
];

export default function Contacts() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const filtered = CONTACTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || c.role === filterRole;
    return matchSearch && matchRole;
  });

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Шапка */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Контакты</h2>
          <span className="text-muted-foreground text-sm">{CONTACTS.length} человек</span>
        </div>
        {/* Поиск */}
        <div className="relative mb-3">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Поиск по имени или городу..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-input border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
        </div>
        {/* Фильтры */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[{ id: "all", label: "Все" }, { id: "superadmin", label: "Суперадмин" }, { id: "admin", label: "Админ" }, { id: "moderator", label: "Модератор" }, { id: "user", label: "Юзер" }].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterRole(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterRole === f.id ? "btn-gradient text-white relative z-10" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Список */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((contact, i) => (
            <div
              key={contact.id}
              className="glass-card rounded-2xl p-4 hover:border-primary/30 transition-all animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                {/* Аватар */}
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ROLE_COLORS[contact.role]} flex items-center justify-center text-white font-bold text-sm`}>
                    {initials(contact.name)}
                  </div>
                  {contact.online && <div className="absolute -bottom-0.5 -right-0.5 online-dot" />}
                </div>
                {/* Инфо */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{contact.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Icon name="MapPin" size={11} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground text-xs truncate">{contact.city}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${ROLE_COLORS[contact.role]} text-white`}>
                      {ROLE_LABELS[contact.role]}
                    </span>
                    <span className="text-muted-foreground text-xs">{contact.age} лет</span>
                  </div>
                </div>
              </div>
              {/* Кнопки */}
              <div className="flex gap-2 mt-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-primary/15 hover:bg-primary/25 text-primary rounded-lg py-2 text-xs font-medium transition-all">
                  <Icon name="MessageCircle" size={13} />
                  Написать
                </button>
                <button className="w-9 h-9 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded-lg transition-all">
                  <Icon name="Phone" size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <Icon name="UserX" size={40} className="text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">Контакты не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
