"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Check, ChevronRight, Star, Package, TrendingUp } from "lucide-react";
import { NexusLogo } from "@/components/NexusLogo";

const PERKS = [
  { icon: TrendingUp, title: "Тысячи покупателей", titleEn: "Thousands of buyers", desc: "Доступ к глобальной аудитории коллекционеров и дизайнеров.", descEn: "Reach a global audience of collectors and designers." },
  { icon: Star, title: "Честные выплаты", titleEn: "Fair payouts", desc: "До 85% с каждой продажи — прозрачная система без скрытых комиссий.", descEn: "Up to 85% per sale — transparent with no hidden fees." },
  { icon: Package, title: "Мгновенная публикация", titleEn: "Instant publishing", desc: "Загружайте и публикуйте свои товары в несколько кликов.", descEn: "Upload and publish your products in just a few clicks." },
];

export default function BecomeSellerPage() {
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [step, setStep] = useState<"info" | "form" | "success">("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    bio: "",
    storeName: "",
    phone: "",
    city: "",
    category: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.specialty) {
      setError(lang === "ru" ? "Заполните все обязательные поля" : "Please fill all required fields");
      return;
    }
    if (form.password.length < 6) {
      setError(lang === "ru" ? "Пароль должен быть не менее 6 символов" : "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: "seller",
          specialty: form.specialty,
          bio: form.bio,
          storeName: form.storeName,
          phone: form.phone,
          city: form.city,
          category: form.category,
          avatar: `https://picsum.photos/seed/${form.name}/200/200`,
          sales: 0,
          rating: 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || (lang === "ru" ? "Ошибка регистрации" : "Registration error"));
        setLoading(false);
        return;
      }
      setStep("success");
    } catch {
      setError(lang === "ru" ? "Произошла ошибка, попробуйте снова" : "An error occurred, please try again");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#ff8040]/30">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff8040]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 md:px-12 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <NexusLogo size={36} />
            <div className="absolute inset-0 rounded-[10px] ring-1 ring-white/10 group-hover:ring-[#ff8040]/40 transition-all" />
          </div>
          <span className="text-[22px] font-black tracking-[-0.04em]">NEX<span className="text-[#ff8040]">US</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setLang(lang === "en" ? "ru" : "en")} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase transition-colors">{lang}</button>
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> {lang === "ru" ? "Главная" : "Home"}
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">

        {/* ── INFO STEP ── */}
        {step === "info" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff8040]/10 border border-[#ff8040]/20 text-[#ff8040] text-xs font-bold uppercase tracking-wider mb-8">
                <div className="w-2 h-2 rounded-full bg-[#ff8040] animate-pulse" />
                {lang === "ru" ? "Стать продавцом" : "Become a Seller"}
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-[0.9] mb-6">
                {lang === "ru" ? (
                  <>Создавай.<br /><span className="text-[#ff8040]">Продавай.</span><br />Зарабатывай.</>
                ) : (
                  <>Create.<br /><span className="text-[#ff8040]">Sell.</span><br />Earn.</>
                )}
              </h1>
              <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-md">
                {lang === "ru"
                  ? "Присоединяйтесь к тысячам цифровых авторов, которые монетизируют свой талант на NEXUS."
                  : "Join thousands of digital creators monetizing their talent on NEXUS."}
              </p>
              <div className="flex flex-col gap-4 mb-10">
                {PERKS.map((perk, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#ff8040]/20 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[#ff8040]/10 flex items-center justify-center shrink-0 group-hover:bg-[#ff8040]/20 transition-colors">
                      <perk.icon className="w-5 h-5 text-[#ff8040]" />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-1">{lang === "ru" ? perk.title : perk.titleEn}</p>
                      <p className="text-xs text-white/40 leading-relaxed">{lang === "ru" ? perk.desc : perk.descEn}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep("form")}
                className="group flex items-center gap-3 px-8 py-4 rounded-full bg-[#ff8040] text-black font-bold hover:bg-[#ff9060] transition-all hover:shadow-[0_0_40px_rgba(255,128,64,0.4)]"
              >
                {lang === "ru" ? "Начать регистрацию" : "Start Registration"}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right — Stats card */}
            <div className="hidden lg:block">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl">
                <p className="text-white/30 text-sm font-semibold mb-8">{lang === "ru" ? "Наши продавцы зарабатывают" : "Our sellers earn"}</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { v: "85%", l: lang === "ru" ? "Комиссия продавца" : "Seller commission" },
                    { v: "12K+", l: lang === "ru" ? "Активных покупателей" : "Active buyers" },
                    { v: "3.2K", l: lang === "ru" ? "Продавцов на платформе" : "Sellers on platform" },
                    { v: "$2M+", l: lang === "ru" ? "Объём выплат" : "Total payouts" },
                  ].map((s, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="text-3xl font-black text-[#ff8040] mb-1">{s.v}</div>
                      <div className="text-xs text-white/30">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="flex -space-x-3">
                  {["av1", "av2", "av3", "av4", "av5"].map(seed => (
                    <img key={seed} src={`https://picsum.photos/seed/${seed}/40/40`} className="w-10 h-10 rounded-full border-2 border-black object-cover" />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-[#ff8040]/20 border-2 border-black flex items-center justify-center text-[10px] font-bold text-[#ff8040]">+3K</div>
                </div>
                <p className="text-white/30 text-xs mt-3">{lang === "ru" ? "Уже продают на NEXUS" : "Already selling on NEXUS"}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── FORM STEP ── */}
        {step === "form" && (
          <div className="max-w-lg mx-auto">
            <button onClick={() => setStep("info")} className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-semibold mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> {lang === "ru" ? "Назад" : "Back"}
            </button>
            <h2 className="text-4xl font-black mb-2">{lang === "ru" ? "Регистрация продавца" : "Seller Registration"}</h2>
            <p className="text-white/40 mb-8">{lang === "ru" ? "Заполните данные для создания аккаунта продавца" : "Fill in the details to create your seller account"}</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2 block">{lang === "ru" ? "Имя / Псевдоним *" : "Name / Alias *"}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder={lang === "ru" ? "CosmicForge" : "CosmicForge"}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2 block">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="creator@example.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2 block">{lang === "ru" ? "Пароль *" : "Password *"}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2 block">{lang === "ru" ? "Специализация *" : "Specialty *"}</label>
                <select
                  value={form.specialty}
                  onChange={e => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="" className="bg-[#111]">{lang === "ru" ? "Выберите специализацию" : "Select specialty"}</option>
                  {["3D & Motion", "UI & Design", "Shaders & VFX", "Texture & Materials", "Music & Audio", "Photography", "Illustrations", "Other"].map(s => (
                    <option key={s} value={s} className="bg-[#111]">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2 block">{lang === "ru" ? "О себе (необязательно)" : "About you (optional)"}</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  placeholder={lang === "ru" ? "Расскажите немного о своём стиле и опыте..." : "Tell us a bit about your style and experience..."}
                  rows={3}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
  <label className="text-xs text-white/40 mb-2 block">Название магазина</label>
  <input
    type="text"
    value={form.storeName}
    onChange={(e) => setForm({ ...form, storeName: e.target.value })}
    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10"
  />
</div>

<div>
  <label className="text-xs text-white/40 mb-2 block">Телефон</label>
  <input
    type="text"
    value={form.phone}
    onChange={(e) => setForm({ ...form, phone: e.target.value })}
    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10"
  />
</div>

<div>
  <label className="text-xs text-white/40 mb-2 block">Город</label>
  <input
    type="text"
    value={form.city}
    onChange={(e) => setForm({ ...form, city: e.target.value })}
    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10"
  />
</div>

<div>
  <label className="text-xs text-white/40 mb-2 block">Категория</label>
  <input
    type="text"
    value={form.category}
    onChange={(e) => setForm({ ...form, category: e.target.value })}
    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10"
  />
</div>
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#ff8040] text-black font-bold text-base hover:bg-[#ff9060] transition-all hover:shadow-[0_0_30px_rgba(255,128,64,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (lang === "ru" ? "Создаём аккаунт..." : "Creating account...") : (lang === "ru" ? "Создать аккаунт продавца" : "Create Seller Account")}
              </button>

              <p className="text-center text-xs text-white/30">
                {lang === "ru" ? "Уже есть аккаунт?" : "Already have an account?"}{" "}
                <Link href="/dashboard" className="text-[#ff8040] hover:underline font-semibold">
                  {lang === "ru" ? "Войти" : "Sign in"}
                </Link>
              </p>
            </form>
          </div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === "success" && (
          <div className="max-w-lg mx-auto text-center py-20">
            <div className="w-24 h-24 rounded-full bg-[#ff8040]/10 border-2 border-[#ff8040]/30 flex items-center justify-center mx-auto mb-8">
              <Check className="w-12 h-12 text-[#ff8040]" />
            </div>
            <h2 className="text-4xl font-black mb-4">{lang === "ru" ? "Добро пожаловать!" : "Welcome aboard!"}</h2>
            <p className="text-white/50 text-lg mb-8">
              {lang === "ru"
                ? `Аккаунт продавца «${form.name}» успешно создан. Войдите в панель управления, чтобы начать добавлять товары.`
                : `Seller account «${form.name}» was created successfully. Sign in to the dashboard to start adding products.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="px-8 py-4 rounded-full bg-[#ff8040] text-black font-bold hover:bg-[#ff9060] transition-all hover:shadow-[0_0_30px_rgba(255,128,64,0.4)]">
                {lang === "ru" ? "Перейти в Dashboard" : "Go to Dashboard"}
              </Link>
              <Link href="/" className="px-8 py-4 rounded-full border border-white/10 font-bold hover:bg-white/5 transition-colors">
                {lang === "ru" ? "На главную" : "Go Home"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
