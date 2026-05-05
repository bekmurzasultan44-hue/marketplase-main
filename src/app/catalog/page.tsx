"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Search, Star, ShoppingCart, SlidersHorizontal,
  X, ChevronDown, Package, Sparkles, ArrowRight, Heart,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Product } from "@/lib/db";
import { LangCtx, Lang, T } from "@/lib/i18n";
import { NexusLogo } from "@/components/NexusLogo";

/* ─── Constants ─── */
const PRICE_RANGES = [
  { labelEn: "Any price",    labelRu: "Любая цена",  min: 0, max: Infinity },
  { labelEn: "< 0.2 ETH",   labelRu: "< 0.2 ETH",  min: 0, max: 0.2 },
  { labelEn: "0.2 – 0.5",   labelRu: "0.2 – 0.5",  min: 0.2, max: 0.5 },
  { labelEn: "0.5 – 1 ETH", labelRu: "0.5 – 1 ETH", min: 0.5, max: 1 },
  { labelEn: "> 1 ETH",     labelRu: "> 1 ETH",     min: 1, max: Infinity },
];

const SORT_OPTIONS = [
  { labelEn: "Newest",    labelRu: "Новые",        value: "newest" },
  { labelEn: "Top Rated", labelRu: "Рейтинг",     value: "rating" },
  { labelEn: "Most Sold", labelRu: "Продажи",     value: "sales" },
  { labelEn: "Price ↑",   labelRu: "Цена ↑",      value: "price_asc" },
  { labelEn: "Price ↓",   labelRu: "Цена ↓",      value: "price_desc" },
];

/* ─── Card ─── */
function ProductCard({
  p, index, onCart, addedId, toggleTag, lang,
}: {
  p: Product; index: number; onCart: (p: Product) => void;
  addedId: string | null; toggleTag: (t: string) => void; lang: Lang;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 8) * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden
                 hover:border-[#FF1493]/25 hover:shadow-[0_0_40px_rgba(255,20,147,0.06)]
                 transition-all duration-500 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={p.image} alt={p.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Price badge */}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md
                     border border-white/10 text-xs font-black"
          style={{ color: p.color }}
        >
          {p.price} {p.currency}
        </div>

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {p.tags.slice(0, 2).map(tag => (
            <button
              key={tag} onClick={() => toggleTag(tag)}
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase hover:opacity-80 transition-opacity"
              style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}35` }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors flex items-center justify-center">
          <Link href={`/checkout/${p.id}`}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300
                       px-5 py-2.5 rounded-full bg-[#FF1493] text-black text-xs font-bold
                       flex items-center gap-2 shadow-[0_0_20px_rgba(255,20,147,0.4)]
                       translate-y-2 group-hover:translate-y-0">
            {lang === "ru" ? "Купить" : "Buy Now"} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[11px] text-white/30 mb-1 font-semibold uppercase tracking-wider">{p.sellerName}</p>
        <h3 className="font-bold text-sm mb-2 line-clamp-1 group-hover:text-[#FF1493] transition-colors">{p.title}</h3>
        <p className="text-xs text-white/30 mb-4 line-clamp-2 flex-1 leading-relaxed">{p.desc}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#FF1493] fill-[#FF1493]" />
            <span className="text-xs font-bold">{Number(p.rating).toFixed(1)}</span>
            <span className="text-[10px] text-white/25">({p.sales})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCart(p)}
              className={`p-2 rounded-xl transition-all ${
                addedId === p.id
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-white/35 hover:text-[#FF1493]"
              }`}
              title={lang === "ru" ? "В корзину" : "Add to cart"}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
            <button className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/35 hover:text-[#FF1493] transition-all">
              <Heart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ lang, onReset }: { lang: Lang; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="col-span-full flex flex-col items-center justify-center py-32 text-center"
    >
      <div className="w-24 h-24 rounded-3xl bg-[#FF1493]/5 border border-[#FF1493]/10
                      flex items-center justify-center mb-8 mx-auto
                      shadow-[0_0_60px_rgba(255,20,147,0.08)]">
        <Package className="w-10 h-10 text-[#FF1493]/40" />
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                      bg-[#FF1493]/5 border border-[#FF1493]/15 mb-6">
        <Sparkles className="w-3.5 h-3.5 text-[#FF1493]" />
        <span className="text-xs font-bold text-[#FF1493] uppercase tracking-widest">
          {lang === "ru" ? "Скоро" : "Coming Soon"}
        </span>
      </div>
      <h2 className="text-3xl md:text-4xl font-black mb-3">
        {lang === "ru" ? "Товары появятся скоро" : "Products coming soon"}
      </h2>
      <p className="text-white/35 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
        {lang === "ru"
          ? "Наши продавцы готовят лучшие товары. Возвращайтесь позже!"
          : "Our sellers are preparing the best products. Check back soon!"}
      </p>
      <button
        onClick={onReset}
        className="px-6 py-3 rounded-full border border-white/10 text-sm font-bold
                   hover:border-[#FF1493]/30 hover:bg-[#FF1493]/5 transition-all"
      >
        {lang === "ru" ? "Сбросить фильтры" : "Reset filters"}
      </button>
    </motion.div>
  );
}

/* ─── Main ─── */
export default function CatalogPage() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>("ru");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get("tag") ?? null);
  const [priceRange, setPriceRange] = useState(0);
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products?status=active")
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = searchParams.get("search");
    const tag = searchParams.get("tag");
    if (q) setSearch(q);
    if (tag) setActiveTag(tag);
  }, [searchParams]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const allTags = Array.from(new Set(products.flatMap(p => p.tags))).filter(Boolean);

  const filtered = products
    .filter(p => {
      const range = PRICE_RANGES[priceRange];
      const matchSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.sellerName.toLowerCase().includes(search.toLowerCase());
      const matchTag = !activeTag || p.tags.includes(activeTag);
      const matchPrice = p.price >= range.min && p.price < range.max;
      return matchSearch && matchTag && matchPrice;
    })
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "sales") return b.sales - a.sales;
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleAddToCart = async (p: Product) => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "u4", productId: p.id, productTitle: p.title, price: p.price, currency: p.currency, image: p.image }),
    });
    setAddedId(p.id);
    window.dispatchEvent(new Event("cart-updated"));
    setTimeout(() => setAddedId(null), 2000);
  };

  const toggleTag = (tag: string) => setActiveTag(prev => prev === tag ? null : tag);
  const resetFilters = () => { setActiveTag(null); setSearch(""); setPriceRange(0); setSort("newest"); };

  const hasActiveFilters = !!activeTag || !!search || priceRange !== 0;

  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <main className="min-h-screen bg-black text-white selection:bg-[#FF1493]/20 pb-24">

        {/* ─── Navbar ─── */}
        <motion.nav
          initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.7 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
            ${scrolled ? "bg-black/70 backdrop-blur-xl border-b border-white/[0.06]" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <NexusLogo size={34} />
                <div className="absolute inset-0 rounded-[10px] ring-1 ring-white/10 group-hover:ring-[#FF1493]/40 transition-all" />
              </div>
              <span className="text-[20px] font-black tracking-[-0.04em] hidden sm:block">
                Play<span className="text-[#FF1493]">Toys</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Lang */}
              <div className="flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/[0.03]">
                {(["en", "ru"] as Lang[]).map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all ${
                      lang === l ? "bg-[#FF1493] text-black" : "text-white/40 hover:text-white"
                    }`}>{l}</button>
                ))}
              </div>
              <Link href="/"
                className="flex items-center gap-2 text-white/45 hover:text-white transition-colors text-sm font-semibold">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:block">{lang === "ru" ? "На главную" : "Home"}</span>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* ─── Header ─── */}
        <div className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className="text-[#FF1493] text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {lang === "ru" ? "Каталог товаров" : "Product Catalog"}
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">
                {lang === "ru" ? "Исследуй" : "Explore"}
              </h1>
              {filtered.length > 0 && (
                <p className="text-white/25 text-sm font-semibold tabular-nums">
                  {filtered.length} {lang === "ru" ? "товаров" : "products"}
                </p>
              )}
            </div>
          </motion.div>

          {/* Search + Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-3 mb-5"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                placeholder={lang === "ru" ? "Поиск по названию, продавцу…" : "Search by title, seller…"}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3.5 pl-11 pr-10
                           focus:outline-none focus:border-[#FF1493]/50 transition-colors text-sm
                           placeholder:text-white/20"
              />
              <AnimatePresence>
                {search && (
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort} onChange={e => setSort(e.target.value)}
                className="appearance-none bg-white/[0.03] border border-white/[0.08] rounded-2xl
                           px-5 py-3.5 pr-10 text-sm font-semibold focus:outline-none
                           focus:border-[#FF1493]/50 transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-[#0a0a0a]">
                    {lang === "ru" ? o.labelRu : o.labelEn}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border transition-all font-semibold text-sm shrink-0 ${
                filtersOpen
                  ? "bg-[#FF1493] text-black border-[#FF1493] shadow-[0_0_20px_rgba(255,20,147,0.3)]"
                  : "bg-white/[0.03] border-white/[0.08] hover:border-[#FF1493]/30 hover:bg-[#FF1493]/5"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {lang === "ru" ? "Фильтры" : "Filters"}
              {priceRange !== 0 && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            </button>
          </motion.div>

          {/* Filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mb-5"
              >
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5
                                flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/30 mb-3">
                      {lang === "ru" ? "Цена" : "Price Range"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_RANGES.map((r, i) => (
                        <button key={i} onClick={() => setPriceRange(i)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            priceRange === i
                              ? "bg-[#FF1493] text-black shadow-[0_0_12px_rgba(255,20,147,0.3)]"
                              : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] border border-white/[0.06]"
                          }`}>
                          {lang === "ru" ? r.labelRu : r.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/30">
                      {lang === "ru" ? "Сброс" : "Reset"}
                    </p>
                    <button onClick={resetFilters}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-white/[0.08]
                                 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20
                                 text-white/40 hover:text-red-400 transition-all">
                      {lang === "ru" ? "Сбросить всё" : "Reset All"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tag chips */}
          {allTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              <button
                onClick={() => setActiveTag(null)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTag === null
                    ? "bg-[#FF1493] text-black shadow-[0_0_16px_rgba(255,20,147,0.3)]"
                    : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] border border-white/[0.06]"
                }`}>
                {lang === "ru" ? "Все" : "All"}
              </button>
              {allTags.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeTag === tag
                      ? "bg-[#FF1493] text-black shadow-[0_0_16px_rgba(255,20,147,0.3)]"
                      : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06] border border-white/[0.06]"
                  }`}>
                  {tag}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* ─── Grid ─── */}
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-12 h-12 border-4 border-white/[0.06] border-t-[#FF1493] rounded-full animate-spin" />
              <p className="text-white/25 text-sm">{lang === "ru" ? "Загрузка…" : "Loading…"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.length === 0 ? (
                <EmptyState lang={lang} onReset={resetFilters} />
              ) : (
                filtered.map((p, i) => (
                  <ProductCard
                    key={p.id} p={p} index={i}
                    onCart={handleAddToCart} addedId={addedId}
                    toggleTag={toggleTag} lang={lang}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </LangCtx.Provider>
  );
}
