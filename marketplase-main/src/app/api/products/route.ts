import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as any;
  const sellerId = searchParams.get("sellerId") ?? undefined;
  return NextResponse.json(db.getProducts({ status: status || undefined, sellerId }));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (
  !body.title ||
  !body.sellerId ||
  body.price === undefined ||
  body.price === null ||
  Number.isNaN(Number(body.price))
) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const product = db.createProduct({
    title: body.title, sellerId: body.sellerId, sellerName: body.sellerName ?? "Unknown",
    price: Number(body.price), currency: body.currency ?? "ETH",
    tags: body.tags ?? [], image: body.image ?? "https://picsum.photos/seed/new/600/400",
    color: body.color ?? "#ff8040", desc: body.desc ?? "",
    format: body.format ?? "Various", license: body.license ?? "Standard",
    updated: new Date().toLocaleDateString("en", { month: "short", year: "numeric" }),
    status: body.status ?? "pending",
  });
  return NextResponse.json(product, { status: 201 });
}
