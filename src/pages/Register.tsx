import { useState } from "react";
import Icon from "@/components/ui/icon";

interface RegisterProps {
  onRegister: (user: UserData, phone: string) => void;
}

export interface UserData {
  firstName: string;
  lastName: string;
  city: string;
  age: number;
  role: "superadmin" | "admin" | "moderator" | "user";
}

const CITIES = [
  // Крым
  "Симферополь", "Севастополь", "Керчь", "Евпатория", "Ялта",
  "Феодосия", "Джанкой", "Саки", "Красноперекопск", "Армянск",
  "Алушта", "Судак", "Старый Крым", "Бахчисарай", "Белогорск",
  "Инкерман", "Щёлкино", "Черноморское", "Раздольное", "Ленино",
  // Центральная Россия
  "Москва", "Санкт-Петербург", "Воронеж", "Липецк", "Тамбов",
  "Рязань", "Тула", "Калуга", "Орёл", "Курск", "Белгород",
  "Брянск", "Смоленск", "Тверь", "Ярославль", "Кострома",
  "Иваново", "Владимир", "Нижний Новгород", "Пенза", "Саратов",
  // Юг
  "Краснодар", "Ростов-на-Дону", "Волгоград", "Астрахань", "Ставрополь",
  "Сочи", "Новороссийск", "Армавир", "Майкоп", "Элиста",
  // Поволжье и Урал
  "Казань", "Уфа", "Самара", "Тольятти", "Ульяновск", "Саранск",
  "Чебоксары", "Йошкар-Ола", "Киров", "Пермь", "Екатеринбург",
  "Челябинск", "Магнитогорск", "Тюмень", "Курган", "Оренбург",
  // Сибирь и Дальний Восток
  "Новосибирск", "Омск", "Томск", "Кемерово", "Новокузнецк",
  "Барнаул", "Красноярск", "Иркутск", "Улан-Удэ", "Чита",
  "Якутск", "Хабаровск", "Владивосток", "Благовещенск", "Южно-Сахалинск",
  // Северо-Запад
  "Мурманск", "Архангельск", "Петрозаводск", "Вологда", "Псков",
  "Великий Новгород", "Калининград", "Сыктывкар", "Нарьян-Мар",
].sort();

const FIELD_META = [
  { key: "firstName", label: "Имя", placeholder: "Иван", icon: "User", type: "text" },
  { key: "lastName",  label: "Фамилия", placeholder: "Иванов", icon: "User", type: "text" },
  { key: "city",      label: "Город", placeholder: "Начните вводить...", icon: "MapPin", type: "city" },
  { key: "age",       label: "Возраст", placeholder: "От 20 лет", icon: "Calendar", type: "number" },
] as const;

const REGISTER_URL = "https://functions.poehali.dev/91618013-f9f0-4eae-bfb5-15eda3e30c7a";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  let d = digits;
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  let out = "+7";
  if (d.length > 1) out += " (" + d.slice(1, 4);
  if (d.length >= 4) out += ") " + d.slice(4, 7);
  if (d.length >= 7) out += "-" + d.slice(7, 9);
  if (d.length >= 9) out += "-" + d.slice(9, 11);
  return out;
}

function toE164(formatted: string): string {
  const digits = formatted.replace(/\D/g, "");
  return "+" + (digits.startsWith("7") ? digits : "7" + digits);
}

export default function Register({ onRegister }: RegisterProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ firstName: "", lastName: "", city: "", age: "", phone: "", password: "", showPassword: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [citySearch, setCitySearch] = useState("");
  const [showCities, setShowCities] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredCities = CITIES.filter(c =>
    c.toLowerCase().includes((citySearch || form.city).toLowerCase())
  ).slice(0, 8);

  const setField = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
  };

  const validateLogin = () => {
    const e: Record<string, string> = {};
    const digits = form.phone.replace(/\D/g, "");
    if (!form.phone) e.phone = "Введите номер телефона";
    else if (digits.length < 11) e.phone = "Введите полный номер";
    if (!form.password) e.password = "Введите пароль";
    else if (form.password.length < 6) e.password = "Минимум 6 символов";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Введите имя";
    if (!form.lastName.trim()) e.lastName = "Введите фамилию";
    if (!form.city) e.city = "Выберите город из списка";
    if (!form.age) e.age = "Введите возраст";
    else if (Number(form.age) < 20) { setBlocked(true); return false; }
    else if (Number(form.age) > 80) e.age = "Введите корректный возраст";
    const digits = form.phone.replace(/\D/g, "");
    if (!form.phone) e.phone = "Введите номер телефона";
    else if (digits.length < 11) e.phone = "Введите полный номер";
    if (!form.password) e.password = "Введите пароль";
    else if (form.password.length < 6) e.password = "Минимум 6 символов";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    const ok = mode === "login" ? validateLogin() : validateRegister();
    if (!ok) return;
    setLoading(true);
    try {
      const payload = mode === "login"
        ? { action: "login", phone: toE164(form.phone), password: form.password }
        : { action: "register", firstName: form.firstName.trim(), lastName: form.lastName.trim(), city: form.city, age: Number(form.age), phone: toE164(form.phone), password: form.password };

      const res = await fetch(REGISTER_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed.ok) {
        onRegister(
          { firstName: parsed.user.firstName, lastName: parsed.user.lastName, city: parsed.user.city, age: parsed.user.age, role: "user" },
          parsed.user.phone
        );
      } else if (parsed.errors) {
        setErrors(parsed.errors);
      }
    } catch {
      setErrors({ password: "Ошибка соединения, попробуйте ещё раз" });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setErrors({});
    setForm({ firstName: "", lastName: "", city: "", age: "", phone: "", password: "", showPassword: false });
  };

  if (blocked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-5" style={{ background: "var(--reg-bg)" }}>
        <div className="w-full max-w-sm text-center animate-scale-in">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(240,107,107,0.12)", border: "2px solid rgba(240,107,107,0.3)" }}>
            <Icon name="ShieldX" size={36} style={{ color: "var(--reg-error)" }} />
          </div>
          <h2 className="font-display font-black text-2xl mb-3" style={{ color: "var(--reg-text-primary)" }}>
            Доступ закрыт
          </h2>
          <p className="text-base mb-2" style={{ color: "var(--reg-text-secondary)" }}>
            Регистрация доступна только для сотрудников <strong style={{ color: "var(--reg-text-primary)" }}>от 20 лет.</strong>
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--reg-text-muted)" }}>
            Если вы считаете, что произошла ошибка — обратитесь к руководителю.
          </p>
          <button
            onClick={() => { setBlocked(false); setForm(f => ({ ...f, age: "" })); }}
            className="px-8 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: "var(--reg-btn)", color: "#fff" }}
          >
            ← Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-stretch relative overflow-hidden" style={{ background: "var(--reg-bg)" }}>

      {/* ── Левая декоративная панель (только desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] relative overflow-hidden p-12" style={{ background: "var(--reg-panel)" }}>
        {/* Декор-круги */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10" style={{ background: "var(--reg-accent)" }} />
        <div className="absolute bottom-10 right-[-60px] w-96 h-96 rounded-full opacity-[0.07]" style={{ background: "var(--reg-accent2)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-[0.06]" style={{ background: "var(--reg-accent)" }} />

        {/* Логотип */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--reg-accent)" }}>
              <Icon name="Truck" size={22} className="text-white" />
            </div>
            <div>
              <div className="font-display font-black text-xl tracking-tight" style={{ color: "var(--reg-text-primary)" }}>Gruz<span style={{ color: "var(--reg-accent)" }}> off</span></div>
              <div className="text-xs font-medium" style={{ color: "var(--reg-text-muted)" }}>Связь, которая не подводит</div>
            </div>
          </div>

          <h2 className="font-display font-black text-4xl leading-tight mb-5" style={{ color: "var(--reg-text-primary)" }}>
            Вся команда<br />
            <span style={{ color: "var(--reg-accent)" }}>на связи</span><br />
            24/7
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "var(--reg-text-muted)" }}>
            Никаких потерянных задач и пропущенных звонков. Общайтесь с бригадой мгновенно — где бы вы ни были.
          </p>
        </div>

        {/* Плашки-фичи */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: "MessageCircle", text: "Личные и групповые чаты" },
            { icon: "Users", text: "Каталог контактов компании" },
            { icon: "Bell", text: "Мгновенные уведомления" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "var(--reg-feature-bg)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--reg-accent-soft)" }}>
                <Icon name={f.icon} size={15} style={{ color: "var(--reg-accent)" }} />
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--reg-text-secondary)" }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Правая панель — форма ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-10 relative z-10">

        {/* Логотип (только мобайл) */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8 animate-fade-in">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--reg-accent)" }}>
            <Icon name="Truck" size={19} className="text-white" />
          </div>
          <div>
            <div className="font-display font-black text-lg tracking-tight" style={{ color: "var(--reg-text-primary)" }}>
              Gruz<span style={{ color: "var(--reg-accent)" }}> off</span>
            </div>
            <div className="text-[11px]" style={{ color: "var(--reg-text-muted)" }}>Связь, которая не подводит</div>
          </div>
        </div>

        {/* Карточка */}
        <div
          className="w-full max-w-[420px] rounded-2xl p-7 sm:p-9 animate-fade-in delay-100"
          style={{ background: "var(--reg-card)", border: "1px solid var(--reg-card-border)", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
        >
          {/* Переключатель вход / регистрация */}
          <div className="flex mb-7 p-1 rounded-xl" style={{ background: "var(--reg-input-bg)" }}>
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
                style={mode === m
                  ? { background: "var(--reg-accent)", color: "#fff", boxShadow: "0 4px 12px rgba(232,119,46,0.35)" }
                  : { color: "var(--reg-text-muted)" }
                }
              >
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          <div className="space-y-4">

            {/* ── ПОЛЯ ТОЛЬКО ДЛЯ РЕГИСТРАЦИИ ── */}
            {mode === "register" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Имя</label>
                    <div className="relative">
                      <Icon name="User" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--reg-icon)" }} />
                      <input type="text" placeholder="Иван" value={form.firstName}
                        onChange={e => setField("firstName", e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                        style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${errors.firstName ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                        onFocus={e => { if (!errors.firstName) e.currentTarget.style.borderColor = "var(--reg-accent)"; }}
                        onBlur={e => { if (!errors.firstName) e.currentTarget.style.borderColor = "var(--reg-input-border)"; }}
                      />
                    </div>
                    {errors.firstName && <p className="text-xs mt-1" style={{ color: "var(--reg-error)" }}>{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Фамилия</label>
                    <div className="relative">
                      <Icon name="User" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--reg-icon)" }} />
                      <input type="text" placeholder="Иванов" value={form.lastName}
                        onChange={e => setField("lastName", e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                        style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${errors.lastName ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                        onFocus={e => { if (!errors.lastName) e.currentTarget.style.borderColor = "var(--reg-accent)"; }}
                        onBlur={e => { if (!errors.lastName) e.currentTarget.style.borderColor = "var(--reg-input-border)"; }}
                      />
                    </div>
                    {errors.lastName && <p className="text-xs mt-1" style={{ color: "var(--reg-error)" }}>{errors.lastName}</p>}
                  </div>
                </div>

                {/* Город */}
                <div className="relative">
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Город</label>
                  <div className="relative">
                    <Icon name="MapPin" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10" style={{ color: "var(--reg-icon)" }} />
                    <input type="text" placeholder="Начните вводить город..."
                      value={showCities ? citySearch : form.city}
                      onFocus={() => { setShowCities(true); setCitySearch(""); }}
                      onChange={e => { setCitySearch(e.target.value); setForm(f => ({ ...f, city: "" })); setErrors(er => ({ ...er, city: "" })); }}
                      onBlur={() => setTimeout(() => setShowCities(false), 150)}
                      className="w-full pl-9 pr-9 py-3 rounded-xl text-sm outline-none"
                      style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${errors.city ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                      onFocusCapture={e => { if (!errors.city) e.currentTarget.style.borderColor = "var(--reg-accent)"; }}
                    />
                    <Icon name="ChevronDown" size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--reg-icon)" }} />
                  </div>
                  {errors.city && <p className="text-xs mt-1" style={{ color: "var(--reg-error)" }}>{errors.city}</p>}
                  {showCities && filteredCities.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl overflow-hidden shadow-2xl" style={{ background: "var(--reg-dropdown-bg)", border: "1px solid var(--reg-dropdown-border)", maxHeight: "200px", overflowY: "auto" }}>
                      {filteredCities.map(city => (
                        <button key={city} type="button"
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left"
                          style={{ color: "var(--reg-text-secondary)" }}
                          onMouseDown={() => { setForm(f => ({ ...f, city })); setCitySearch(""); setShowCities(false); setErrors(er => ({ ...er, city: "" })); }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--reg-dropdown-hover)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                        >
                          <Icon name="MapPin" size={13} style={{ color: "var(--reg-accent)", flexShrink: 0 }} />{city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Возраст */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Возраст</label>
                  <div className="relative">
                    <Icon name="Calendar" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--reg-icon)" }} />
                    <input type="number" placeholder="Введите возраст" min={20} max={80} value={form.age}
                      onChange={e => setField("age", e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${errors.age ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                      onFocus={e => { if (!errors.age) e.currentTarget.style.borderColor = "var(--reg-accent)"; }}
                      onBlur={e => { if (!errors.age) e.currentTarget.style.borderColor = "var(--reg-input-border)"; }}
                    />
                  </div>
                  {errors.age && <p className="text-xs mt-1" style={{ color: "var(--reg-error)" }}>{errors.age}</p>}
                </div>
              </>
            )}

            {/* Телефон — общее поле */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Номер телефона</label>
              <div className="relative">
                <Icon name="Phone" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--reg-icon)" }} />
                <input type="tel" placeholder="+7 (___) ___-__-__" value={form.phone}
                  onChange={e => setField("phone", formatPhone(e.target.value))}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${errors.phone ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                  onFocus={e => { if (!errors.phone) e.currentTarget.style.borderColor = "var(--reg-accent)"; }}
                  onBlur={e => { if (!errors.phone) e.currentTarget.style.borderColor = "var(--reg-input-border)"; }}
                />
              </div>
              {errors.phone && <p className="text-xs mt-1" style={{ color: "var(--reg-error)" }}>{errors.phone}</p>}
            </div>

            {/* Пароль — общее поле */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Пароль</label>
              <div className="relative">
                <Icon name="Lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--reg-icon)" }} />
                <input
                  type={form.showPassword ? "text" : "password"}
                  placeholder={mode === "register" ? "Минимум 6 символов" : "Введите пароль"}
                  value={form.password}
                  onChange={e => setField("password", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${errors.password ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                  onFocus={e => { if (!errors.password) e.currentTarget.style.borderColor = "var(--reg-accent)"; }}
                  onBlur={e => { if (!errors.password) e.currentTarget.style.borderColor = "var(--reg-input-border)"; }}
                />
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, showPassword: !f.showPassword }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--reg-icon)" }}>
                  <Icon name={form.showPassword ? "EyeOff" : "Eye"} size={15} />
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: "var(--reg-error)" }}>{errors.password}</p>}
              {mode === "register" && !errors.password && (
                <p className="text-xs mt-1" style={{ color: "var(--reg-text-muted)" }}>Запомните пароль — он нужен для входа</p>
              )}
            </div>
          </div>

          {/* Кнопка */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 relative overflow-hidden"
            style={{ background: "var(--reg-btn)", color: "#fff", opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            onMouseDown={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
            onMouseUp={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading
                ? <><Icon name="Loader2" size={16} className="text-white animate-spin" />{mode === "login" ? "Проверяем..." : "Сохраняем..."}</>
                : mode === "login"
                  ? <><Icon name="LogIn" size={16} className="text-white" />Войти в Gruz off</>
                  : <><Icon name="UserPlus" size={16} className="text-white" />Зарегистрироваться</>
              }
            </span>
          </button>

          <p className="text-center text-xs mt-5" style={{ color: "var(--reg-text-muted)" }}>
            Нажимая кнопку, вы принимаете правила использования сервиса
          </p>
        </div>
      </div>
    </div>
  );
}