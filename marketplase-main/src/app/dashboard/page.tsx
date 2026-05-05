"use client";

import { useState, useEffect } from "react";
import { User, Product, Order } from "@/lib/db";
import { Package, Users, ShoppingCart, LogOut, Plus, Edit2, Trash2, X, Upload } from "lucide-react";
import { NexusLogo } from "@/components/NexusLogo";

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"products" | "orders" | "users">("products");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: "", price: "", desc: "", image: "" });

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch data
  const fetchData = async () => {
    if (!currentUser) return;
    try {
      if (currentUser.role === "admin") {
        const [pRes, oRes, uRes] = await Promise.all([
          fetch("/api/products"), fetch("/api/orders"), fetch("/api/users")
        ]);
        setProducts(await pRes.json());
        setOrders(await oRes.json());
        setUsers(await uRes.json());
      } else if (currentUser.role === "seller") {
        const [pRes, oRes] = await Promise.all([
          fetch(`/api/products?sellerId=${currentUser.id}`),
          fetch(`/api/orders?sellerId=${currentUser.id}`)
        ]);
        setProducts(await pRes.json());
        setOrders(await oRes.json());
      } else if (currentUser.role === "buyer") {
        const oRes = await fetch(`/api/orders?buyerId=${currentUser.id}`);
        setOrders(await oRes.json());
        setActiveTab("orders");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const user = await res.json();
      setCurrentUser(user);
      setActiveTab(user.role === "buyer" ? "orders" : "products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProducts([]);
    setOrders([]);
    setUsers([]);
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;
    
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newProduct.title,
        price: Number(newProduct.price),
        desc: newProduct.desc || "A great digital asset.",
        image: newProduct.image || "https://picsum.photos/seed/newproduct/600/400",
        sellerId: currentUser?.id,
        sellerName: currentUser?.name,
        status: "active"
      })
    });
    
    setShowAddModal(false);
    setNewProduct({ title: "", price: "", desc: "", image: "" });
    fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <NexusLogo size={44} />
              <span className="text-3xl font-black tracking-[-0.04em]">NEX<span className="text-[#ff8040]">US</span></span>
            </div>
            <p className="text-white/40">Sign in to your dashboard</p>
          </div>
          {error && <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors"
            />
            <input 
              type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors"
            />
            <button type="submit" disabled={loading} className="w-full py-3 mt-4 rounded-xl bg-[#ff8040] text-black font-bold hover:bg-[#ff9060] transition-colors">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/40 text-center">
            <p>Demo accounts:</p>
            <p>Admin: admin@nexus.io / admin123</p>
            <p>Seller: cosmic@nexus.io / seller123</p>
            <p>Buyer: alex@nexus.io / buyer123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 bg-white/[0.02] flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <NexusLogo size={34} />
          <div>
            <h1 className="text-lg font-black leading-none">NEX<span className="text-[#ff8040]">US</span></h1>
            <p className="text-xs text-white/40 capitalize mt-0.5">{currentUser.role} Dashboard</p>
          </div>
        </div>
        
        <div className="flex-1 px-4 flex flex-col gap-2">
          {currentUser.role !== "buyer" && (
            <button 
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "products" ? "bg-[#ff8040]/10 text-[#ff8040] font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <Package className="w-5 h-5" /> Products
            </button>
          )}
          <button 
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "orders" ? "bg-[#ff8040]/10 text-[#ff8040] font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
          >
            <ShoppingCart className="w-5 h-5" /> Orders
          </button>
          {currentUser.role === "admin" && (
            <button 
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "users" ? "bg-[#ff8040]/10 text-[#ff8040] font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <Users className="w-5 h-5" /> Users
            </button>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{currentUser.name}</p>
              <p className="text-xs text-white/40 truncate">{currentUser.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm font-semibold text-white/60">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Products Tab */}
          {activeTab === "products" && currentUser.role !== "buyer" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black">Products</h2>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff8040] text-black font-bold hover:bg-[#ff9060] transition-colors">
                  <Plus className="w-4 h-4" /> New Product
                </button>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.05] border-b border-white/10 text-white/50 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-4">Title</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Sales</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Seller</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-medium">{p.title}</td>
                        <td className="p-4 text-[#ff8040] font-bold">{p.price} {p.currency}</td>
                        <td className="p-4">{p.sales}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${p.status === 'active' ? 'bg-green-500/20 text-green-400' : p.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-white/50">{p.sellerName}</td>
                        <td className="p-4 text-right">
                          <button className="p-2 text-white/40 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-white/40">No products found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-3xl font-black mb-8">Orders</h2>
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.05] border-b border-white/10 text-white/50 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Buyer</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      {currentUser?.role === 'admin' && <th className="p-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-mono text-white/40">{o.id}</td>
                        <td className="p-4 font-medium">{o.productTitle}</td>
                        <td className="p-4 font-bold text-[#ff8040]">{o.price} {o.currency}</td>
                        <td className="p-4 text-white/70">{o.buyerName}</td>
                        <td className="p-4 text-white/40">{o.createdAt}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${o.status === 'completed' ? 'bg-green-500/20 text-green-400' : o.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {o.status}
                          </span>
                        </td>
                        {currentUser?.role === 'admin' && (
                          <td className="p-4 text-right space-x-2">
                            {o.status === 'pending' && (
                              <>
                                <button onClick={() => handleUpdateOrderStatus(o.id, 'completed')} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-colors">Complete</button>
                                <button onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">Cancel</button>
                              </>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-white/40">No orders found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && currentUser.role === "admin" && (
            <div>
              <h2 className="text-3xl font-black mb-8">Users</h2>
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.05] border-b border-white/10 text-white/50 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-white/10" />
                          <span className="font-bold">{u.name}</span>
                        </td>
                        <td className="p-4 text-white/50">{u.email}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-md bg-white/10 text-[10px] font-bold uppercase text-white/70">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-white/40">{u.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#080808] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="p-8">
              <h3 className="text-2xl font-black mb-6">Add New Product</h3>
              <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Product Title</label>
                  <input type="text" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} placeholder="e.g. Neon Cyberpunk City" required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Price (ETH)</label>
                  <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.5" required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Description</label>
                  <textarea value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} placeholder="Describe your asset..." rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Image URL (Optional)</label>
                  <input type="url" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#ff8040] focus:outline-none transition-colors" />
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-3 rounded-xl bg-[#ff8040] text-black font-bold hover:bg-[#ff9060] transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Publish Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
