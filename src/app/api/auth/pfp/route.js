import { connectToDB } from "./../../lib/mongodb";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req) {
  try {
    const form = await req.formData();

    const file = form.get("file");
    const username = form.get("username");

    if (!file || !username) {
      return new Response(
        JSON.stringify({ error: "Missing file or username" }),
        {
          status: 400,
        }
      );
    }

    const db = await connectToDB();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "profiles",
      username
    );
    const fileName = `default.png`;
    const uploadPath = path.join(uploadDir, fileName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(uploadPath, buffer);

    await db.collection("users").updateOne(
      { username },
      {
        $set: {
          profile_picture: `/uploads/profiles/${username}/${fileName}`,
        },
      },
      { upsert: false }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
