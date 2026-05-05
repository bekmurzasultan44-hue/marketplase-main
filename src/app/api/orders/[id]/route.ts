import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/orders/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const order = db.updateOrder(id, { status: body.status });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
