import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export type Role = "admin" | "seller" | "buyer";
export type ProductStatus = "active" | "pending" | "rejected";
export type OrderStatus = "pending" | "completed" | "cancelled";

export interface User {
  id: string; name: string; email: string; password: string;
  role: Role; avatar: string; createdAt: string;
  sales?: number; rating?: number; specialty?: string;
}
export interface Product {
  id: string; title: string; sellerId: string; sellerName: string;
  price: number; currency: string; tags: string[]; rating: number;
  sales: number; image: string; color: string; desc: string;
  format: string; license: string; updated: string; downloads: number;
  status: ProductStatus; createdAt: string;
}
export interface Order {
  id: string; buyerId: string; buyerName: string; productId: string;
  productTitle: string; sellerId: string; price: number; currency: string;
  status: OrderStatus; createdAt: string;
}
export interface CartItem {
  id: string; userId: string; productId: string; productTitle: string;
  price: number; currency: string; image: string;
}
export interface DB { users: User[]; products: Product[]; orders: Order[]; cart: CartItem[]; }

function readDB(): DB {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDB(db: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function genId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}`;
}

/* ─── USERS ─── */
export const db = {
  getUsers: () => readDB().users,
  getUserById: (id: string) => readDB().users.find(u => u.id === id) ?? null,
  getUserByEmail: (email: string) => readDB().users.find(u => u.email === email) ?? null,
  createUser: (data: Omit<User, "id" | "createdAt">) => {
    const store = readDB();
    const user: User = { ...data, id: genId("u"), createdAt: new Date().toISOString().slice(0, 10) };
    store.users.push(user);
    writeDB(store);
    return user;
  },
  updateUser: (id: string, data: Partial<User>) => {
    const store = readDB();
    const idx = store.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    store.users[idx] = { ...store.users[idx], ...data };
    writeDB(store);
    return store.users[idx];
  },
  deleteUser: (id: string) => {
    const store = readDB();
    store.users = store.users.filter(u => u.id !== id);
    writeDB(store);
  },

  /* ─── PRODUCTS ─── */
  getProducts: (opts?: { status?: ProductStatus; sellerId?: string }) => {
    let list = readDB().products;
    if (opts?.status) list = list.filter(p => p.status === opts.status);
    if (opts?.sellerId) list = list.filter(p => p.sellerId === opts.sellerId);
    return list;
  },
  getProductById: (id: string) => readDB().products.find(p => p.id === id) ?? null,
  createProduct: (data: Omit<Product, "id" | "createdAt" | "rating" | "sales" | "downloads">) => {
    const store = readDB();
    const product: Product = {
      ...data, id: genId("p"), rating: 0, sales: 0, downloads: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    store.products.push(product);
    writeDB(store);
    return product;
  },
  updateProduct: (id: string, data: Partial<Product>) => {
    const store = readDB();
    const idx = store.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    store.products[idx] = { ...store.products[idx], ...data };
    writeDB(store);
    return store.products[idx];
  },
  deleteProduct: (id: string) => {
    const store = readDB();
    store.products = store.products.filter(p => p.id !== id);
    writeDB(store);
  },

  /* ─── ORDERS ─── */
  getOrders: (opts?: { buyerId?: string; sellerId?: string; status?: OrderStatus }) => {
    let list = readDB().orders;
    if (opts?.buyerId) list = list.filter(o => o.buyerId === opts.buyerId);
    if (opts?.sellerId) list = list.filter(o => o.sellerId === opts.sellerId);
    if (opts?.status) list = list.filter(o => o.status === opts.status);
    return list;
  },
  createOrder: (data: Omit<Order, "id" | "createdAt">) => {
    const store = readDB();
    const order: Order = { ...data, id: genId("o"), createdAt: new Date().toISOString().slice(0, 10) };
    store.orders.push(order);
    // bump product sales
    const pidx = store.products.findIndex(p => p.id === data.productId);
    if (pidx !== -1) store.products[pidx].sales += 1;
    writeDB(store);
    return order;
  },
  updateOrder: (id: string, data: Partial<Order>) => {
    const store = readDB();
    const idx = store.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    store.orders[idx] = { ...store.orders[idx], ...data };
    writeDB(store);
    return store.orders[idx];
  },

  /* ─── CART ─── */
  getCartItems: (userId: string) => {
    return (readDB().cart || []).filter(c => c.userId === userId);
  },
  addCartItem: (data: Omit<CartItem, "id">) => {
    const store = readDB();
    if (!store.cart) store.cart = [];
    const item: CartItem = { ...data, id: genId("c") };
    store.cart.push(item);
    writeDB(store);
    return item;
  },
  deleteCartItem: (id: string) => {
    const store = readDB();
    if (!store.cart) return;
    store.cart = store.cart.filter(c => c.id !== id);
    writeDB(store);
  },
  clearCart: (userId: string) => {
    const store = readDB();
    if (!store.cart) return;
    store.cart = store.cart.filter(c => c.userId !== userId);
    writeDB(store);
  }
};