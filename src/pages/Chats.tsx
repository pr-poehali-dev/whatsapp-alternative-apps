import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { UserData } from "./Register";

const ADMIN_CHAT: Chat = {
  id: 0,
  name: "👑 Администратор (Gruz off)",
  lastMessage: "Напишите по заявке",
  time: "",
  unread: 0,
  online: true,
  avatar: "АД",
  messages: [],
};

interface ChatsProps {
  user: UserData;
  isAdmin: boolean;
  openOrderMessage?: string;
  onOpenOrderMessageUsed?: () => void;
}

interface Message {
  id: number;
  text: string;
  time: string;
  mine: boolean;
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar: string;
  isGroup?: boolean;
  messages: Message[];
}

const MOCK_CHATS: Chat[] = [
  {
    id: 1, name: "Алексей Петров", lastMessage: "Задача выполнена, можно проверять", time: "14:32",
    unread: 3, online: true, avatar: "АП",
    messages: [
      { id: 1, text: "Привет! Как дела с задачей?", time: "14:20", mine: false },
      { id: 2, text: "Работаю, скоро буду готово", time: "14:25", mine: true },
      { id: 3, text: "Задача выполнена, можно проверять", time: "14:32", mine: false },
    ]
  },
  {
    id: 2, name: "Мария Сидорова", lastMessage: "Отчёт отправила на почту", time: "12:15",
    unread: 0, online: true, avatar: "МС",
    messages: [
      { id: 1, text: "Добрый день! Отчёт готов", time: "12:10", mine: false },
      { id: 2, text: "Отлично, пришли пожалуйста", time: "12:12", mine: true },
      { id: 3, text: "Отчёт отправила на почту", time: "12:15", mine: false },
    ]
  },
  {
    id: 3, name: "🏢 Общий чат", lastMessage: "Собрание в 15:00 в переговорке А", time: "11:00",
    unread: 12, online: false, avatar: "ОЧ", isGroup: true,
    messages: [
      { id: 1, text: "Всем привет! Напоминаю про митинг", time: "10:50", mine: false },
      { id: 2, text: "Буду", time: "10:55", mine: true },
      { id: 3, text: "Собрание в 15:00 в переговорке А", time: "11:00", mine: false },
    ]
  },
  {
    id: 4, name: "Дмитрий Козлов", lastMessage: "Ок, понял", time: "Вчера",
    unread: 0, online: false, avatar: "ДК",
    messages: [
      { id: 1, text: "Привет, проверь пожалуйста PR", time: "Вчера", mine: true },
      { id: 2, text: "Ок, понял", time: "Вчера", mine: false },
    ]
  },
  {
    id: 5, name: "👷 Бригада #1", lastMessage: "Объект сдан, всё чисто", time: "Вчера",
    unread: 5, online: false, avatar: "Б1", isGroup: true,
    messages: [
      { id: 1, text: "Ребята, как объект?", time: "Вчера", mine: true },
      { id: 2, text: "Объект сдан, всё чисто", time: "Вчера", mine: false },
    ]
  },
];

export default function Chats({ user, isAdmin, openOrderMessage, onOpenOrderMessageUsed }: ChatsProps) {
  // Для обычного пользователя первый чат всегда — чат с админом
  const initialChats = isAdmin ? MOCK_CHATS : [ADMIN_CHAT, ...MOCK_CHATS];
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState("");
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [search, setSearch] = useState("");

  // Автооткрытие чата с админом при отклике на заявку
  useEffect(() => {
    if (openOrderMessage) {
      const adminChat = chats.find(c => c.id === 0) || ADMIN_CHAT;
      setActiveChat(adminChat);
      setMessageText(openOrderMessage);
      onOpenOrderMessageUsed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openOrderMessage]);

  // Обычный пользователь видит только чат с администратором
  const visibleChats = isAdmin ? chats : chats.filter(c => c.id === 0);
  const filtered = visibleChats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!messageText.trim() || !activeChat) return;
    const newMsg: Message = {
      id: Date.now(), text: messageText.trim(), time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }), mine: true
    };
    setChats(prev => prev.map(c =>
      c.id === activeChat.id
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: messageText.trim(), time: newMsg.time, unread: 0 }
        : c
    ));
    setActiveChat(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev);
    setMessageText("");
  };

  return (
    <div className="flex h-full">
      {/* Список чатов */}
      <div className={`flex flex-col ${activeChat ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 border-r border-border`}>
        {/* Шапка */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">Сообщения</h2>
            <button className="w-8 h-8 btn-gradient rounded-lg flex items-center justify-center relative z-10">
              <Icon name="Plus" size={16} className="text-white relative z-10" />
            </button>
          </div>
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Поиск чатов..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-input border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Список */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((chat, i) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-all animate-fade-in text-left ${activeChat?.id === chat.id ? "bg-primary/10 border-r-2 border-primary" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Аватар */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl btn-gradient flex items-center justify-center text-white font-bold text-sm relative z-10">
                  {chat.avatar}
                </div>
                {chat.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 online-dot" />
                )}
              </div>
              {/* Инфо */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm truncate">{chat.name}</span>
                  <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-muted-foreground text-xs truncate">{chat.lastMessage}</span>
                  {chat.unread > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 btn-gradient rounded-full flex items-center justify-center text-white text-[10px] font-bold relative z-10 badge-glow">
                      {chat.unread > 9 ? "9+" : chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Окно чата */}
      {activeChat ? (
        <div className="flex-1 flex flex-col">
          {/* Шапка чата */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border glass">
            <button
              onClick={() => setActiveChat(null)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
            <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative z-10">
              {activeChat.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{activeChat.name}</div>
              <div className="text-xs text-emerald-400">{activeChat.online ? "В сети" : "Был(а) недавно"}</div>
            </div>
            <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="Phone" size={18} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="Video" size={18} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="MoreVertical" size={18} />
            </button>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeChat.messages.map((msg, i) => (
              <div key={msg.id} className={`flex ${msg.mine ? "justify-end" : "justify-start"} animate-fade-in`} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.mine
                    ? "btn-gradient text-white rounded-br-md relative z-10"
                    : "glass border border-border rounded-bl-md"
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.mine ? "text-white/60" : "text-muted-foreground"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Поле ввода */}
          <div className="p-4 border-t border-border glass">
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                <Icon name="Paperclip" size={18} />
              </button>
              <input
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Написать сообщение..."
                className="flex-1 bg-input border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
              />
              <button className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                <Icon name="Smile" size={18} />
              </button>
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
              <Icon name="MessageCircle" size={40} className="text-white relative z-10" />
            </div>
            <h3 className="font-bold text-lg mb-2 gradient-text">Выберите чат</h3>
            <p className="text-muted-foreground text-sm">Нажмите на диалог слева,<br />чтобы начать общение</p>
          </div>
        </div>
      )}
    </div>
  );
}