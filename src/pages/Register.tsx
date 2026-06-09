import { useState } from "react";
import Icon from "@/components/ui/icon";

type Role = "superadmin" | "admin" | "moderator" | "user";

interface RegisterProps {
  onRegister: (user: UserData) => void;
}

export interface UserData {
  firstName: string;
  lastName: string;
  city: string;
  age: number;
  role: Role;
}

const ROLES: { id: Role; label: string; desc: string; color: string; icon: string }[] = [
  { id: "superadmin", label: "Суперадмин", desc: "Полный доступ ко всему", color: "from-red-500 to-orange-500", icon: "ShieldCheck" },
  { id: "admin", label: "Администратор", desc: "Управление командой", color: "from-violet-500 to-purple-600", icon: "Shield" },
  { id: "moderator", label: "Модератор", desc: "Контроль контента", color: "from-blue-500 to-cyan-500", icon: "ShieldHalf" },
  { id: "user", label: "Пользователь", desc: "Общение в чатах", color: "from-emerald-500 to-teal-500", icon: "User" },
];

const CITIES = [
  "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
  "Нижний Новгород", "Челябинск", "Самара", "Уфа", "Ростов-на-Дону",
  "Краснодар", "Омск", "Воронеж", "Пермь", "Волгоград", "Красноярск",
  "Тюмень", "Саратов", "Тольятти", "Барнаул",
];

export default function Register({ onRegister }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: "", lastName: "", city: "", age: "" });
  const [role, setRole] = useState<Role | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [citySearch, setCitySearch] = useState("");
  const [showCities, setShowCities] = useState(false);

  const filteredCities = CITIES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Введите имя";
    if (!form.lastName.trim()) e.lastName = "Введите фамилию";
    if (!form.city) e.city = "Выберите город";
    if (!form.age) e.age = "Введите возраст";
    else if (Number(form.age) < 20) e.age = "Минимальный возраст — 20 лет";
    else if (Number(form.age) > 80) e.age = "Введите корректный возраст";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1 = () => {
    if (validate()) setStep(2);
  };

  const handleSubmit = () => {
    if (!role) return;
    onRegister({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      city: form.city,
      age: Number(form.age),
      role,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Фоновые блобы */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[5%] w-40 h-40 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

      {/* Логотип */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl btn-gradient mb-4 animate-pulse-glow relative z-10">
          <Icon name="MessageCircle" size={32} className="text-white relative z-10" />
        </div>
        <h1 className="font-display text-3xl font-black gradient-text tracking-tight">WorkChat</h1>
        <p className="text-muted-foreground text-sm mt-1">Корпоративный мессенджер</p>
      </div>

      {/* Индикатор шагов */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in delay-100">
        <div className={`flex items-center gap-2 transition-all duration-300 ${step >= 1 ? "opacity-100" : "opacity-40"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 1 ? "btn-gradient text-white" : "bg-muted text-muted-foreground"}`}>
            {step > 1 ? <Icon name="Check" size={14} /> : "1"}
          </div>
          <span className="text-sm font-medium hidden sm:block">Данные</span>
        </div>
        <div className={`w-12 h-[2px] rounded transition-all duration-500 ${step >= 2 ? "bg-gradient-to-r from-violet-500 to-cyan-500" : "bg-border"}`} />
        <div className={`flex items-center gap-2 transition-all duration-300 ${step >= 2 ? "opacity-100" : "opacity-40"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 2 ? "btn-gradient text-white" : "bg-muted text-muted-foreground"}`}>
            2
          </div>
          <span className="text-sm font-medium hidden sm:block">Роль</span>
        </div>
      </div>

      {/* Карточка формы */}
      <div className="w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 relative">

        {/* ШАГ 1 */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-1">Личные данные</h2>
            <p className="text-muted-foreground text-sm mb-6">Заполните информацию о себе</p>

            <div className="space-y-4">
              {/* Имя */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground/80">Имя</label>
                <div className="relative">
                  <Icon name="User" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Иван"
                    value={form.firstName}
                    onChange={e => { setForm(f => ({ ...f, firstName: e.target.value })); setErrors(er => ({ ...er, firstName: "" })); }}
                    className={`input-glow w-full bg-input border rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 ${errors.firstName ? "border-destructive" : "border-border focus:border-primary/60"}`}
                  />
                </div>
                {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName}</p>}
              </div>

              {/* Фамилия */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground/80">Фамилия</label>
                <div className="relative">
                  <Icon name="User" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Иванов"
                    value={form.lastName}
                    onChange={e => { setForm(f => ({ ...f, lastName: e.target.value })); setErrors(er => ({ ...er, lastName: "" })); }}
                    className={`input-glow w-full bg-input border rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 ${errors.lastName ? "border-destructive" : "border-border focus:border-primary/60"}`}
                  />
                </div>
                {errors.lastName && <p className="text-destructive text-xs mt-1">{errors.lastName}</p>}
              </div>

              {/* Город */}
              <div className="relative">
                <label className="text-sm font-medium mb-1.5 block text-foreground/80">Город</label>
                <div className="relative">
                  <Icon name="MapPin" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Начните вводить город..."
                    value={citySearch || form.city}
                    onFocus={() => { setShowCities(true); if (form.city) setCitySearch(""); }}
                    onChange={e => { setCitySearch(e.target.value); setForm(f => ({ ...f, city: "" })); setErrors(er => ({ ...er, city: "" })); }}
                    className={`input-glow w-full bg-input border rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 ${errors.city ? "border-destructive" : "border-border focus:border-primary/60"}`}
                  />
                  <Icon name="ChevronDown" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.city && <p className="text-destructive text-xs mt-1">{errors.city}</p>}
                {showCities && filteredCities.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 glass border border-border rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
                    {filteredCities.slice(0, 8).map(city => (
                      <button
                        key={city}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/20 transition-colors"
                        onMouseDown={() => {
                          setForm(f => ({ ...f, city }));
                          setCitySearch("");
                          setShowCities(false);
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Возраст */}
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground/80">Возраст</label>
                <div className="relative">
                  <Icon name="Calendar" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    placeholder="От 20 лет"
                    min={20}
                    max={80}
                    value={form.age}
                    onChange={e => { setForm(f => ({ ...f, age: e.target.value })); setErrors(er => ({ ...er, age: "" })); }}
                    className={`input-glow w-full bg-input border rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 ${errors.age ? "border-destructive" : "border-border focus:border-primary/60"}`}
                  />
                </div>
                {errors.age && <p className="text-destructive text-xs mt-1">{errors.age}</p>}
                <p className="text-muted-foreground/60 text-xs mt-1">Минимальный возраст для регистрации — 20 лет</p>
              </div>
            </div>

            <button
              onClick={handleStep1}
              className="btn-gradient w-full mt-6 py-3.5 rounded-xl font-semibold text-white text-sm relative z-10"
            >
              Продолжить →
            </button>
          </div>
        )}

        {/* ШАГ 2 — Выбор роли */}
        {step === 2 && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4 hover:text-foreground transition-colors"
            >
              <Icon name="ArrowLeft" size={16} />
              Назад
            </button>
            <h2 className="text-xl font-bold mb-1">Выберите роль</h2>
            <p className="text-muted-foreground text-sm mb-6">Роль определяет ваши права в системе</p>

            <div className="space-y-3">
              {ROLES.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 animate-fade-in text-left ${
                    role === r.id
                      ? "border-primary/60 bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-border hover:border-primary/30 hover:bg-white/5"
                  }`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={r.icon} size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{r.label}</div>
                    <div className="text-muted-foreground text-xs">{r.desc}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    role === r.id ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {role === r.id && <Icon name="Check" size={11} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!role}
              className={`btn-gradient w-full mt-6 py-3.5 rounded-xl font-semibold text-white text-sm relative z-10 transition-opacity ${!role ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              Войти в WorkChat 🚀
            </button>
          </div>
        )}
      </div>

      <p className="text-muted-foreground/40 text-xs mt-6 text-center">
        Нажимая «Войти», вы соглашаетесь с правилами использования
      </p>
    </div>
  );
}