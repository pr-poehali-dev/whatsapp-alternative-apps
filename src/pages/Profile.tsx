import { useState } from "react";
import Icon from "@/components/ui/icon";
import { UserData } from "./Register";

interface ProfileProps {
  user: UserData;
  onLogout: () => void;
}

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

const ROLE_PERMS: Record<string, string[]> = {
  superadmin: ["Полный доступ к системе", "Управление ролями", "Удаление пользователей", "Просмотр всех чатов", "Системные настройки"],
  admin: ["Управление командой", "Создание групп", "Просмотр статистики", "Блокировка пользователей"],
  moderator: ["Удаление сообщений", "Управление контентом", "Предупреждения пользователям"],
  user: ["Отправка сообщений", "Создание личных чатов", "Участие в группах"],
};

export default function Profile({ user, onLogout }: ProfileProps) {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Шапка профиля */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-cyan-500/20" />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative p-6 pb-8 text-center">
          {/* Аватар */}
          <div className="relative inline-block mb-4">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${ROLE_COLORS[user.role]} flex items-center justify-center text-white text-3xl font-black mx-auto animate-pulse-glow`}>
              {initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 btn-gradient rounded-xl flex items-center justify-center relative z-10 shadow-lg">
              <Icon name="Camera" size={14} className="text-white relative z-10" />
            </button>
          </div>
          <h2 className="font-display text-2xl font-black">{user.firstName} {user.lastName}</h2>
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-gradient-to-r ${ROLE_COLORS[user.role]} text-white text-xs font-semibold`}>
            <Icon name="Shield" size={11} />
            {ROLE_LABELS[user.role]}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="text-center">
              <div className="font-bold text-lg">48</div>
              <div className="text-muted-foreground text-xs">Контактов</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="font-bold text-lg">12</div>
              <div className="text-muted-foreground text-xs">Групп</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="font-bold text-lg">∞</div>
              <div className="text-muted-foreground text-xs">Сообщений</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Личные данные */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Личные данные</p>
          </div>
          {[
            { icon: "User", label: "Имя", value: `${user.firstName} ${user.lastName}` },
            { icon: "MapPin", label: "Город", value: user.city },
            { icon: "Calendar", label: "Возраст", value: `${user.age} лет` },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/30 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={15} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <p className="font-medium text-sm">{item.value}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground/40" />
            </div>
          ))}
        </div>

        {/* Права доступа */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in delay-100">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Права доступа</p>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {ROLE_PERMS[user.role].map((perm, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={11} className="text-emerald-400" />
                  </div>
                  <span className="text-sm">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Настройки уведомлений */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in delay-200">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Уведомления</p>
          </div>
          {[
            { icon: "Bell", label: "Push-уведомления", desc: "Новые сообщения и события", value: notifications, onChange: setNotifications },
            { icon: "Volume2", label: "Звуки", desc: "Звуки входящих сообщений", value: sounds, onChange: setSounds },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/30 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={15} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </div>
              <button
                onClick={() => item.onChange(!item.value)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${item.value ? "bg-gradient-to-r from-violet-500 to-cyan-500" : "bg-secondary"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${item.value ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Кнопка выхода */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-all font-medium text-sm animate-fade-in delay-300"
        >
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </button>

        <div className="h-4" />
      </div>

      {/* Подтверждение выхода */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowLogoutConfirm(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="LogOut" size={22} className="text-destructive" />
            </div>
            <h3 className="font-bold text-lg text-center mb-1">Выйти?</h3>
            <p className="text-muted-foreground text-sm text-center mb-6">Вы уверены, что хотите выйти из аккаунта?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 bg-secondary rounded-xl text-sm font-medium">Отмена</button>
              <button onClick={onLogout} className="flex-1 py-2.5 bg-destructive rounded-xl text-white text-sm font-semibold">Выйти</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
