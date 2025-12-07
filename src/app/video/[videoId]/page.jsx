"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Notification } from "../../Components/Global/Notification";
import Navbar from "./../../Components/Global/Navbar.jsx";
import Footer from "./../../Components/Global/Footer.jsx";
import { ClipLoader } from "react-spinners";
import Cookies from "js-cookie";
import VideoPlayer from "./../../Components/Video/VideoPlayer";

const formatUploadDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const PasswordModalComponent = ({
  showPasswordModal,
  error,
  handlePasswordSubmit,
  passwordLoading,
}) => {
  const [localPasswordInput, setLocalPasswordInput] = useState("");
  const modalRef = useRef(null);

  if (typeof document === "undefined") return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePasswordSubmit(localPasswordInput);
  };

  if (!showPasswordModal) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.03) 0, rgba(255, 255, 255, 0.03) 0.5px, transparent 1px, transparent 15px)",
          backgroundColor: "rgba(0,0,0,0.7)",
        }}
      >
        <motion.div
          ref={modalRef}
          className="w-96 bg-black border border-white/20 rounded-md shadow-lg overflow-hidden p-6 text-white"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <h2 className="text-xl font-bold mb-4 text-center">
            Password Required
          </h2>
          <p className="text-neutral-400 text-sm mb-6 text-center">
            This video is protected by a password. Please enter the password to
            continue viewing.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <label className="font-bold text-[14px] mt-2">Password</label>
            <input
              type="password"
              due={localPasswordInput}
              onChange={(e) => setLocalPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="bg-[#262626] hover:bg-[#131313] rounded px-3 py-3 focus:outline-none placeholder-neutral-500"
              required
            />
            {error && <p className="text-[#f87171] text-xs mt-2">{error}</p>}
            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-white text-black py-3 rounded font-semibold mt-6 hover:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? "Checking..." : "Unlock Video"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default function VideoPlayerPage() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [username, setCurrentUser] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("auth");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/validate", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.valid) setCurrentUser(data.username);
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message, isVisible: true });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchVideoData = async (passwordAttempt = null) => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (passwordAttempt) query.append("password", passwordAttempt);
    if (passwordAttempt) setPasswordLoading(true);

    try {
      const res = await fetch(`/api/auth/video/${videoId}?${query.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        if (data.isProtected) {
          setVideo(data.videoMetadata);
          setShowPasswordModal(true);
          setError(data.error);
        } else {
          setError(data.error || "Failed to load video.");
        }
        setLoading(false);
        setPasswordLoading(false);
        return;
      }

      setVideo(data.video);
      setShowPasswordModal(false);
      setLoading(false);
      setPasswordLoading(false);
      setError(null);
      if (passwordAttempt) showNotification("success", "Loading video...");
    } catch (err) {
      setError("Network error. Could not connect to server.");
      setLoading(false);
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) fetchVideoData();
  }, [videoId]);

  useEffect(() => {
    if (video) {
      if (video.visibility === "private" && username !== video.username) {
        router.push("/");
      }
    }
  }, [video, router]);

  const handlePasswordSubmit = async (password) => {
    if (!password.trim()) {
      showNotification("error", "Please enter a password.");
      return;
    }
    await fetchVideoData(password);
  };

  if (loading && !video)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl font-bold">
          <ClipLoader size={50} color="#ffffff" />
        </p>
      </div>
    );

  if (error && !showPasswordModal)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl font-bold text-[#f87171]">{error}</p>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-[80vh] bg-black text-white p-8 pt-24">
        <PasswordModalComponent
          showPasswordModal={showPasswordModal}
          error={error}
          handlePasswordSubmit={handlePasswordSubmit}
          passwordLoading={passwordLoading}
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-1 text-white uppercase">
                {video?.title || "Loading..."}
              </h1>
              <p className="text-sm text-neutral-400 mb-4">
                Uploader: <strong>{video?.username || "Unknown"}</strong> |{" "}
                {video?.uploadedAt ? formatUploadDate(video.uploadedAt) : "N/A"}
              </p>
              <div className="w-full aspect-video bg-[#0a0a0a] rounded-md overflow-hidden flex items-center justify-center">
                {video?.videoUrl && !showPasswordModal ? (
                  <VideoPlayer
                    src={video?.videoUrl}
                    poster={video?.thumbnailUrl}
                    title={video?.title}
                  />
                ) : (
                  <p className="text-lg text-neutral-500">
                    {showPasswordModal
                      ? "Enter password to view video."
                      : "Video is loading..."}
                  </p>
                )}
              </div>
              <div className="mt-2 p-4 bg-[#0a0a0a] rounded-md border border-[#171717]">
                <h3 className="text-lg font-bold mb-2">Description</h3>
                <p className="text-neutral-400 whitespace-pre-line">
                  {video?.description || "No description provided."}
                </p>
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
      <Footer />
    </>
  );
}
