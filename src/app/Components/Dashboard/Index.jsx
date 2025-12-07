"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Navbar from "./../Global/Navbar";
import Footer from "./../Global/Footer";
import { Notification } from "./../Global/Notification";
import VideoRow from "./VideoRow";
import { ClipLoader } from "react-spinners";
const ITEMS_PER_PAGE = 10;

export default function Index() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message, isVisible: true });
    setTimeout(() => setNotification(null), 4000);
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/auth/dashboard", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard.");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboard().finally(() => setLoading(false));
  }, []);

  const handleVisibilityChange = async (
    videoId,
    newVisibility,
    password = null
  ) => {
    try {
      const body = { videoId, newVisibility };
      if (newVisibility === "notlisted") body.password = password;
      const res = await fetch("/api/auth/dashboard", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update visibility");
      setVideos((prev) =>
        prev.map((v) =>
          v.videoId === videoId ? { ...v, visibility: newVisibility } : v
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleVideoDelete = async (videoId) => {
    try {
      const res = await fetch("/api/auth/dashboard", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      if (!res.ok) throw new Error("Failed to delete video");
      setVideos((prev) => prev.filter((v) => v.videoId !== videoId));
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title || "");
    setEditDescription(video.description || "");
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    try {
      const res = await fetch("/api/auth/dashboard", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: editingVideo.videoId,
          title: editTitle,
          description: editDescription,
        }),
      });
      if (!res.ok) throw new Error("Failed to save edits");
      setVideos((prev) =>
        prev.map((v) =>
          v.videoId === editingVideo.videoId
            ? { ...v, title: editTitle, description: editDescription }
            : v
        )
      );
      setEditModalOpen(false);
      setEditingVideo(null);
    } catch (err) {
      console.error(err);
      showNotification("error", "Failed to save edits");
    }
  };

  if (loading)
    return (
      <div className="text-white h-[100vh] flex items-center justify-center p-8 text-center">
        {" "}
        <ClipLoader size={50} color="#ffffff" />
      </div>
    );
  if (error) return <div className="text-red-400 p-8 text-center">{error}</div>;
  if (!videos.length)
    return (
      <>
        <Navbar />
        <div className="text-white font-bold p-8 text-center h-[75vh] flex items-center justify-center">
          No videos found.
        </div>
        <Footer />
      </>
    );

  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const paginatedVideos = videos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const currentUser = videos[0]?.username || "User";

  return (
    <>
      <Navbar />
      <div className="text-white p-8 mt-20 bg-[#000] min-h-screen">
        <h1 className="text-2xl font-bold mb-6">{currentUser}'s Dashboard</h1>

        <div className="bg-[#000] rounded-lg shadow-xl border border-[#171717] overflow-hidden h-full">
          <table className="min-w-full divide-y divide-[#171717]">
            <thead>
              <tr className="text-left text-neutral-400 text-sm flex">
                <th className="px-6 py-3 font-semibold flex items-center">
                  Title
                </th>
                <th className="px-6 py-3 font-semibold flex items-center">
                  Visibility
                </th>
                <th className="px-6 py-3 font-semibold flex items-center">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171717]">
              {paginatedVideos.map((video) => (
                <VideoRow
                  key={video.videoId}
                  video={video}
                  onVisibilityChange={handleVisibilityChange}
                  onVideoDelete={handleVideoDelete}
                  onEdit={openEditModal}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 border rounded ${
                currentPage === i + 1 ? "bg-white text-black" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 0.5px, transparent 1px, transparent 15px)",
            }}
          >
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="bg-black border border-white/20 rounded-md shadow-lg w-full max-w-sm">
                <div className="p-4 border-b border-[#171717] flex justify-between items-center">
                  <h3 className="font-bold text-[14px] text-white">
                    Edit Title & Description
                  </h3>
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <label className="text-white text-[13px] font-bold">
                    Title
                  </label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 outline-none py-2 bg-[#0a0a0a] border border-[#171717] rounded text-white text-[13px] font-bold"
                  />
                  <label className="text-white text-[13px] font-bold">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 outline-none bg-[#0a0a0a] border border-[#171717] rounded text-white text-[13px] font-bold"
                  />
                  <div className="flex gap-2 mt-3 justify-end">
                    <button
                      onClick={saveEdit}
                      className="px-6 bg-white text-md text-black rounded font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditModalOpen(false)}
                      className="px-3 py-1  border text-sm border-white/20 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={() => setNotification(null)}
        />
      )}
      <Footer />
    </>
  );
}
