import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { UserData } from "./Register";

const ORDERS_URL = "https://functions.poehali.dev/d3d7d327-d5ca-466c-b5f8-939d11d3e55d";

interface Order {
  id: number;
  city: string;
  address: string;
  workersCount: number;
  workDate: string;
  workTime: string;
  description: string;
  rate: number;
  minHours: number;
  contactName: string;
  status: string;
  createdAt: string;
}

interface OrdersProps {
  user: UserData;
  isAdmin: boolean;
  onReply: (message: string) => void;
}

const DATE_OPTIONS = ["Сегодня", "Завтра", "Ближайшее время", "На этой неделе", "Указать дату"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} д назад`;
}

export default function Orders({ user, isAdmin, onReply }: OrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);

  const [form, setForm] = useState({
    city: isAdmin ? "" : user.city,
    address: "",
    workersCount: "1",
    workDate: "Сегодня",
    workDateCustom: "",
    workTime: "",
    description: "",
    rate: "",
    minHours: "2",
    contactName: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const city = isAdmin ? "" : user.city;
      const url = city ? `${ORDERS_URL}?city=${encodeURIComponent(city)}` : ORDERS_URL;
      const res = await fetch(url);
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data.ok) setOrders(data.orders);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user.city, isAdmin]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.city) e.city = "Укажите город";
    if (!form.workDate) e.workDate = "Укажите дату";
    if (form.workDate === "Указать дату" && !form.workDateCustom) e.workDateCustom = "Введите дату";
    if (!form.description.trim()) e.description = "Опишите работу";
    if (!form.rate) e.rate = "Укажите оплату в час";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const finalDate = form.workDate === "Указать дату" ? form.workDateCustom : form.workDate;
      const res = await fetch(ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.city,
          address: form.address,
          workersCount: Number(form.workersCount),
          workDate: finalDate,
          workTime: form.workTime,
          description: form.description,
          rate: Number(form.rate),
          minHours: Number(form.minHours),
          contactName: form.contactName,
        }),
      });
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data.ok) {
        setSuccessId(data.order.id);
        setShowForm(false);
        setForm({ city: isAdmin ? "" : user.city, address: "", workersCount: "1", workDate: "Сегодня", workDateCustom: "", workTime: "", description: "", rate: "", minHours: "2", contactName: "" });
        await loadOrders();
        setTimeout(() => setSuccessId(null), 3000);
      }
    } catch {
      setFormErrors({ description: "Ошибка соединения, попробуйте ещё раз" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Шапка */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0" style={{ background: "rgba(15,25,35,0.8)" }}>
        <div>
          <h2 className="font-bold text-base" style={{ color: "var(--reg-text-primary)" }}>
            {isAdmin ? "Все заявки" : `Заявки · ${user.city}`}
          </h2>
          <p className="text-xs" style={{ color: "var(--reg-text-muted)" }}>
            {isAdmin ? "Управление всеми заявками" : "Только для вашего города"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--reg-text-muted)" }}
          >
            <Icon name="RefreshCw" size={15} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: "var(--reg-btn)" }}
            >
              <Icon name="Plus" size={14} className="text-white" />
              Новая заявка
            </button>
          )}
        </div>
      </div>

      {/* Уведомление об успехе */}
      {successId && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in flex-shrink-0"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
          <Icon name="CheckCircle" size={16} />
          Заявка #{successId} успешно создана и отправлена!
        </div>
      )}

      {/* Список */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Icon name="Loader2" size={28} className="animate-spin" style={{ color: "var(--reg-accent)" }} />
            <p className="text-sm" style={{ color: "var(--reg-text-muted)" }}>Загружаем заявки...</p>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(232,119,46,0.1)" }}>
              <Icon name="ClipboardList" size={30} style={{ color: "var(--reg-accent)" }} />
            </div>
            <p className="font-semibold" style={{ color: "var(--reg-text-primary)" }}>Заявок пока нет</p>
            <p className="text-sm" style={{ color: "var(--reg-text-muted)" }}>
              {isAdmin ? "Создайте первую заявку" : `Ждём заявки для ${user.city}`}
            </p>
          </div>
        )}

        {!loading && orders.map((order, i) => (
          <div
            key={order.id}
            onClick={() => setActiveOrder(order)}
            className="rounded-2xl p-4 cursor-pointer transition-all animate-fade-in"
            style={{
              background: "var(--reg-card)",
              border: "1px solid rgba(255,255,255,0.07)",
              animationDelay: `${i * 0.05}s`,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(232,119,46,0.35)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
          >
            {/* Верх карточки */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(232,119,46,0.15)", color: "var(--reg-accent)" }}>
                  <Icon name="MapPin" size={11} />
                  {order.city}
                </span>
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.06)", color: "var(--reg-text-secondary)" }}>
                  <Icon name="Clock" size={11} />
                  {order.workDate}{order.workTime ? `, ${order.workTime}` : ""}
                </span>
              </div>
              <span className="text-[11px] flex-shrink-0" style={{ color: "var(--reg-text-muted)" }}>
                {timeAgo(order.createdAt)}
              </span>
            </div>

            {/* Описание */}
            <p className="text-sm leading-relaxed mb-3 line-clamp-3" style={{ color: "var(--reg-text-secondary)" }}>
              {order.description}
            </p>

            {/* Адрес */}
            {order.address && (
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="Navigation" size={12} style={{ color: "var(--reg-text-muted)" }} />
                <span className="text-xs" style={{ color: "var(--reg-text-muted)" }}>{order.address}</span>
              </div>
            )}

            {/* Нижняя строка */}
            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-3">
                {/* Человек */}
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(42,109,217,0.2)" }}>
                    <Icon name="Users" size={11} style={{ color: "#60a5fa" }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "var(--reg-text-primary)" }}>
                    {order.workersCount} чел.
                  </span>
                </div>
                {/* Оплата */}
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                    <Icon name="Banknote" size={11} style={{ color: "#4ade80" }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "#4ade80" }}>
                    {order.rate} ₽/ч
                  </span>
                </div>
                {/* Минимум */}
                <span className="text-xs" style={{ color: "var(--reg-text-muted)" }}>
                  мин. {order.minHours}ч
                </span>
              </div>
              {!isAdmin && (
                <button
                  onClick={e => { e.stopPropagation(); setActiveOrder(order); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: "var(--reg-btn)" }}
                >
                  <Icon name="Send" size={11} className="text-white" />
                  Откликнуться
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── МОДАЛКА СОЗДАНИЯ ЗАЯВКИ ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-5 sm:p-7 overflow-y-auto animate-scale-in"
            style={{ background: "var(--reg-card)", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-lg" style={{ color: "var(--reg-text-primary)" }}>Новая заявка</h3>
                <p className="text-xs" style={{ color: "var(--reg-text-muted)" }}>Заявка увидят только жители указанного города</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "var(--reg-text-muted)" }}>
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Город + Кол-во в ряд */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Город *</label>
                  <input
                    placeholder="Ялта"
                    value={form.city}
                    onChange={e => { setForm(f => ({ ...f, city: e.target.value })); setFormErrors(er => ({ ...er, city: "" })); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${formErrors.city ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                  />
                  {formErrors.city && <p className="text-xs mt-1" style={{ color: "var(--reg-error)" }}>{formErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Людей *</label>
                  <input
                    type="number" min="1" max="50"
                    value={form.workersCount}
                    onChange={e => setForm(f => ({ ...f, workersCount: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--reg-input-bg)", border: `1.5px solid var(--reg-input-border)`, color: "var(--reg-text-primary)" }}
                  />
                </div>
              </div>

              {/* Адрес */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Адрес / ориентир</label>
                <input
                  placeholder="Парковый проезд 9а, ориентир Дом книги..."
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--reg-input-bg)", border: `1.5px solid var(--reg-input-border)`, color: "var(--reg-text-primary)" }}
                />
              </div>

              {/* Дата + Время */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Дата *</label>
                  <select
                    value={form.workDate}
                    onChange={e => { setForm(f => ({ ...f, workDate: e.target.value })); setFormErrors(er => ({ ...er, workDate: "" })); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${formErrors.workDate ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                  >
                    {DATE_OPTIONS.map(d => <option key={d} value={d} style={{ background: "#16202e" }}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Время</label>
                  <input
                    placeholder="09:00"
                    value={form.workTime}
                    onChange={e => setForm(f => ({ ...f, workTime: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--reg-input-bg)", border: `1.5px solid var(--reg-input-border)`, color: "var(--reg-text-primary)" }}
                  />
                </div>
              </div>

              {form.workDate === "Указать дату" && (
                <div>
                  <input
                    placeholder="Например: 15 июня"
                    value={form.workDateCustom}
                    onChange={e => { setForm(f => ({ ...f, workDateCustom: e.target.value })); setFormErrors(er => ({ ...er, workDateCustom: "" })); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${formErrors.workDateCustom ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                  />
                  {formErrors.workDateCustom && <p className="text-xs mt-1" style={{ color: "var(--reg-error)" }}>{formErrors.workDateCustom}</p>}
                </div>
              )}

              {/* Описание */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Описание работы *</label>
                <textarea
                  rows={3}
                  placeholder="Фасовать мешки с песком, переносить по участку и высыпать..."
                  value={form.description}
                  onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setFormErrors(er => ({ ...er, description: "" })); }}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${formErrors.description ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                />
                {formErrors.description && <p className="text-xs mt-1" style={{ color: "var(--reg-error)" }}>{formErrors.description}</p>}
              </div>

              {/* Оплата + Минимум */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Оплата ₽/ч *</label>
                  <input
                    type="number" placeholder="500"
                    value={form.rate}
                    onChange={e => { setForm(f => ({ ...f, rate: e.target.value })); setFormErrors(er => ({ ...er, rate: "" })); }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--reg-input-bg)", border: `1.5px solid ${formErrors.rate ? "var(--reg-error)" : "var(--reg-input-border)"}`, color: "var(--reg-text-primary)" }}
                  />
                  {formErrors.rate && <p className="text-xs mt-1" style={{ color: "var(--reg-error)" }}>{formErrors.rate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Мин. часов</label>
                  <select
                    value={form.minHours}
                    onChange={e => setForm(f => ({ ...f, minHours: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--reg-input-bg)", border: `1.5px solid var(--reg-input-border)`, color: "var(--reg-text-primary)" }}
                  >
                    {[1,2,3,4,6,8].map(h => <option key={h} value={h} style={{ background: "#16202e" }}>{h} ч</option>)}
                  </select>
                </div>
              </div>

              {/* Контакт */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Контактное имя</label>
                <input
                  placeholder="Павленко, Вадим..."
                  value={form.contactName}
                  onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--reg-input-bg)", border: `1.5px solid var(--reg-input-border)`, color: "var(--reg-text-primary)" }}
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={submitting}
              className="w-full mt-6 py-3.5 rounded-xl font-bold text-white text-sm transition-all"
              style={{ background: "var(--reg-btn)", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting
                ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={16} className="text-white animate-spin" />Публикуем...</span>
                : <span className="flex items-center justify-center gap-2"><Icon name="Send" size={16} className="text-white" />Опубликовать заявку</span>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── МОДАЛКА ДЕТАЛЕЙ ЗАЯВКИ ── */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setActiveOrder(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-5 sm:p-7 overflow-y-auto animate-scale-in"
            style={{ background: "var(--reg-card)", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(232,119,46,0.15)", color: "var(--reg-accent)" }}>
                <Icon name="MapPin" size={12} />
                {activeOrder.city}
              </span>
              <button onClick={() => setActiveOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "var(--reg-text-muted)" }}>
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.06)", color: "var(--reg-text-secondary)" }}>
                  <Icon name="Clock" size={12} />
                  {activeOrder.workDate}{activeOrder.workTime ? `, ${activeOrder.workTime}` : ""}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80" }}>
                  <Icon name="Banknote" size={12} />
                  {activeOrder.rate} ₽/ч · мин. {activeOrder.minHours}ч
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(42,109,217,0.15)", color: "#60a5fa" }}>
                  <Icon name="Users" size={12} />
                  {activeOrder.workersCount} чел.
                </div>
              </div>

              {activeOrder.address && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <Icon name="Navigation" size={14} style={{ color: "var(--reg-accent)", flexShrink: 0, marginTop: 1 }} />
                  <span className="text-sm" style={{ color: "var(--reg-text-secondary)" }}>{activeOrder.address}</span>
                </div>
              )}

              <div className="px-3 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                <p className="text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--reg-label)" }}>Описание работы</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--reg-text-secondary)" }}>{activeOrder.description}</p>
              </div>

              {activeOrder.contactName && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <Icon name="User" size={14} style={{ color: "var(--reg-accent)" }} />
                  <span className="text-sm" style={{ color: "var(--reg-text-secondary)" }}>{activeOrder.contactName}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #4ade80" }} />
                <span className="text-xs" style={{ color: "var(--reg-text-muted)" }}>
                  Минимальный заработок: <strong style={{ color: "#4ade80" }}>{activeOrder.rate * activeOrder.minHours} ₽</strong> на человека
                </span>
              </div>
            </div>

            {!isAdmin && (
              <button
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm"
                style={{ background: "var(--reg-btn)" }}
                onClick={() => {
                  const msg = `Откликаюсь на заявку #${activeOrder.id} · ${activeOrder.city}${activeOrder.workDate ? ` · ${activeOrder.workDate}` : ""}${activeOrder.workTime ? `, ${activeOrder.workTime}` : ""}: ${activeOrder.description.slice(0, 80)}${activeOrder.description.length > 80 ? "..." : ""}`;
                  setActiveOrder(null);
                  onReply(msg);
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon name="MessageCircle" size={16} className="text-white" />
                  Написать в личку
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}