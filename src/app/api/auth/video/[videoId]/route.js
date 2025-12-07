import { NextResponse } from "next/server";
import { connectToDB } from "./../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { videoId } = resolvedParams;

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required in URL path. Parameter mapping failed." },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const passwordAttempt = searchParams.get("password");

  const db = await connectToDB();
  const video = await db.collection("videos").findOne({ videoId });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const videoMetadata = {
    videoId: video.videoId,
    username: video.username,
    title: video.title,
    description: video.description,
    uploadedAt: video.uploadedAt,
    thumbnailUrl: video.thumbnailUrl,
    visibility: video.visibility,
  };

  const checkedPassword = video.password && video.password.trim() !== "";
  const isProtected =
    videoMetadata.visibility === "notlisted" && checkedPassword;

  if (isProtected) {
    if (!passwordAttempt) {
      return NextResponse.json(
        {
          error: "This video is password protected.",
          isProtected: true,
        },
        { status: 403 }
      );
    }
    if (passwordAttempt !== video.password) {
      return NextResponse.json(
        {
          error: "Incorrect password. Please try again.",
          isProtected: true,
          videoMetadata,
        },
        { status: 403 }
      );
    }
  }

  const { password, ...fullVideoDetails } = video;

  return NextResponse.json({ success: true, video: fullVideoDetails });
}
