import { NextResponse } from "next/server";
import { getUserFromCookie, unauthorizedResponse } from "./../../lib/auth";

export async function GET() {
  const userData = await getUserFromCookie();
  if (!userData) {
    return unauthorizedResponse();
  }
  const { username, db } = userData;
  try {
    const videos = await db
      .collection("videos")
      .find({ username })
      .sort({ uploadedAt: -1 })
      .toArray();
    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch videos:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  const userData = await getUserFromCookie();
  if (!userData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { username, db } = userData;
  try {
    const body = await req.json();
    const { videoId, newVisibility, password, title, description } = body;
    if (!videoId) {
      return NextResponse.json({ message: "Missing videoId" }, { status: 400 });
    }
    const update = {};
    const unset = {};
    if (newVisibility) {
      if (newVisibility === "notlisted") {
        if (!password) {
          return NextResponse.json(
            { message: "Password required for notlisted" },
            { status: 400 }
          );
        }
        update.visibility = newVisibility;
        update.password = password;
      } else {
        update.visibility = newVisibility;
        unset.password = "";
      }
    }
    if (typeof title === "string") update.title = title;
    if (typeof description === "string") update.description = description;
    const ops = {};
    if (Object.keys(update).length) ops.$set = update;
    if (Object.keys(unset).length) ops.$unset = unset;
    if (!Object.keys(ops).length) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 }
      );
    }
    const result = await db
      .collection("videos")
      .updateOne({ videoId, username }, ops);
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Video not found or unauthorized" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Updated" }, { status: 200 });
  } catch (error) {
    console.error("Failed to update:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const userData = await getUserFromCookie();
  if (!userData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { username, db } = userData;
  try {
    const { videoId } = await req.json();
    if (!videoId) {
      return NextResponse.json({ message: "Missing videoId" }, { status: 400 });
    }
    const result = await db
      .collection("videos")
      .deleteOne({ videoId, username });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Video not found or unauthorized" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Video deleted" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete video:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
