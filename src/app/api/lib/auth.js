import { cookies } from "next/headers";
import { connectToDB } from "./mongodb";
import { NextResponse } from "next/server";

export async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;

    if (!token) return null;

    const db = await connectToDB();
    const user = await db.collection("users").findOne({ token });

    if (!user) return null;

    return { username: user.username, userId: user._id, db };
  } catch (err) {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
