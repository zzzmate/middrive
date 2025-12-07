"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Notification } from "./Notification";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const openLoginModal = () => {
      if (currentUser) {
        router.push("/dashboard/");
        return;
      }
      setActiveTab("login");
      setIsOpen(true);
    };

    window.addEventListener("open-login-modal", openLoginModal);

    return () => {
      window.removeEventListener("open-login-modal", openLoginModal);
    };
  }, [!!currentUser]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("auth");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/validate", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          setCurrentUser(data.username);
          setProfileImage(
            `./uploads/profiles/${data.username}/default.png?t=${Date.now()}`
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message, isVisible: true });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    const confirm = form.confirm.value;
    const invite = form.invite.value;

    if (password !== confirm)
      return showNotification("error", "Passwords do not match");

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, inviteCode: invite }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || "Registration failed");
      showNotification("success", "Registered successfully!");
      setActiveTab("login");
    } catch (err) {
      setLoading(false);
      showNotification("error", err.message);
    }
  };

  const handleLogout = async () => {
    Cookies.remove("auth");
    setCurrentUser(null);
    setProfileImage("https://i.imgur.com/GEqFlO5.png");
    showNotification("success", "Logged out successfully!");
    router.push("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || "Login failed");
      showNotification("success", "Logged in successfully!");
      setIsOpen(false);
      setCurrentUser(username);
      setProfileImage(
        `/uploads/profiles/${username}/default.png?t=${Date.now()}`
      );
      router.push("/");
    } catch (err) {
      setLoading(false);
      showNotification("error", err.message);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", currentUser);

    try {
      setLoading(true);
      const res = await fetch("/api/auth/pfp", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setProfileImage(
        `/uploads/profiles/${currentUser}/default.png?t=${Date.now()}`
      );
      showNotification("success", "Profile picture updated!");
    } catch (err) {
      showNotification("error", "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full ${
        isOpen ? "h-full" : "h-[70px]"
      } z-50 bg-transparent`}
    >
      <div className="flex items-center backdrop-blur justify-between w-full h-[70px]">
        <div className="py-1 flex items-center justify-between w-full mx-8">
          <img
            src="https://i.imgur.com/tz1weFW.png"
            className="h-7 object-contain p-1 text-white cursor-pointer"
            alt="Logo"
            onClick={() => router.push("/")}
          />

          {/* FIXED HERE */}
          <img
            src={profileImage || "https://i.imgur.com/GEqFlO5.png"}
            className="flex h-7 w-7 items-center justify-center rounded-full border bg-muted md:h-8 md:w-8 cursor-pointer"
            alt="Menu"
            onClick={() => setIsOpen(true)}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            onClick={handleClickOutside}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="w-96 bg-black border border-white/20 rounded-md shadow-lg overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {currentUser ? (
                <div className="p-6 text-white font-bold text-md text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 w-full justify-start">
                      <div className="relative group">
                        <img
                          src={profileImage}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://i.imgur.com/GEqFlO5.png";
                          }}
                          className="w-12 h-12 rounded-full object-cover border border-white/20 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => fileInputRef.current?.click()}
                          alt="Profile"
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </div>
                      <div className="text-left">
                        <span className="text-neutral-400">welcome,</span>{" "}
                        {currentUser}!
                      </div>
                    </div>

                    <div className="w-full flex justify-center gap-5 mt-2">
                      <button
                        className="bg-white text-black font-bold text-[14px] px-8 py-2 rounded hover:bg-white/80"
                        onClick={() => {
                          router.push("/dashboard/");
                          setIsOpen(false);
                        }}
                      >
                        Dashboard
                      </button>
                      <button
                        className="bg-white text-black font-bold text-[14px] px-12 py-2 rounded hover:bg-white/80"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-center gap-4 p-4 pb-0">
                    <div className="bg-[#131313] px-4 py-2 rounded flex gap-2">
                      {["login", "register", "reset"].map((tab) => (
                        <button
                          key={tab}
                          className={`rounded-md p-2.5 px-6 text-sm font-semibold transition-all ${
                            activeTab === tab ? "bg-[#262626] shadow-sm" : ""
                          }`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex flex-col text-white">
                    {activeTab === "login" && (
                      <form onSubmit={handleLogin} className="flex flex-col">
                        <label className="font-bold text-[14px] mt-4">
                          Username
                        </label>
                        <input
                          name="username"
                          type="text"
                          placeholder="Enter username"
                          className="bg-[#262626] hover:bg-[#131313] rounded px-3 py-2 focus:outline-none"
                          required
                        />
                        <label className="font-bold text-[14px] mt-4">
                          Password
                        </label>
                        <input
                          name="password"
                          type="password"
                          placeholder="Enter password"
                          className="bg-[#262626] hover:bg-[#131313] rounded px-3 py-2 focus:outline-none"
                          required
                        />
                        <div className="flex gap-2 mt-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gray-200 text-black py-2 rounded font-semibold"
                          >
                            {loading ? "Logging in..." : "Login"}
                          </button>
                          <button
                            type="button"
                            className="bg-[#262626] py-2 px-4 rounded font-semibold"
                            onClick={() => setIsOpen(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {activeTab === "register" && (
                      <form onSubmit={handleRegister} className="flex flex-col">
                        <label className="font-bold text-[14px] mt-4">
                          Username
                        </label>
                        <input
                          name="username"
                          type="text"
                          placeholder="Choose username"
                          className="bg-[#262626] hover:bg-[#131313] rounded px-3 py-2 focus:outline-none"
                          required
                        />

                        <label className="font-bold text-[14px] mt-4">
                          Invite Code
                        </label>
                        <input
                          name="invite"
                          type="text"
                          placeholder="Enter invite code"
                          className="bg-[#262626] hover:bg-[#131313] rounded px-3 py-2 focus:outline-none"
                          required
                        />

                        <label className="font-bold text-[14px] mt-4">
                          Password
                        </label>
                        <input
                          name="password"
                          type="password"
                          placeholder="Choose password"
                          className="bg-[#262626] hover:bg-[#131313] rounded px-3 py-2 focus:outline-none"
                          required
                        />

                        <label className="font-bold text-[14px] mt-4">
                          Confirm Password
                        </label>
                        <input
                          name="confirm"
                          type="password"
                          placeholder="Confirm password"
                          className="bg-[#262626] hover:bg-[#131313] rounded px-3 py-2 focus:outline-none"
                          required
                        />

                        <div className="flex gap-2 mt-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gray-200 text-black py-2 rounded font-semibold"
                          >
                            {loading ? "Registering..." : "Register"}
                          </button>
                          <button
                            type="button"
                            className="bg-[#262626] py-2 px-4 rounded font-semibold"
                            onClick={() => setIsOpen(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {activeTab === "reset" && (
                      <div className="text-white font-bold text-[14px] mt-4">
                        Reset functionality not implemented yet.
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
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
    </nav>
  );
}
