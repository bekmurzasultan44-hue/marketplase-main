import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = db.getUserById(id);
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { password: _, ...safe } = u;
  return NextResponse.json(safe);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = db.updateUser(id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { password: _, ...safe } = updated;
  return NextResponse.json(safe);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.deleteUser(id);
  return NextResponse.json({ success: true });
}
