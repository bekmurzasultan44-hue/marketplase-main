"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Wallet, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Product } from "@/lib/db";
import Link from "next/link";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState<"crypto" | "card">("crypto");

  useEffect(() => {
    // If it's a demo product ID (like 1, 2, 3 instead of 'p1'), we handle it or fetch from API
    const fetchProduct = async () => {
      try {
        // Fallback demo product if API fails or ID is from hardcoded frontend list
        let p: Product | null = null;
        
        // Try fetching from our API first
        if (typeof params.id === "string" && params.id.startsWith("p")) {
          const res = await fetch(`/api/products/${params.id}`);
          if (res.ok) {
            p = await res.json();
          }
        }
        
        // If not found in API, mock it based on ID for the demo
        if (!p) {
          p = {
            id: (Array.isArray(params.id) ? params.id[0] : params.id) ?? "unknown",
            title: "Premium Digital Asset",
            price: 0.42,
            currency: "ETH",
            sellerId: "u2",
            sellerName: "CosmicForge",
            image: "https://picsum.photos/seed/checkout/800/600",
            color: "#ff8040",
            tags: ["Premium", "Asset"],
            rating: 5.0,
            sales: 100,
            desc: "A high quality digital asset.",
            format: "ZIP",
            license: "Standard",
            updated: "2026",
            downloads: 0,
            status: "active",
            createdAt: "2026",
          };
        }
        setProduct(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handlePay = async () => {
    setProcessing(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      buyerId: "u4",
      productId: product?.id
    })
  });

  if (!res.ok) {
    const data = await res.json();
    alert(data.error || "Ошибка при создании заказа");
    return;
  }

  setSuccess(true);

} catch (e) {
  console.error(e);
  alert("Ошибка оплаты");
}
    
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#ff8040]/20 border-t-[#ff8040] animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-3xl p-10 text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black mb-4">Order Confirmed!</h1>
          <p className="text-white/50 mb-8 leading-relaxed">
            Your purchase of <strong className="text-white">{product.title}</strong> is complete. Get ready for the fun!
          </p>
          <div className="flex flex-col gap-3">
            <button className="w-full py-4 rounded-xl font-bold bg-[#FF1493] text-black hover:bg-[#FF4DB4] transition-colors">
              Track Order
            </button>
            <Link href="/" className="w-full py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-colors text-white">
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF1493]/30 selection:text-white">
      {/* Navbar */}
      <nav className="h-20 border-b border-white/10 flex items-center px-6 md:px-12 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-sm">Back to Store</span>
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Left: Product Info */}
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-8">Checkout</h1>
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden group">
            <div className="h-64 overflow-hidden relative">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3 inline-block">
                  {product.license}
                </span>
                <h2 className="text-2xl font-bold">{product.title}</h2>
                <p className="text-white/50 text-sm mt-1">by {product.sellerName}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between py-4 border-b border-white/5">
                <span className="text-white/50">Price</span>
                <span className="font-mono text-lg font-bold">{product.price}</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-white/5">
                <span className="text-white/50">Shipping</span>
                <span className="font-mono text-lg text-white/70">$2.99</span>
              </div>
              <div className="flex items-center justify-between py-4 mt-2">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-black" style={{ color: product.color }}>
                  {(Number(product.price) + 2.99).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment */}
        <div className="lg:pt-20">
          <h3 className="text-xl font-bold mb-6">Select Payment Method</h3>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setMethod("crypto")}
              className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${method === "crypto" ? "border-[#FF1493] bg-[#FF1493]/5" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
            >
              <Wallet className={`w-8 h-8 ${method === "crypto" ? "text-[#FF1493]" : "text-white/50"}`} />
              <span className={`font-bold ${method === "crypto" ? "text-[#FF1493]" : "text-white/70"}`}>Crypto</span>
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${method === "card" ? "border-[#FF1493] bg-[#FF1493]/5" : "border-white/10 bg-white/[0.02] hover:border-white/30"}`}
            >
              <CreditCard className={`w-8 h-8 ${method === "card" ? "text-[#FF1493]" : "text-white/50"}`} />
              <span className={`font-bold ${method === "card" ? "text-[#FF1493]" : "text-white/70"}`}>Card</span>
            </button>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mb-8">
            {method === "crypto" ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-[#FF1493]/10 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-[#FF1493]" />
                </div>
                <h4 className="font-bold mb-2">Connect your wallet</h4>
                <p className="text-sm text-white/50 mb-6">Sign the transaction to complete your purchase securely.</p>
                <div className="flex items-center justify-center gap-2 text-xs text-[#FF1493] bg-[#FF1493]/10 py-2 px-4 rounded-full w-max mx-auto">
                  <div className="w-2 h-2 rounded-full bg-[#FF1493] animate-pulse" /> Wallet Connected (0x...A42)
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Card Number</label>
                  <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF1493] font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF1493] font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">CVC</label>
                    <input type="text" placeholder="123" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF1493] font-mono" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full py-5 rounded-2xl bg-[#FF1493] text-black font-black text-lg hover:bg-[#FF4DB4] transition-colors flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {processing ? (
              <><div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" /> Processing...</>
            ) : (
              <>Pay ${(Number(product.price) + 2.99).toFixed(2)}</>
            )}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-xs">
            <ShieldCheck className="w-4 h-4" /> Secure encrypted checkout
          </div>
        </div>

      </div>
    </div>
  );
}
