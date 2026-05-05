import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  let users = db.getUsers();
  if (role) users = users.filter(u => u.role === role);
  // Remove passwords from response
  return NextResponse.json(users.map(({ password: _, ...u }) => u));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.email || !body.password || !body.name || !body.role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (db.getUserByEmail(body.email)) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }
  const user = db.createUser({
    name: body.name, email: body.email, password: body.password,
    role: body.role, avatar: body.avatar ?? `https://picsum.photos/seed/${Date.now()}/200/200`,
    sales: 0, rating: 0, specialty: body.specialty ?? "",
  });
  const { password: _, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}
