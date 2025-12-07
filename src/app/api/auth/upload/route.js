import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { getUserFromCookie, unauthorizedResponse } from "./../../lib/auth";

const execPromise = promisify(exec);

async function generateUniqueVideoId(db) {
  while (true) {
    const videoId = Math.random().toString(36).substring(2, 12);
    const existing = await db.collection("videos").findOne({ videoId });

    if (!existing) {
      return videoId;
    }
  }
}

async function generateThumbnail(videoPath, thumbnailPath) {
  try {
    let totalSeconds = 10;

    try {
      const { stdout } = await execPromise(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
      );
      totalSeconds = Math.floor(parseFloat(stdout.trim()));
    } catch (err) {}

    const minTime = 2;
    const maxTime = Math.max(minTime + 1, totalSeconds - 2);
    const randomSecond = Math.floor(
      Math.random() * (maxTime - minTime) + minTime
    );

    await execPromise(
      `ffmpeg -ss ${randomSecond} -i "${videoPath}" -vframes 1 -q:v 2 "${thumbnailPath}" -y`
    );
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(request) {
  try {
    const authResult = await getUserFromCookie();

    if (!authResult) {
      return unauthorizedResponse();
    }

    const { username, db } = authResult;

    const formData = await request.formData();

    const videoFile = formData.get("video");
    const thumbnailFile = formData.get("thumbnail");
    const title = formData.get("title");
    const description = formData.get("description");
    const visibility = formData.get("visibility");
    let password = formData.get("password");

    if (visibility !== "notlisted") password = null;
    else password = password;

    if (!videoFile) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const videoId = await generateUniqueVideoId(db);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    await mkdir(uploadDir, { recursive: true });

    const videoBytes = await videoFile.arrayBuffer();
    const videoBuffer = Buffer.from(videoBytes);
    const videoExtension = videoFile.name.split(".").pop();
    const videoFileName = `${videoId}.${videoExtension}`;
    const videoPath = path.join(uploadDir, videoFileName);
    await writeFile(videoPath, videoBuffer);

    let thumbnailFileName = null;

    if (thumbnailFile) {
      const thumbnailDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "thumbnails"
      );
      await mkdir(thumbnailDir, { recursive: true });

      const thumbnailBytes = await thumbnailFile.arrayBuffer();
      const thumbnailBuffer = Buffer.from(thumbnailBytes);
      const thumbnailExtension = thumbnailFile.name.split(".").pop();
      thumbnailFileName = `${videoId}.${thumbnailExtension}`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailFileName);
      await writeFile(thumbnailPath, thumbnailBuffer);
    } else {
      const thumbnailDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "thumbnails"
      );
      await mkdir(thumbnailDir, { recursive: true });

      thumbnailFileName = `${videoId}.jpg`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailFileName);

      const success = await generateThumbnail(videoPath, thumbnailPath);
      if (!success) {
        thumbnailFileName = null;
      }
    }

    const videoData = {
      videoId,
      username,
      title,
      description: description || "",
      visibility: visibility || "public",
      password: password && password.trim() !== "" ? password : null,
      videoUrl: `/uploads/videos/${videoFileName}`,
      thumbnailUrl: thumbnailFileName
        ? `/uploads/thumbnails/${thumbnailFileName}`
        : null,
      views: 0,
      likes: 0,
      uploadedAt: new Date(),
    };

    await db.collection("videos").insertOne(videoData);

    return NextResponse.json({
      success: true,
      videoId,
      message: "Video uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload video",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
