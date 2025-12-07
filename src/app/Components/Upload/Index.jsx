"use client";
import { useState } from "react";
import { Upload, Trash } from "lucide-react";
import { Notification } from "./../Global/Notification";
import { useRouter } from "next/navigation";

function VideoUploadPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public",
    password: "",
  });

  const [customThumbnail, setCustomThumbnail] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);

  const router = useRouter();

  const showNotification = (type, message) => {
    setNotification({ type, message, isVisible: true });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      handleVideoFile(file);
    } else if (file) {
      showNotification("error", "Please upload a valid video file");
    }
  };
  1;
  const handleVideoFile = (file) => {
    if (file.size > 2 * 1024 * 1024 * 1024) {
      showNotification("error", "File size exceeds 2GB limit");
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    showNotification("success", "Video selected successfully");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleVideoFile(file);
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setCustomThumbnail(file);
      setSelectedThumbnail(URL.createObjectURL(file));
      showNotification("success", "Thumbnail selected");
    } else if (file) {
      showNotification("error", "Please upload a valid image file");
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      showNotification("error", "Please select a video file");
      return;
    }

    if (!formData.title.trim()) {
      showNotification("error", "Please enter a video title");
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("video", videoFile);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("visibility", formData.visibility);

      if (formData.password) {
        formDataToSend.append("password", formData.password);
      }

      if (customThumbnail) {
        formDataToSend.append("thumbnail", customThumbnail);
      }

      const response = await fetch("/api/auth/upload", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        showNotification("success", "Video uploaded successfully!");

        setVideoFile(null);
        setVideoPreview(null);
        setCustomThumbnail(null);
        setSelectedThumbnail(null);
        setFormData({
          title: "",
          description: "",
          visibility: "public",
          password: "",
        });
        router.push("/dashboard/");
      } else {
        showNotification("error", result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification("error", "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 pb-0">
      <div className="max-w-7xl w-full max-md:mt-15">
        <h1 className="text-lg font-bold mb-4 text-left uppercase">
          Upload your video
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div
              className="bg-[#0a0a0a] rounded-lg p-8 flex flex-col items-center justify-center border-2 border-dashed border-[#171717] hover:border-[#252525] transition-colors cursor-pointer relative"
              style={{ minHeight: "400px" }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() =>
                !videoPreview && document.getElementById("video-input").click()
              }
            >
              {videoPreview ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <video
                    src={videoPreview}
                    controls
                    className="max-w-full max-h-80 rounded"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFile(null);
                      setVideoPreview(null);
                    }}
                    className="bg-[#2a0b0b] border-[#5c1c1c] text-[#f87171] hover:bg-[#3f1212] px-4 py-2 rounded text-sm"
                  >
                    <Trash className="w-4 h-6" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-between h-full">
                    <p className="text-white font-bold text-xl">
                      SELECT VIDEO TO UPLOAD
                    </p>
                    <p className="text-neutral-400 text-sm">
                      or drag and drop the file here
                    </p>
                    <p className="text-neutral-400 text-sm">
                      Maximum file size:{" "}
                      <span className="text-white font-bold">2 GB</span>
                    </p>
                  </div>
                </>
              )}
              <input
                id="video-input"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Video info</label>
              <input
                type="text"
                placeholder="Video Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-[#0a0a0a] text-sm border border-[#171717] rounded px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <textarea
                placeholder="Video Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="4"
                className="w-full bg-[#0a0a0a] text-sm border border-[#171717] rounded px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:border-[#171717] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                VIDEO THUMBNAIL
              </label>
              <div className="grid grid-cols-4 gap-4">
                {[].map((i) => (
                  <div
                    key={i}
                    className="aspect-video bg-[#0a0a0a] rounded border border-[#171717]"
                  />
                ))}
                {selectedThumbnail ? (
                  <label className="aspect-video bg-[#051b11] border-[#0f4c3a] text-[#4ade80] hover:bg-[#0f4c3a] rounded border flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                    <span className="text-[12px] text-neutral-400 max-md:hidden">
                      choose your own
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <label className="aspect-video bg-[#0a0a0a] rounded border border-[#171717] flex flex-col items-center justify-center cursor-pointer hover:bg-[#0a0a0a] transition-colors">
                    <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                    <span className="text-[12px] text-neutral-400 max-md:hidden">
                      choose your own
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-3 font-bold">VISIBILITY</label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === "public"}
                    onChange={(e) =>
                      setFormData({ ...formData, visibility: e.target.value })
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">
                      Public{" "}
                      <span className="text-neutral-400 text-sm font-normal">
                        (Anyone can watch this video)
                      </span>
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="notlisted"
                    checked={formData.visibility === "notlisted"}
                    onChange={(e) =>
                      setFormData({ ...formData, visibility: e.target.value })
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">
                      Not Listed{" "}
                      <span className="text-neutral-400 text-sm font-normal">
                        (Only people with the link can watch this video)
                      </span>
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={formData.visibility === "private"}
                    onChange={(e) =>
                      setFormData({ ...formData, visibility: e.target.value })
                    }
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">
                      Private{" "}
                      <span className="text-neutral-400 text-sm font-normal">
                        (Only you can watch this video)
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {formData.visibility === "notlisted" && (
              <div>
                <label className="block text-sm font-bold mb-2">
                  PASSWORD (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="Set a password to protect this video"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-[#0a0a0a] text-sm border border-[#171717] rounded px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:border-[#171717]"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Leave empty if you don't want to password protect this video.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4 gap-4">
              <button
                onClick={() => router.push("/dashboard/")}
                className="bg-white hover:bg-white/80 disabled:cursor-not-allowed text-black font-semibold px-8 py-3 rounded transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !videoFile}
                className="bg-[#0a0a0a] hover:bg-[#171717] disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded transition-colors"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default VideoUploadPage;
