import { connectToDB } from "./../../lib/mongodb";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Missing fields." }), {
        status: 400,
      });
    }

    const db = await connectToDB();
    const user = await db.collection("users").findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return new Response(JSON.stringify({ error: "Invalid credentials." }), {
        status: 401,
      });
    }

    const token = uuidv4();
    await db.collection("users").updateOne({ username }, { $set: { token } });

    const res = new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
    res.headers.append(
      "Set-Cookie",
      `auth=${token}; Path=/; SameSite=Lax; Max-Age=604800`
    );
    return res;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
