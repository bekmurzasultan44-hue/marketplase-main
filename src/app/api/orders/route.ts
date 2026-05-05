import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const buyerId = searchParams.get("buyerId") ?? undefined;
  const sellerId = searchParams.get("sellerId") ?? undefined;
  const status = searchParams.get("status") as any;
  return NextResponse.json(db.getOrders({ buyerId, sellerId, status: status || undefined }));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const product = db.getProductById(body.productId);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const buyer = db.getUserById(body.buyerId);
  if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

  const order = db.createOrder({
    buyerId: body.buyerId, buyerName: buyer.name,
    productId: product.id, productTitle: product.title,
    sellerId: product.sellerId, price: product.price,
    currency: product.currency, status: "completed",
  });
  return NextResponse.json(order, { status: 201 });
}
