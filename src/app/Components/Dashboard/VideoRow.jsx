"use client";

import dayjs from "dayjs";
import VisibilityDropdown from "./VisibilityDropdown";
import { useRouter } from "next/navigation";
import { Router } from "lucide-react";

export default function VideoRow({
  video,
  onVisibilityChange,
  onVideoDelete,
  onEdit,
}) {
  const router = useRouter();
  return (
    <tr className="hover:bg-[#171717] transition-colors">
      <td className="px-6 py-4 flex items-start gap-4">
        <div className="relative w-24 h-14 bg-[#171717] flex-shrink-0 rounded overflow-hidden">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            onClick={() => router.push(`/video/${video.videoId}`)}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <div
            className="font-bold text-base cursor-pointer"
            onDoubleClick={() => onEdit(video)}
          >
            {video.title}
          </div>
          <div
            className="text-sm text-neutral-400 mt-1 cursor-pointer"
            onDoubleClick={() => onEdit(video)}
          >
            {video.description || "Add description"}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <VisibilityDropdown
          video={video}
          onVisibilityChange={onVisibilityChange}
          onVideoDelete={onVideoDelete}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="text-xs text-neutral-400">Uploaded at</div>
        <span className="font-bold">
          {dayjs(video.uploadedAt).format("YYYY. MMM. D.")}
        </span>
      </td>
    </tr>
  );
}
