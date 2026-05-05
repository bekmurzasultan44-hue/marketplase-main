import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET /api/cart?userId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  return NextResponse.json(db.getCartItems(userId));
}

// POST /api/cart
export async function POST(req: NextRequest) {
  const body = await req.json();
 if (
  !body.userId ||
  !body.productId ||
  body.price === undefined ||
  body.price === null ||
  Number.isNaN(Number(body.price))
) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const item = db.addCartItem({
    userId: body.userId,
    productId: body.productId,
    productTitle: body.productTitle ?? "Unknown Product",
    price: Number(body.price),
    currency: body.currency ?? "ETH",
    image: body.image ?? ""
  });
  return NextResponse.json(item, { status: 201 });
}

// DELETE /api/cart?userId=...
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  db.clearCart(userId);
  return NextResponse.json({ success: true });
}
