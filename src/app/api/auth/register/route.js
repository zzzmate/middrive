import { connectToDB } from "./../../lib/mongodb";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const { username, password, inviteCode } = await req.json();

    if (!username || !password || !inviteCode) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const db = await connectToDB();
    const invite = await db
      .collection("invitation_codes")
      .findOne({ code: inviteCode });

    if (!invite || invite.used) {
      return new Response(JSON.stringify({ error: "Invalid invite code" }), {
        status: 400,
      });
    }

    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username taken" }), {
        status: 400,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const token = uuidv4();

    await db.collection("users").insertOne({ username, passwordHash, token });
    await db
      .collection("invitation_codes")
      .updateOne({ code: inviteCode }, { $set: { used: true } });

    const res = new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
    res.headers.set(
      "Set-Cookie",
      `auth=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );
    return res;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
