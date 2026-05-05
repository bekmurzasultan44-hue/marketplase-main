"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { NexusLogo, NexusWordmark } from "@/components/NexusLogo";
import {
  ArrowRight, Search, ShoppingCart, Menu, X, Star, ChevronRight,
  Mail, Globe, Sparkles, Zap, Heart, Package, Palette,
  Code2, Layers, PenTool, Music, Camera, Box, Instagram, Twitter, Github,
  TrendingUp, Shield, Clock, Download, Eye, Share2, ChevronLeft,
  MessageSquare, Send, Trash2
} from "lucide-react";
import { T, LangCtx, useLang, type Lang } from "@/lib/i18n";

const GlobalScene = dynamic(
  () => import("@/components/3d/GlobalScene").then((m) => m.GlobalScene),
  { ssr: false }
);

/* ─── Types ─── */
interface Product {
  id: string;
  title: string;
  desc: string;
  color: string;
  price: string;
  rating: number;
  sales: number;
  seller: string;
  tags: string[];
  image: string;
  format: string;
  license: string;
  updated: string;
  downloads: number;
}

/* ─── Data ─── */
const PRODUCTS: Product[] = [];

const CATEGORIES = [
  { nameEn: "Building & Construction", nameRu: "Конструкторы", icon: <Box className="w-6 h-6" />, count: "2.4K" },
  { nameEn: "Action Figures", nameRu: "Фигурки", icon: <Layers className="w-6 h-6" />, count: "1.8K" },
  { nameEn: "Board Games", nameRu: "Настольные игры", icon: <Code2 className="w-6 h-6" />, count: "890" },
  { nameEn: "Dolls & Houses", nameRu: "Куклы и дома", icon: <Zap className="w-6 h-6" />, count: "1.2K" },
  { nameEn: "Plushies", nameRu: "Мягкие игрушки", icon: <Palette className="w-6 h-6" />, count: "3.1K" },
  { nameEn: "Educational STEM", nameRu: "STEM наборы", icon: <PenTool className="w-6 h-6" />, count: "5.6K" },
  { nameEn: "Puzzles", nameRu: "Головоломки", icon: <Music className="w-6 h-6" />, count: "780" },
  { nameEn: "Outdoor & Sports", nameRu: "Уличные игры", icon: <Camera className="w-6 h-6" />, count: "2.9K" },
];

const SELLERS = [
  { name: "PlayBricks", avatar: "https://picsum.photos/seed/av1/200/200", sales: 2340, rating: 4.9, specialty: "LEGO & Building" },
  { name: "SoftJoy", avatar: "https://picsum.photos/seed/av2/200/200", sales: 1890, rating: 4.8, specialty: "Plushies & Soft" },
  { name: "HeroToys", avatar: "https://picsum.photos/seed/av3/200/200", sales: 956, rating: 5.0, specialty: "Action Figures" },
  { name: "FunGames", avatar: "https://picsum.photos/seed/av4/200/200", sales: 3120, rating: 4.7, specialty: "Board Games" },
  { name: "BrightBlocks", avatar: "https://picsum.photos/seed/av5/200/200", sales: 1560, rating: 4.9, specialty: "Building Blocks" },
  { name: "DreamHouse", avatar: "https://picsum.photos/seed/av6/200/200", sales: 780, rating: 4.9, specialty: "Dolls & Houses" },
];

const TESTIMONIALS = [
  { quote: "My kids absolutely love the toys we bought! The quality is amazing and delivery was super fast. PlayToys is the best!", author: "Sarah M.", role: "Parent" },
  { quote: "Finally found a place where I can find all types of toys in one place. The prices are fair and selection is huge!", author: "Emma K.", role: "Toy Collector" },
  { quote: "Great seller experience! The customer support team helped me pick the perfect gift for my nephew.", author: "James T.", role: "Parent" },
  { quote: "As a parent, I appreciate how easy it is to find quality toys here. The reviews are honest and helpful!", author: "Maria L.", role: "Mom of 3" },
];

/* ─── Helpers ─── */
function SectionReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  );
}

function GlassCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl transition-all duration-500 ${hover ? "hover:border-[#FF1493]/20 hover:bg-white/[0.06] hover:shadow-[0_8px_40px_rgba(255,128,64,0.06)]" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ─── Language Switcher ─── */
function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/[0.03]">
      {(["en", "ru"] as Lang[]).map((l) => (
        <button key={l} onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all duration-200 ${lang === l ? "bg-[#FF1493] text-black" : "text-white/40 hover:text-white"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

/* ─── Product Detail Modal ─── */
function ProductModal({ product, onClose }: { product: any; onClose: () => void }) {
  const { lang } = useLang();
  const t = T[lang];
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    await fetch("/api/cart", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "u4", productId: product.id || `p${product.id}`, productTitle: product.title, price: parseFloat(product.price), image: product.image })
    });
    setAdding(false);
    window.dispatchEvent(new Event("cart-updated"));
    onClose();
  };

  useEffect(() => {
    if (product) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  if (!product) return null;

  const tabs = [
    { key: "description" as const, label: t.description },
    { key: "details" as const, label: t.details },
    { key: "reviews" as const, label: t.reviews },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#080808] backdrop-blur-2xl shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow accent */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: `linear-gradient(90deg, transparent, ${product.color}, transparent)` }} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left — image */}
            <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden rounded-tl-3xl rounded-bl-none rounded-tr-3xl md:rounded-tr-none md:rounded-bl-3xl">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full"
                    style={{ background: `${product.color}20`, color: product.color, border: `1px solid ${product.color}40` }}>{tag}</span>
                ))}
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                <span className="text-sm font-black" style={{ color: product.color }}>{product.price}</span>
              </div>
            </div>

            {/* Right — info */}
            <div className="p-6 md:p-8 flex flex-col">
              <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-sm font-bold">{product.seller[0]}</div>
                <span className="text-sm text-white/50">{t.by2} <span className="text-white/80 font-semibold">{product.seller}</span></span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight">{product.title}</h2>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-black" style={{ color: product.color }}>{product.price}</span>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-[#FF1493] text-[#FF1493]" />
                  <span className="text-sm font-bold">{Number(product.rating).toFixed(1)}</span>
                  <span className="text-xs text-white/25">({product.sales} {t.salesCount})</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                {tabs.map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${activeTab === tab.key ? "bg-[#FF1493] text-black shadow-[0_0_15px_rgba(255,128,64,0.3)]" : "text-white/40 hover:text-white"}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 min-h-[120px]">
                <AnimatePresence mode="wait">
                  {activeTab === "description" && (
                    <motion.div key="desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <p className="text-white/55 text-sm leading-relaxed">{product.desc}</p>
                    </motion.div>
                  )}
                  {activeTab === "details" && (
                    <motion.div key="det" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <div className="space-y-3">
                        {[
                          { label: t.fileFormat, value: product.format },
                          { label: t.license, value: product.license },
                          { label: t.lastUpdated, value: product.updated },
                          { label: t.downloads, value: product.downloads.toLocaleString() },
                          { label: t.commercial, value: "✓" },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                            <span className="text-xs text-white/35">{label}</span>
                            <span className="text-xs font-semibold text-white/70">{value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "reviews" && (
                    <motion.div key="rev" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <div className="space-y-3">
                        {[
                          { name: "Alex T.", stars: 5, text: "Absolutely stunning quality, worth every ETH.", date: "Apr 2026" },
                          { name: "Maria S.", stars: 5, text: "Exactly what I needed for my project. Highly recommended!", date: "Mar 2026" },
                          { name: "Dev K.", stars: 4, text: "Great assets, documentation could be better.", date: "Feb 2026" },
                        ].map((r, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold">{r.name}</span>
                              <span className="text-[10px] text-white/25">{r.date}</span>
                            </div>
                            <div className="flex gap-0.5 mb-1.5">
                              {Array.from({ length: r.stars }).map((_, si) => (
                                <Star key={si} className="w-3 h-3 fill-[#FF1493] text-[#FF1493]" />
                              ))}
                            </div>
                            <p className="text-xs text-white/45">{r.text}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => { window.location.href = `/checkout/${product.id}`; }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-black transition-all hover:shadow-[0_0_25px_rgba(255,128,64,0.4)] hover:scale-[1.01]"
                  style={{ background: product.color }}>
                  {t.buyNow}
                </button>
                <button onClick={handleAddToCart} disabled={adding} className="flex-1 py-3 rounded-xl font-bold text-sm text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> {adding ? "..." : t.addToCart}
                </button>
                <button className="p-3 rounded-xl border border-white/10 hover:border-[#FF1493]/30 hover:bg-white/5 transition-all">
                  <Heart className="w-4 h-4 text-white/40" />
                </button>
                <button className="p-3 rounded-xl border border-white/10 hover:border-[#FF1493]/30 hover:bg-white/5 transition-all">
                  <Share2 className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>
          </div>

          {/* Related */}
          <div className="p-6 md:p-8 border-t border-white/[0.05]">
            <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">{t.relatedProducts}</h4>
            <div className="grid grid-cols-3 gap-3">
              {PRODUCTS.filter((p: any) => p.id !== product.id).slice(0, 3).map((p) => (
                <div key={p.id} className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:border-white/10 transition-all group">
                  <div className="h-24 overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-bold leading-tight truncate">{p.title}</p>
                    <p className="text-[10px] font-black mt-0.5" style={{ color: p.color }}>{p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Components ─── */
function Navigation() {
  const { lang, setLang } = useLang();
  const t = T[lang];
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const fetchCart = () => {
    fetch("/api/cart?userId=u4").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCartItems(data);
    });
  };

  useEffect(() => {
    fetchCart();
    window.addEventListener("cart-updated", fetchCart);
    return () => window.removeEventListener("cart-updated", fetchCart);
  }, []);

  const handleRemoveCartItem = async (id: string) => {
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    fetchCart();
  };

  useEffect(() => {
    if (menuOpen || cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, cartOpen]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navItems = [
    { label: t.navExplore, href: "/catalog" },
    { label: t.navCategories, href: "#categories" },
    { label: t.navSellers, href: "#sellers" },
    { label: t.navAbout, href: "#about" },
  ];

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/70 backdrop-blur-xl border-b border-white/[0.06]" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative">
            <NexusLogo size={36} />
            <div className="absolute inset-0 rounded-[10px] ring-1 ring-white/10 group-hover:ring-[#FF1493]/40 transition-all" />
          </div>
          <span className="text-[22px] font-black tracking-[-0.04em] hidden sm:block">
            Play<span className="text-[#FF1493]">Toys</span>
          </span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors duration-300 relative group">
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#FF1493] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <LangSwitcher />
          <button className="p-2.5 rounded-xl hover:bg-white/5 transition-colors"><Search className="w-4 h-4 text-white/50" /></button>
          <button onClick={() => setCartOpen(true)} className="p-2.5 rounded-xl hover:bg-white/5 transition-colors relative">
            <ShoppingCart className="w-4 h-4 text-white/50" />
            {cartItems.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF1493] rounded-full text-[9px] font-bold text-black flex items-center justify-center">{cartItems.length}</span>}
          </button>
          <a href="/dashboard" className="ml-1 px-5 py-2 rounded-full bg-[#FF1493] text-black text-[13px] font-bold hover:bg-[#ff9060] transition-all hover:shadow-[0_0_25px_rgba(255,128,64,0.4)]">
            {t.signIn}
          </a>
        </div>
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/5 overflow-hidden">
            <div className="px-6 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-lg font-medium py-2" onClick={() => setMenuOpen(false)}>{item.label}</a>
              ))}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                <LangSwitcher />
                <button onClick={() => { setMenuOpen(false); setCartOpen(true); }} className="p-2 relative rounded-xl hover:bg-white/5">
                  <ShoppingCart className="w-5 h-5 text-white/50" />
                </button>
              </div>
              <a href="/dashboard" className="mt-2 px-4 py-3 rounded-full bg-[#FF1493] text-black text-center text-sm font-bold w-full">
                {t.signIn}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
            <div className="absolute inset-0 flex justify-end pointer-events-none">
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="pointer-events-auto relative w-full max-w-sm h-full bg-[#080808] border-l border-white/10 shadow-2xl flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> {t.cart}</h3>
                  <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-white/50"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
                      <p className="text-white/40">{t.emptyCart}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 relative">
                          <img src={item.image} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{item.productTitle}</p>
                            <p className="text-[#FF1493] font-black text-xs">{item.price} {item.currency}</p>
                          </div>
                          <button onClick={() => handleRemoveCartItem(item.id)} className="p-2 hover:text-red-400 text-white/40 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-white/10">
                  {cartItems.length > 0 ? (
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-white/50 text-sm">Total</span>
                      <span className="text-xl font-black text-[#FF1493]">{cartItems.reduce((acc, i) => acc + i.price, 0).toFixed(2)}</span>
                    </div>
                  ) : null}
                  <a href={cartItems.length > 0 ? `/checkout/cart` : `/catalog`} onClick={() => setCartOpen(false)} className="block w-full py-4 rounded-xl bg-[#FF1493] text-black text-center font-bold hover:bg-[#ff9060] transition-colors shadow-[0_0_20px_rgba(255,128,64,0.3)]">
                    {cartItems.length > 0 ? t.buyNow : t.exploreLabel}
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  const { lang } = useLang();
  const t = T[lang];
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-16">
      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF1493]/20 bg-[#FF1493]/5">
          <div className="w-2 h-2 rounded-full bg-[#FF1493] animate-pulse" />
          <span className="text-xs font-semibold text-[#FF1493] uppercase tracking-wider">{t.live}</span>
        </motion.div>
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.9] tracking-tight mb-8">
          <motion.span initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="block">{t.hero1}</motion.span>
          <motion.span initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="block text-[#FF1493]">{t.hero2}</motion.span>
          <motion.span initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }} className="block">{t.hero3}</motion.span>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="text-lg md:text-xl text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">{t.heroSub}</motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a href="/catalog" className="group px-8 py-4 rounded-full bg-[#FF1493] text-black font-bold text-sm flex items-center gap-2 hover:bg-[#ff9060] transition-all hover:shadow-[0_0_40px_rgba(255,128,64,0.4)]">
            {t.explore} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="/become-seller" className="px-8 py-4 rounded-full border border-white/10 text-white font-bold text-sm hover:border-white/25 hover:bg-white/[0.03] transition-all">{t.becomeSeller}</a>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[{ v: "12K+", l: t.products }, { v: "3.2K", l: t.creators }, { v: "89K+", l: t.sales }, { v: "4.9", l: t.rating }].map((s, i) => (
            <div key={i} className="text-center p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="text-2xl md:text-3xl font-black text-[#FF1493]">{s.v}</div>
              <div className="text-[11px] text-white/30 uppercase tracking-wider mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border border-white/15 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-[#FF1493]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Sticky Showcase ─── */
function ProductInfo({ product, index, scrollProgress, total, onOpen }: {
  product: typeof PRODUCTS[0]; index: number; scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"]; total: number; onOpen: () => void;
}) {
  const { lang } = useLang();
  const t = T[lang];
  const start = index / total;
  const end = (index + 1) / total;
  const mid = (start + end) / 2;
  const opacity = useTransform(scrollProgress, [start, mid, end], [0, 1, 0]);
  const y = useTransform(scrollProgress, [start, mid, end], [60, 0, -60]);
  const tagsScale = useTransform(scrollProgress, [start + 0.01, start + 0.04], [0, 1]);
  const titleX = useTransform(scrollProgress, [start, start + 0.03], [-40, 0]);
  const titleOpacity = useTransform(scrollProgress, [start, start + 0.02, mid, end - 0.02, end], [0, 1, 1, 1, 0]);
  const descOpacity = useTransform(scrollProgress, [start + 0.02, start + 0.05], [0, 1]);
  const priceScale = useTransform(scrollProgress, [start + 0.03, start + 0.06], [0.5, 1]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center pl-8 md:pl-16 lg:pl-24 pr-8 pointer-events-none">
      <motion.div style={{ scale: tagsScale }} className="flex gap-1.5 mb-4 pointer-events-auto">
        {product.tags.map((tag) => (
          <span key={tag} className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border"
            style={{ background: `${product.color}15`, color: product.color, borderColor: `${product.color}30` }}>{tag}</span>
        ))}
      </motion.div>
      <motion.h3 style={{ x: titleX, opacity: titleOpacity }} className="text-3xl md:text-5xl font-black mb-3 leading-tight">{product.title}</motion.h3>
      <motion.p style={{ opacity: descOpacity }} className="text-white/40 text-sm md:text-base mb-6 max-w-md leading-relaxed">{product.desc}</motion.p>
      <motion.div style={{ scale: priceScale }} className="flex items-center gap-4 mb-6">
        <span className="text-2xl md:text-3xl font-black" style={{ color: product.color }}>{product.price}</span>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-[#FF1493] fill-[#FF1493]" />
          <span className="text-sm font-semibold">{product.rating}</span>
          <span className="text-xs text-white/25">({product.sales} {t.salesCount})</span>
        </div>
      </motion.div>
      <motion.div style={{ opacity: descOpacity }} className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-bold">{product.seller[0]}</div>
        <span className="text-sm text-white/50">{t.by2} <span className="text-white/80 font-medium">{product.seller}</span></span>
      </motion.div>
      <motion.div style={{ opacity: descOpacity }} className="pointer-events-auto">
        <button onClick={onOpen}
          className="group px-6 py-3 rounded-full border text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
          style={{ borderColor: `${product.color}30`, background: `${product.color}08` }}>
          <span style={{ color: product.color }}>{t.viewAsset}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: product.color }} />
        </button>
      </motion.div>
    </motion.div>
  );
}

function ProductVisual({ product, index, scrollProgress, total, onOpen }: {
  product: typeof PRODUCTS[0]; index: number; scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"]; total: number; onOpen: () => void;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const mid = (start + end) / 2;
  const opacity = useTransform(scrollProgress, [start, start + 0.02, mid, end - 0.02, end], [0, 1, 1, 1, 0]);
  const scale = useTransform(scrollProgress, [start, mid, end], [0.85, 1, 0.85]);
  const rotateY = useTransform(scrollProgress, [start, mid, end], [-15, 0, 15]);
  const imgScale = useTransform(scrollProgress, [start, start + 0.03], [1.3, 1]);
  const imgOpacity = useTransform(scrollProgress, [start, start + 0.02], [0, 1]);

  return (
    <motion.div style={{ opacity, scale, rotateY }} onClick={onOpen}
      className="absolute w-[80%] max-w-lg aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl cursor-pointer group">
      <div className="absolute inset-0 rounded-3xl pointer-events-none z-10"
        dangerouslySetInnerHTML={{ __html: `<div style="position:absolute;inset:-1px;border-radius:24px;padding:1.5px;background:linear-gradient(135deg,${product.color},transparent 40%,${product.color}80);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0.5"></div>` }} />
      <div className="relative h-[65%] overflow-hidden">
        <motion.div style={{ scale: imgScale, opacity: imgOpacity }} className="w-full h-full">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <motion.div style={{ scale }} className="absolute top-4 right-4 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <span className="text-sm font-black" style={{ color: product.color }}>{product.price}</span>
        </motion.div>
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.03] transition-colors duration-300 flex items-center justify-center">
          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
        </div>
      </div>
      <div className="p-5 h-[35%] flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-lg mb-1">{product.title}</h4>
          <p className="text-xs text-white/35 line-clamp-2">{product.desc}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold">{product.seller[0]}</div>
            <span className="text-xs text-white/40">{product.seller}</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" onClick={(e) => e.stopPropagation()}>
            <Heart className="w-4 h-4 text-white/20 hover:text-[#FF1493] transition-colors" />
          </button>
        </div>
      </div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none" style={{ background: `${product.color}15` }} />
    </motion.div>
  );
}

function DotNav({ index, scrollProgress, total }: { index: number; scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"]; total: number; }) {
  const start = index / total;
  const end = (index + 1) / total;
  const isActive = useTransform(scrollProgress, [start, (start + end) / 2, end], [0, 1, 0]);
  return (
    <motion.div style={{ opacity: useTransform(isActive, [0, 1], [0.2, 1]) }} className="flex items-center justify-center">
      <motion.div style={{ width: useTransform(isActive, [0, 1], [6, 24]), height: 6, borderRadius: 3, background: useTransform(isActive, [0, 1], ["rgba(255,255,255,0.15)", PRODUCTS[index].color]) }} />
    </motion.div>
  );
}

function StickyProductShowcaseInner({ onOpen }: { onOpen: (p: typeof PRODUCTS[0]) => void }) {
  const { lang } = useLang();
  const t = T[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const headerOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);

  return (
    <section id="explore" ref={containerRef} className="relative z-10" style={{ height: `${(PRODUCTS.length + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        {/* Header — placed at the top so it never overlaps the vertically centered products */}
        <motion.div style={{ opacity: headerOpacity }} className="absolute left-8 md:left-16 lg:left-24 top-24 z-0 pointer-events-none">
          <p className="text-[#FF1493] text-sm font-bold uppercase tracking-widest mb-2">{t.exploreLabel}</p>
          <h2 className="text-4xl md:text-5xl font-black">{t.trendingNow}</h2>
        </motion.div>

        <div className="relative w-1/2 h-full z-10">
          {PRODUCTS.map((p, i) => (
            <ProductInfo key={p.id} product={p} index={i} scrollProgress={scrollYProgress} total={PRODUCTS.length} onOpen={() => onOpen(p)} />
          ))}
        </div>
        <div className="w-1/2 pr-8 md:pr-16 lg:pr-24 flex items-center justify-center relative h-full z-10">
          {PRODUCTS.map((p, i) => (
            <ProductVisual key={p.id} product={p} index={i} scrollProgress={scrollYProgress} total={PRODUCTS.length} onOpen={() => onOpen(p)} />
          ))}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          {PRODUCTS.map((_, i) => <DotNav key={i} index={i} scrollProgress={scrollYProgress} total={PRODUCTS.length} />)}
        </div>
      </div>
    </section>
  );
}

function StickyProductShowcase({ onOpen }: { onOpen: (p: typeof PRODUCTS[0]) => void }) {
  if (PRODUCTS.length === 0) return null;
  return <StickyProductShowcaseInner onOpen={onOpen} />;
}

/* ─── Testimonials ─── */
function ScrollSellerCard({ seller, index, onClick }: { seller: typeof SELLERS[0]; index: number; onClick: (s: typeof SELLERS[0]) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const cardOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const cardX = useTransform(scrollYProgress, [0, 0.3], [index % 2 === 0 ? -40 : 40, 0]);
  const avatarScale = useTransform(scrollYProgress, [0.05, 0.35], [0, 1]);
  const nameOpacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);
  const statsOpacity = useTransform(scrollYProgress, [0.25, 0.5], [0, 1]);

  return (
    <div ref={ref}>
      <motion.button 
        style={{ opacity: cardOpacity, x: cardX }}
        onClick={() => onClick(seller)}
        className="w-full text-left rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 flex items-center gap-4 group cursor-pointer transition-all duration-500 hover:border-[#FF1493]/20 hover:bg-white/[0.06] hover:shadow-[0_8px_40px_rgba(255,128,64,0.06)] relative z-20">
        <div className="relative shrink-0">
          <motion.div style={{ scale: avatarScale }} className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#FF1493]/20 group-hover:border-[#FF1493] transition-colors">
            <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
          </motion.div>
          <motion.div style={{ scale: avatarScale }} className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
        </div>
        <div className="flex-1 min-w-0">
          <motion.h4 style={{ opacity: nameOpacity }} className="font-bold group-hover:text-[#FF1493] transition-colors">{seller.name}</motion.h4>
          <motion.p style={{ opacity: nameOpacity }} className="text-xs text-white/35">{seller.specialty}</motion.p>
          <motion.div style={{ opacity: statsOpacity }} className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 text-[#FF1493] fill-[#FF1493]" />{Number(seller.rating).toFixed(1)}</span>
            <span className="text-[10px] text-white/25">{seller.sales.toLocaleString()} sales</span>
          </motion.div>
        </div>
        <motion.div style={{ opacity: statsOpacity }}>
          <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-[#FF1493] group-hover:translate-x-1 transition-all" />
        </motion.div>
      </motion.button>
    </div>
  );
}

function FeaturedSellers({ onOpenSeller }: { onOpenSeller: (s: typeof SELLERS[0]) => void }) {
  const { lang } = useLang();
  const t = T[lang];
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: hp } = useScroll({ target: headerRef, offset: ["start end", "start center"] });
  const hY = useTransform(hp, [0, 1], [50, 0]);
  const hO = useTransform(hp, [0, 1], [0, 1]);

  const topSellers = SELLERS.filter(s => s.rating >= 4.8 && s.sales >= 1500).sort((a, b) => b.sales - a.sales);

  if (topSellers.length === 0) return null;

  return (
    <section id="sellers" className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div ref={headerRef} style={{ y: hY, opacity: hO }} className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#FF1493] text-sm font-bold uppercase tracking-widest mb-2">{t.sellersLabel}</p>
            <h2 className="text-4xl md:text-5xl font-black">{t.topCreators}</h2>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topSellers.map((s, i) => <ScrollSellerCard key={s.name} seller={s} index={i} onClick={onOpenSeller} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Categories ─── */
function ScrollCategoryCard({ category, index }: { category: typeof CATEGORIES[0]; index: number }) {
  const { lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const cardOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const cardY = useTransform(scrollYProgress, [0, 0.4], [40, 0]);
  const iconScale = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);
  const iconRotate = useTransform(scrollYProgress, [0.1, 0.5], [-90, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const countWidth = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const catColors = ["#FF1493","#00D9FF","#9D4EDD","#3A86FF","#FB5607","#06FFB4","#FF006E","#FFB700"];
  const color = catColors[index % catColors.length];
  const name = lang === "ru" ? category.nameRu : category.nameEn;

  return (
    <div ref={ref}>
      <motion.button style={{ opacity: cardOpacity, y: cardY }} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
        className="w-full p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#FF1493]/20 hover:bg-[#FF1493]/5 transition-all duration-300 text-left group relative overflow-hidden">
        <motion.div style={{ scaleX: countWidth, background: color }} className="absolute bottom-0 left-0 right-0 h-[2px] origin-left opacity-40" />
        <motion.div style={{ scale: iconScale, rotate: iconRotate }} className="mb-3">
          <div style={{ color: `${color}60` }} className="group-hover:!text-[#FF1493] [&_svg]:transition-colors">{category.icon}</div>
        </motion.div>
        <motion.h4 style={{ opacity: textOpacity }} className="font-bold text-sm mb-0.5">{name}</motion.h4>
        <motion.p style={{ opacity: textOpacity }} className="text-[11px] text-white/25">{category.count} {lang === "ru" ? "товаров" : "items"}</motion.p>
      </motion.button>
    </div>
  );
}

function CategoriesSection() {
  const { lang } = useLang();
  const t = T[lang];
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: hp } = useScroll({ target: headerRef, offset: ["start end", "start center"] });
  const hY = useTransform(hp, [0, 1], [50, 0]);
  const hO = useTransform(hp, [0, 1], [0, 1]);

  return (
    <section id="categories" className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div ref={headerRef} style={{ y: hY, opacity: hO }} className="text-center mb-14">
          <p className="text-[#FF1493] text-sm font-bold uppercase tracking-widest mb-2">{t.categories}</p>
          <h2 className="text-4xl md:text-5xl font-black">{t.browseByType}</h2>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => <ScrollCategoryCard key={cat.nameEn} category={cat} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function TestimonialsSection() {
  const { lang } = useLang();
  const t = T[lang];
  const [current, setCurrent] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: hp } = useScroll({ target: headerRef, offset: ["start end", "start center"] });
  const hY = useTransform(hp, [0, 1], [50, 0]);
  const hO = useTransform(hp, [0, 1], [0, 1]);

  return (
    <section id="testimonials" className="py-32 relative z-10">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div ref={headerRef} style={{ y: hY, opacity: hO }} className="text-center mb-12">
          <p className="text-[#FF1493] text-sm font-bold uppercase tracking-widest mb-2">{lang === "ru" ? "Отзывы" : "Testimonials"}</p>
          <h2 className="text-4xl md:text-5xl font-black">{lang === "ru" ? "Что говорят покупатели" : "What Customers Say"}</h2>
        </motion.div>
        <GlassCard className="p-10 md:p-14 text-center min-h-[220px] flex flex-col items-center justify-center" hover={false}>
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
              <h3 className="text-xl md:text-2xl font-medium italic leading-relaxed mb-6 text-white/80">&ldquo;{TESTIMONIALS[current].quote}&rdquo;</h3>
              <div className="flex items-center justify-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF1493] to-[#a855f7] flex items-center justify-center text-xs font-bold text-black">{TESTIMONIALS[current].author[0]}</div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{TESTIMONIALS[current].author}</p>
                  <p className="text-[11px] text-white/35">{TESTIMONIALS[current].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </GlassCard>
        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-[#FF1493] w-8" : "bg-white/15 w-1.5"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About ─── */
function AboutSection() {
  const { lang } = useLang();
  const t = T[lang];
  const features = [
    { icon: <Shield className="w-5 h-5" />, title: t.verifiedSellers, desc: t.verifiedDesc },
    { icon: <TrendingUp className="w-5 h-5" />, title: t.fairPricing, desc: t.fairDesc },
    { icon: <Clock className="w-5 h-5" />, title: t.instantDelivery, desc: t.instantDesc },
  ];

  return (
    <section id="about" className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <SectionReveal>
            <div>
              <p className="text-[#FF1493] text-sm font-bold uppercase tracking-widest mb-2">{t.about}</p>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">{lang === "ru" ? "Магазин Игрушек Нового Поколения" : "The Next Generation Toy Store"}</h2>
              <p className="text-white/40 leading-relaxed mb-8">{lang === "ru" ? "PlayToys — это современный маркетплейс, где качественные игрушки встречаются с удобством покупок. Мы тщательно отбираем каждый товар, чтобы гарантировать безопасность, качество и удовольствие для детей всех возрастов." : "PlayToys is a modern marketplace where quality toys meet shopping convenience. We carefully select every product to guarantee safety, quality, and enjoyment for children of all ages."}</p>
              <div className="space-y-4">
                {features.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                    className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[#FF1493]/15 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#FF1493]/10 flex items-center justify-center text-[#FF1493] shrink-0">{f.icon}</div>
                    <div><h4 className="font-bold text-sm mb-0.5">{f.title}</h4><p className="text-xs text-white/35 leading-relaxed">{f.desc}</p></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </SectionReveal>
          <SectionReveal>
            <div className="grid grid-cols-2 gap-4">
              {[
                { v: lang === "ru" ? "8K+" : "8K+", l: lang === "ru" ? "Товаров" : "Products" },
                { v: lang === "ru" ? "1.2K" : "1.2K", l: lang === "ru" ? "Продавцов" : "Sellers" },
                { v: "$2.8M", l: lang === "ru" ? "Продано" : "Revenue" },
                { v: "98%", l: lang === "ru" ? "Довольных" : "Happy" }
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
                  <div className="text-3xl font-black text-[#FF1493] mb-1">{s.v}</div>
                  <div className="text-[11px] text-white/30 uppercase tracking-wider">{s.l}</div>
                </motion.div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Newsletter ─── */
function NewsletterSection() {
  const { lang } = useLang();
  const t = T[lang];
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (email) { setSubmitted(true); setEmail(""); setTimeout(() => setSubmitted(false), 3000); } };

  return (
    <section className="py-32 relative z-10">
      <div className="max-w-2xl mx-auto px-6">
        <SectionReveal>
          <GlassCard className="p-8 md:p-12 text-center relative overflow-hidden" hover={false}>
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#FF1493]/5 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-black mb-2">{t.stayInLoop}</h3>
              <p className="text-white/35 mb-8 text-sm">{t.newsletter}</p>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#FF1493] transition-colors" />
                </div>
                <button type="submit" className="px-6 py-3 rounded-xl bg-[#FF1493] text-black font-bold text-sm hover:bg-[#ff9060] transition-all hover:shadow-[0_0_25px_rgba(255,128,64,0.3)] whitespace-nowrap flex items-center justify-center gap-2">
                  {submitted ? <><Sparkles className="w-4 h-4" />{t.done}</> : <>{t.subscribe} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          </GlassCard>
        </SectionReveal>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const { lang } = useLang();
  return (
    <footer className="relative z-10 pt-20 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF1493] to-[#FF006E] flex items-center justify-center"><Sparkles className="w-4 h-4 text-black" /></div>
              <span className="text-lg font-extrabold">Play<span className="text-[#FF1493]">Toys</span></span>
            </div>
            <p className="text-xs text-white/25 leading-relaxed mb-4">{lang === "ru" ? "Лучший магазин детских игрушек. Качество, безопасность и веселье!" : "The best kids toy store. Quality, safety, and fun!"}</p>
            <div className="flex gap-2">
              {[Twitter, Instagram, Globe, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-white/25 hover:text-[#FF1493] hover:border-[#FF1493]/20 transition-all"><Icon className="w-3.5 h-3.5" /></a>
              ))}
            </div>
          </div>
          {[
            { t: lang === "ru" ? "Магазин" : "Store", items: lang === "ru" ? ["Магазин","Категории","Новинки","Тренды"] : ["Shop","Categories","New Items","Popular"] },
            { t: lang === "ru" ? "Компания" : "Company", items: lang === "ru" ? ["О Нас","Блог","Карьера","Контакты"] : ["About","Blog","Careers","Contact"] },
            { t: lang === "ru" ? "Поддержка" : "Support", items: lang === "ru" ? ["Помощь","Доставка","Возврат","Условия"] : ["Help","Shipping","Returns","Terms"] },
          ].map((col) => (
            <div key={col.t}>
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-3 font-bold">{col.t}</h4>
              <div className="flex flex-col gap-2">{col.items.map((item) => (<a key={item} href="#" className="text-xs text-white/30 hover:text-[#FF1493] transition-colors">{item}</a>))}</div>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-white/15">&copy; 2026 PlayToys Store</p>
          <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-[10px] text-white/15 ml-1">{lang === "ru" ? "Все системы работают" : "All systems operational"}</span></div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Scroll Progress Bar ─── */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF1493] via-[#a855f7] to-[#00d4ff] z-[100] origin-left" />;
}

/* ─── Seller Modal ─── */
function SellerModal({ seller, onClose }: { seller: typeof SELLERS[0] | null; onClose: () => void }) {
  const { lang } = useLang();
  const t = T[lang];

  useEffect(() => {
    if (seller) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [seller]);

  if (!seller) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-2xl bg-[#080808] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Cover */}
          <div className="h-32 bg-gradient-to-r from-[#FF1493]/20 via-purple-500/20 to-[#00d4ff]/20 relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 text-white/60 hover:text-white transition-colors backdrop-blur">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="px-8 pb-8">
            <div className="flex justify-between items-end -mt-12 mb-6 relative z-10">
              <img src={seller.avatar} alt={seller.name} className="w-24 h-24 rounded-2xl border-4 border-[#080808] bg-[#111]" />
              <button onClick={() => window.location.href = `/catalog?search=${seller.name}`} className="px-6 py-2.5 rounded-xl bg-[#FF1493] text-black font-bold text-sm hover:bg-[#ff9060] transition-colors shadow-[0_0_20px_rgba(255,128,64,0.3)]">
                {lang === "ru" ? "Смотреть работы" : "View Portfolio"}
              </button>
            </div>
            
            <h2 className="text-3xl font-black mb-1">{seller.name}</h2>
            <p className="text-[#FF1493] font-semibold text-sm mb-6">{seller.specialty}</p>
            
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              {lang === "ru" 
                ? `${seller.name} является ведущим креатором в области ${seller.specialty}. Создавая невероятные и высококачественные цифровые активы, этот автор помогает сотням других дизайнеров и разработчиков воплощать их мечты в реальность. Все работы проходят строгую проверку качества и оптимизированы для продакшена.` 
                : `${seller.name} is a leading creator specializing in ${seller.specialty}. By crafting incredible, high-quality digital assets, this author helps hundreds of designers and developers bring their visions to life. All works are rigorously quality-checked and production-ready.`}
            </p>
            
            <div className="flex gap-6 pt-6 border-t border-white/10">
              <div>
                <div className="text-2xl font-black">{seller.sales.toLocaleString()}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{t.sales}</div>
              </div>
              <div>
                <div className="text-2xl font-black flex items-center gap-1">{Number(seller.rating).toFixed(1)} <Star className="w-4 h-4 text-[#FF1493] fill-[#FF1493]" /></div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{t.rating}</div>
              </div>
              <div>
                <div className="text-2xl font-black">2023</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{lang === "ru" ? "На платформе с" : "Joined"}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Support Widget ─── */
function SupportWidget() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{text: string, isUser: boolean}[]>([
    { text: lang === "ru" ? "Привет! Чем могу помочь?" : "Hi! How can I help you today?", isUser: false }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { text: lang === "ru" ? "Спасибо за обращение! Наш агент скоро ответит вам." : "Thanks for reaching out! An agent will be with you shortly.", isUser: false }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[250] flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 bg-[#080808] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-96">
            <div className="p-4 bg-gradient-to-r from-[#FF1493] to-[#cc4400] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-bold text-black text-sm">{lang === "ru" ? "Служба Поддержки" : "Support"}</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-black/60 hover:text-black"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#0a0a0a]">
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[80%] p-3 rounded-xl text-sm ${m.isUser ? "bg-[#FF1493]/20 text-white self-end rounded-br-sm" : "bg-white/5 text-white/80 self-start rounded-bl-sm"}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#080808]">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder={lang === "ru" ? "Введите сообщение..." : "Type a message..."} 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF1493] transition-colors" />
              <button type="submit" className="p-2 bg-[#FF1493] text-black rounded-lg hover:bg-[#ff9060] transition-colors"><Send className="w-4 h-4" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen(!open)} className="w-14 h-14 bg-[#FF1493] text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,128,64,0.4)] hover:scale-105 transition-transform hover:bg-[#ff9060]">
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}

/* ─── Main Page ─── */
export default function HomePage() {
  const [lang, setLang] = useState<Lang>("ru");
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);

  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <main className="relative bg-black min-h-screen">
        <GlobalScene />
        <div className="fixed inset-0 z-[2] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        </div>
        <ScrollProgressBar />
        <div className="relative z-10">
          <Navigation />
          <HeroSection />
          <StickyProductShowcase onOpen={setSelectedProduct} />
          <CategoriesSection />
          <AboutSection />
          <TestimonialsSection />
          <NewsletterSection />
          <Footer />
        </div>
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        <SupportWidget />
      </main>
    </LangCtx.Provider>
  );
}
