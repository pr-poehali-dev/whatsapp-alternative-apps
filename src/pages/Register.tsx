import { useState } from "react";
import Icon from "@/components/ui/icon";

interface RegisterProps {
  onRegister: (user: UserData) => void;
}

export interface UserData {
  firstName: string;
  lastName: string;
  city: string;
  age: number;
  role: "superadmin" | "admin" | "moderator" | "user";
}

const CITIES = [
  "Симферополь", "Севастополь", "Керчь", "Евпатория", "Ялта",
  "Феодосия", "Джанкой", "Саки", "Красноперекопск", "Армянск",
  "Алушта", "Судак", "Старый Крым", "Бахчисарай", "Белогорск",
  "Инкерман", "Щёлкино", "Октябрьское", "Нижнегорский", "Советский",
  "Черноморское", "Раздольное", "Кировское", "Ленино", "Первомайское",
];

export default function Register({ onRegister }: RegisterProps) {
  const [form, setForm] = useState({ firstName: "", lastName: "", city: "", age: "" });
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

  const handleSubmit = () => {
    if (!validate()) return;
    onRegister({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      city: form.city,
      age: Number(form.age),
      role: "user",
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

      {/* Карточка формы */}
      <div className="w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 relative animate-fade-in delay-100">
        <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-1">Регистрация</h2>
            <p className="text-muted-foreground text-sm mb-6">Заполните данные для входа</p>

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
              onClick={handleSubmit}
              className="btn-gradient w-full mt-6 py-3.5 rounded-xl font-semibold text-white text-sm relative z-10"
            >
              Войти в WorkChat 🚀
            </button>
          </div>
      </div>

      <p className="text-muted-foreground/40 text-xs mt-6 text-center">
        Нажимая «Войти», вы соглашаетесь с правилами использования
      </p>
    </div>
  );
}