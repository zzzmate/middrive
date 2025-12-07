import { connectToDB } from "./../../lib/mongodb";

export async function GET(req) {
  try {
    let token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split("; ").map((c) => c.split("="))
        );
        token = cookies.auth;
      }
    }

    if (!token) {
      return new Response(JSON.stringify({ valid: false }), { status: 401 });
    }

    const db = await connectToDB();
    const user = await db.collection("users").findOne({ token });

    if (!user) {
      return new Response(JSON.stringify({ valid: false }), { status: 401 });
    }

    return new Response(
      JSON.stringify({ valid: true, username: user.username }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
