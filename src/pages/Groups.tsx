import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Group {
  id: number;
  name: string;
  description: string;
  members: number;
  icon: string;
  color: string;
  lastMessage: string;
  time: string;
  unread: number;
  isJoined: boolean;
}

const GROUPS: Group[] = [
  { id: 1, name: "🏢 Общий чат компании", description: "Все сотрудники компании", members: 48, icon: "Building2", color: "from-violet-500 to-purple-600", lastMessage: "Собрание в 15:00", time: "11:00", unread: 12, isJoined: true },
  { id: 2, name: "👷 Бригада #1", description: "Рабочая группа объекта А", members: 12, icon: "HardHat", color: "from-orange-500 to-amber-500", lastMessage: "Объект сдан!", time: "Вчера", unread: 5, isJoined: true },
  { id: 3, name: "📊 Руководство", description: "Только для менеджеров", members: 6, icon: "BarChart3", color: "from-blue-500 to-cyan-500", lastMessage: "Отчёт за неделю", time: "Вчера", unread: 0, isJoined: true },
  { id: 4, name: "🔧 Технический отдел", description: "Обсуждение технических вопросов", members: 15, icon: "Wrench", color: "from-emerald-500 to-teal-500", lastMessage: "Новое ПО установлено", time: "Пн", unread: 2, isJoined: false },
  { id: 5, name: "📢 Объявления", description: "Официальные новости", members: 48, icon: "Megaphone", color: "from-red-500 to-rose-500", lastMessage: "Праздничные выходные", time: "Пн", unread: 1, isJoined: true },
  { id: 6, name: "☕ Неформальный", description: "Общение и отдых", members: 31, icon: "Coffee", color: "from-yellow-500 to-orange-400", lastMessage: "Кто едет на корпоратив?", time: "Пт", unread: 0, isJoined: false },
];

interface GroupMessage {
  id: number;
  author: string;
  text: string;
  time: string;
  mine: boolean;
}

const MOCK_MSGS: Record<number, GroupMessage[]> = {
  1: [
    { id: 1, author: "Елена Новикова", text: "Доброе утро, коллеги!", time: "09:00", mine: false },
    { id: 2, author: "Я", text: "Доброе!", time: "09:05", mine: true },
    { id: 3, author: "Алексей Петров", text: "Собрание в 15:00 в переговорке А", time: "11:00", mine: false },
  ],
  2: [
    { id: 1, author: "Дмитрий Козлов", text: "Начинаем работу на объекте", time: "08:00", mine: false },
    { id: 2, author: "Я", text: "Принял, едем", time: "08:15", mine: true },
    { id: 3, author: "Сергей Морозов", text: "Объект сдан, всё чисто", time: "Вчера", mine: false },
  ],
};

export default function Groups() {
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [messageText, setMessageText] = useState("");
  const [groups, setGroups] = useState<Group[]>(GROUPS);
  const [messages, setMessages] = useState<Record<number, GroupMessage[]>>(MOCK_MSGS);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const joined = groups.filter(g => g.isJoined);
  const other = groups.filter(g => !g.isJoined);

  const sendMessage = () => {
    if (!messageText.trim() || !activeGroup) return;
    const newMsg: GroupMessage = {
      id: Date.now(), author: "Я", text: messageText.trim(),
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }), mine: true
    };
    setMessages(prev => ({ ...prev, [activeGroup.id]: [...(prev[activeGroup.id] || []), newMsg] }));
    setGroups(prev => prev.map(g => g.id === activeGroup.id ? { ...g, lastMessage: messageText.trim(), unread: 0 } : g));
    setMessageText("");
  };

  const toggleJoin = (id: number) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, isJoined: !g.isJoined, members: g.isJoined ? g.members - 1 : g.members + 1 } : g));
  };

  return (
    <div className="flex h-full">
      {/* Список групп */}
      <div className={`flex flex-col ${activeGroup ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 border-r border-border`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-lg">Группы</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="w-8 h-8 btn-gradient rounded-lg flex items-center justify-center relative z-10"
            >
              <Icon name="Plus" size={16} className="text-white relative z-10" />
            </button>
          </div>
          <p className="text-muted-foreground text-xs">Групповые чаты и команды</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Мои группы */}
          <div className="px-4 py-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">Мои группы</p>
            {joined.map((g, i) => (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all mb-1 animate-fade-in text-left ${activeGroup?.id === g.id ? "bg-primary/10 border border-primary/30" : ""}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-white text-lg flex-shrink-0`}>
                  {g.name.split(" ")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm truncate">{g.name.substring(2)}</span>
                    <span className="text-muted-foreground text-xs flex-shrink-0 ml-1">{g.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-muted-foreground text-xs truncate">{g.lastMessage}</span>
                    {g.unread > 0 && (
                      <span className="ml-1 flex-shrink-0 min-w-5 h-5 btn-gradient rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1 relative z-10">
                        {g.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Другие группы */}
          {other.length > 0 && (
            <div className="px-4 py-2">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">Можно вступить</p>
              {other.map((g, i) => (
                <div
                  key={g.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border mb-1 animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-white text-lg flex-shrink-0 opacity-70`}>
                    {g.name.split(" ")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{g.name.substring(2)}</div>
                    <div className="text-muted-foreground text-xs">{g.members} участников</div>
                  </div>
                  <button
                    onClick={() => toggleJoin(g.id)}
                    className="flex-shrink-0 px-3 py-1.5 btn-gradient rounded-lg text-white text-xs font-medium relative z-10"
                  >
                    Войти
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Окно группы */}
      {activeGroup ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border glass">
            <button onClick={() => setActiveGroup(null)} className="md:hidden w-8 h-8 flex items-center justify-center text-muted-foreground">
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeGroup.color} flex items-center justify-center text-white text-lg flex-shrink-0`}>
              {activeGroup.name.split(" ")[0]}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{activeGroup.name.substring(2)}</div>
              <div className="text-xs text-muted-foreground">{activeGroup.members} участников</div>
            </div>
            <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Icon name="Users" size={18} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Icon name="MoreVertical" size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(messages[activeGroup.id] || []).map((msg, i) => (
              <div key={msg.id} className={`flex ${msg.mine ? "justify-end" : "justify-start"} animate-fade-in`} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`max-w-[75%] ${msg.mine ? "" : ""}`}>
                  {!msg.mine && <p className="text-xs text-primary mb-1 px-1">{msg.author}</p>}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.mine ? "btn-gradient text-white rounded-br-md relative z-10" : "glass border border-border rounded-bl-md"}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.mine ? "text-white/60" : "text-muted-foreground"}`}>{msg.time}</p>
                  </div>
                </div>
              </div>
            ))}
            {(!messages[activeGroup.id] || messages[activeGroup.id].length === 0) && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Icon name="MessageCircle" size={40} className="text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">Начните общение в группе</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border glass">
            <div className="flex items-center gap-2">
              <input
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Написать в группу..."
                className="flex-1 bg-input border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
              />
              <button
                onClick={sendMessage}
                disabled={!messageText.trim()}
                className={`w-10 h-10 rounded-xl btn-gradient flex items-center justify-center flex-shrink-0 relative z-10 transition-opacity ${!messageText.trim() ? "opacity-40" : ""}`}
              >
                <Icon name="Send" size={16} className="text-white relative z-10" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl btn-gradient flex items-center justify-center mx-auto mb-4 animate-pulse-glow relative z-10">
              <Icon name="Users" size={40} className="text-white relative z-10" />
            </div>
            <h3 className="font-bold text-lg mb-2 gradient-text">Выберите группу</h3>
            <p className="text-muted-foreground text-sm">Нажмите на группу слева,<br />чтобы открыть чат</p>
          </div>
        </div>
      )}

      {/* Модалка создания группы */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowCreate(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">Создать группу</h3>
            <input
              placeholder="Название группы"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 mb-4 placeholder:text-muted-foreground/50"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-secondary rounded-xl text-sm font-medium">Отмена</button>
              <button
                onClick={() => {
                  if (!newGroupName.trim()) return;
                  const ng: Group = { id: Date.now(), name: `💬 ${newGroupName}`, description: "", members: 1, icon: "MessageCircle", color: "from-violet-500 to-cyan-500", lastMessage: "Группа создана", time: "Сейчас", unread: 0, isJoined: true };
                  setGroups(prev => [...prev, ng]);
                  setNewGroupName("");
                  setShowCreate(false);
                }}
                className="flex-1 btn-gradient py-2.5 rounded-xl text-white text-sm font-medium relative z-10"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
