import { getUserFromCookie, unauthorizedResponse } from "./../../lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUserFromCookie();

  if (!user) {
    return unauthorizedResponse();
  }

  return NextResponse.json({ username: user.username }, { status: 200 });
}
