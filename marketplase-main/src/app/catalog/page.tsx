"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Sparkles, Star, ShoppingCart, SlidersHorizontal, X, ChevronDown, TrendingUp } from "lucide-react";
import { Product } from "@/lib/db";
import { LangCtx, Lang, T } from "@/lib/i18n";
import { NexusLogo } from "@/components/NexusLogo";

const PRICE_RANGES = [
  { label: "Any", min: 0, max: Infinity },
  { label: "< 0.2 ETH", min: 0, max: 0.2 },
  { label: "0.2 – 0.5 ETH", min: 0.2, max: 0.5 },
  { label: "0.5 – 1 ETH", min: 0.5, max: 1 },
  { label: "> 1 ETH", min: 1, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Top Rated", value: "rating" },
  { label: "Most Sold", value: "sales" },
  { label: "Price ↑", value: "price_asc" },
  { label: "Price ↓", value: "price_desc" },
];

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("ru");
  const t = T[lang];
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get("tag") ?? null);
  const [priceRange, setPriceRange] = useState(0);
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products?status=active")
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); });
  }, []);

  // Sync search param from URL
  useEffect(() => {
    const q = searchParams.get("search");
    const tag = searchParams.get("tag");
    if (q) setSearch(q);
    if (tag) setActiveTag(tag);
  }, [searchParams]);

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
      body: JSON.stringify({ userId: "u4", productId: p.id, productTitle: p.title, price: p.price, currency: p.currency, image: p.image })
    });
    setAddedId(p.id);
    window.dispatchEvent(new Event("cart-updated"));
    setTimeout(() => setAddedId(null), 2000);
  };

  const toggleTag = (tag: string) => {
    setActiveTag(prev => prev === tag ? null : tag);
  };

  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <main className="min-h-screen bg-black text-white selection:bg-[#ff8040]/30 pb-24">

        {/* Sticky Navbar */}
        <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 md:px-12 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <NexusLogo size={32} />
              <div className="absolute inset-0 rounded-[9px] ring-1 ring-white/10 group-hover:ring-[#ff8040]/40 transition-all" />
            </div>
            <span className="text-[20px] font-black tracking-[-0.04em] hidden sm:block">NEX<span className="text-[#ff8040]">US</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setLang(lang === "en" ? "ru" : "en")} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase transition-colors">{lang}</button>
            <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> {lang === "ru" ? "На главную" : "Back"}
            </Link>
          </div>
        </nav>

        {/* Header */}
        <div className="pt-16 pb-10 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[#ff8040] text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> {lang === "ru" ? "Каталог активов" : "Asset Catalog"}
              </p>
              <h1 className="text-4xl md:text-6xl font-black">{lang === "ru" ? "Исследуй" : "Explore"}</h1>
            </div>
            {filtered.length > 0 && (
              <p className="text-white/30 text-sm font-semibold">
                {filtered.length} {lang === "ru" ? "товаров" : "products"}
              </p>
            )}
          </div>

          {/* Search + Filter Row */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder={lang === "ru" ? "Поиск по названию, автору..." : "Search by title, creator..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#ff8040] transition-colors text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="appearance-none bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 pr-10 text-sm font-semibold focus:outline-none focus:border-[#ff8040] transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border transition-colors font-semibold text-sm shrink-0 ${filtersOpen ? "bg-[#ff8040] text-black border-[#ff8040]" : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {lang === "ru" ? "Фильтры" : "Filters"}
              {priceRange !== 0 && <span className="w-2 h-2 rounded-full bg-current" />}
            </button>
          </div>

          {/* Expandable Filter Panel */}
          {filtersOpen && (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">{lang === "ru" ? "Цена" : "Price Range"}</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setPriceRange(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${priceRange === i ? "bg-[#ff8040] text-black" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">{lang === "ru" ? "Действия" : "Actions"}</p>
                <button
                  onClick={() => { setPriceRange(0); setActiveTag(null); setSearch(""); setSort("newest"); }}
                  className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400 text-xs font-bold transition-colors border border-white/10 hover:border-red-500/20"
                >
                  {lang === "ru" ? "Сбросить" : "Reset All"}
                </button>
              </div>
            </div>
          )}

          {/* Tag Chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTag === null ? "bg-[#ff8040] text-black shadow-[0_0_16px_rgba(255,128,64,0.3)]" : "bg-white/[0.04] text-white/50 hover:bg-white/10 border border-white/10"}`}
            >
              {lang === "ru" ? "Все" : "All"}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTag === tag ? "bg-[#ff8040] text-black shadow-[0_0_16px_rgba(255,128,64,0.3)]" : "bg-white/[0.04] text-white/50 hover:bg-white/10 border border-white/10"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-white/10 border-t-[#ff8040] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl">
              <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-lg font-semibold">{lang === "ru" ? "Ничего не найдено" : "No products found"}</p>
              <button onClick={() => { setActiveTag(null); setSearch(""); setPriceRange(0); }} className="mt-4 text-[#ff8040] text-sm font-bold hover:underline">
                {lang === "ru" ? "Сбросить фильтры" : "Reset filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(p => (
                <div key={p.id} className="group rounded-3xl bg-white/[0.02] border border-white/[0.06] overflow-hidden hover:border-[#ff8040]/30 hover:shadow-[0_0_40px_rgba(255,128,64,0.06)] transition-all flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur border border-white/10 text-xs font-black" style={{ color: p.color }}>
                      {p.price} {p.currency}
                    </div>
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {p.tags.slice(0, 2).map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ background: `${p.color}25`, color: p.color, border: `1px solid ${p.color}40` }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-xs text-white/30 mb-1 font-semibold">{p.sellerName}</p>
                    <h3 className="font-bold text-base mb-2 line-clamp-1">{p.title}</h3>
                    <p className="text-xs text-white/35 mb-4 line-clamp-2 flex-1">{p.desc}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-[#ff8040] fill-[#ff8040]" />
                        <span className="text-xs font-bold">{Number(p.rating).toFixed(1)}</span>
                        <span className="text-[10px] text-white/25">({p.sales})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddToCart(p)}
                          className={`p-2 rounded-lg transition-all ${addedId === p.id ? "bg-green-500/20 text-green-400" : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-[#ff8040]"}`}
                          title={lang === "ru" ? "В корзину" : "Add to cart"}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                        <Link href={`/checkout/${p.id}`} className="px-4 py-2 rounded-lg bg-[#ff8040]/10 hover:bg-[#ff8040] hover:text-black text-xs font-bold transition-all text-[#ff8040] border border-[#ff8040]/20">
                          {lang === "ru" ? "Купить" : "Buy"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </LangCtx.Provider>
  );
}
