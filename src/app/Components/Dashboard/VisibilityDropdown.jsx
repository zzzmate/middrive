"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EllipsisVertical, Trash, Eye, Check, X } from "lucide-react";
import { Notification } from "./../Global/Notification";

export default function VisibilityDropdown({
  video,
  onVisibilityChange,
  onVideoDelete,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVis, setSelectedVis] = useState(null);
  const [password, setPassword] = useState("");
  const menuRef = useRef(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message, isVisible: true });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openChangeModal = () => {
    setSelectedVis(null);
    setPassword("");
    setIsModalOpen(true);
  };

  const chooseVis = (vis) => {
    setSelectedVis(vis);
    if (vis !== "notlisted") {
      setPassword("");
      onVisibilityChange(video.videoId, vis, null);
      setIsModalOpen(false);
    }
  };

  const saveNotlisted = () => {
    if (!password) {
      showNotification("error", "Password is required for Link Only videos.");
      return;
    }
    onVisibilityChange(video.videoId, "notlisted", password);
    setIsModalOpen(false);
  };

  const currentVisibilityText =
    video.visibility === "notlisted"
      ? "Link Only"
      : video.visibility === "private"
      ? "Private"
      : "Public";

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5 text-neutral-400" />
        <span className="capitalize">{currentVisibilityText}</span>
        <button
          className="p-1 rounded hover:bg-[#171717] focus:outline-none focus:ring-1 focus:ring-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <EllipsisVertical className="w-5 h-5" />
        </button>
      </div>

      {isMenuOpen && (
        <div
          className="absolute right-10 top-[-40] z-50 mt-2 bg-black border border-white/20 rounded-md shadow-lg text-[#fff] p-1 origin-top-right"
          style={{ minWidth: "150px" }}
        >
          <div
            className="px-3 py-2 text-sm hover:bg-[#171717] cursor-pointer rounded flex items-center gap-2"
            onClick={() => {
              openChangeModal();
              setIsMenuOpen(false);
            }}
          >
            <Eye className="w-4 h-4" />
            Change Visibility
          </div>

          <div
            className="px-3 py-2 text-sm hover:bg-[#171717] cursor-pointer rounded flex items-center gap-2 text-[#f87171]"
            onClick={() => {
              if (confirm("Are you sure you want to delete this video?")) {
                onVideoDelete(video.videoId);
              }
              setIsMenuOpen(false);
            }}
          >
            <Trash className="w-4 h-4" />
            Delete Video
          </div>
        </div>
      )}

      {isModalOpen && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 0.5px, transparent 1px, transparent 15px)",
            }}
          >
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="bg-black border border-white/20 rounded-md shadow-lg w-full max-w-sm">
                <div className="p-4 border-b border-[#171717] flex justify-between items-center">
                  <h3 className="font-bold text-[14px] text-white">
                    Change Video Visibility
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-3">
                  {["public", "notlisted", "private"].map((vis) => (
                    <button
                      key={vis}
                      onClick={() => chooseVis(vis)}
                      className={`w-full text-left px-4 py-3 rounded text-sm capitalize transition-colors duration-200 flex items-center justify-between ${
                        video.visibility === vis
                          ? "bg-white text-black font-bold"
                          : "hover:bg-[#171717]"
                      }`}
                    >
                      {vis === "notlisted"
                        ? "Link Only"
                        : vis === "private"
                        ? "Private"
                        : "Public"}
                      {video.visibility === vis && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}

                  {selectedVis === "notlisted" && (
                    <div className="mt-4">
                      <label className="block text-xs text-neutral-400 mb-2">
                        Set password for Link Only
                      </label>
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 outline-none py-2 bg-[#0a0a0a] border border-[#171717] rounded text-sm"
                        placeholder="Enter password"
                      />
                      <div className="flex gap-2 mt-5 justify-end">
                        <button
                          onClick={saveNotlisted}
                          className="px-4 py-1 bg-white text-black rounded font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVis(null);
                            setPassword("");
                            setIsModalOpen(false);
                          }}
                          className="px-4 py-1 border border-white/20 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-neutral-400 text-xs mt-4">
                    current: {video.visibility}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
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
