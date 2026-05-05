import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// DELETE /api/cart/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.deleteCartItem(id);
  return NextResponse.json({ success: true });
}
