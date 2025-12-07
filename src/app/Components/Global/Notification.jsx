"use client";
import React, { useEffect, useState } from "react";
import { X, Check, Loader2, AlertCircle } from "lucide-react";

export const Notification = ({
  type,
  message,
  onClose,
  isVisible,
  position = "bottom-right",
}) => {
  const [show, setShow] = useState(isVisible);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setFade(true);

      const timer = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          setShow(false);
          onClose && onClose();
        }, 300);
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setFade(false);
      setTimeout(() => setShow(false), 300);
    }
  }, [isVisible, onClose]);

  if (!show) return null;

  const config = {
    success: {
      containerClass: "bg-[#051b11] border-[#0f4c3a] text-[#4ade80]",
      icon: (
        <div className="bg-[#4ade80] rounded-full p-0.5">
          <Check size={14} className="text-[#051b11] stroke-[4]" />
        </div>
      ),
      showCloseButton: true,
    },
    loading: {
      containerClass: "bg-black border-neutral-800 text-white",
      icon: <Loader2 size={20} className="animate-spin text-neutral-400" />,
      showCloseButton: false,
    },
    error: {
      containerClass: "bg-[#2a0b0b] border-[#5c1c1c] text-[#f87171]",
      icon: (
        <AlertCircle size={20} className="text-[#f87171] fill-red-900/20" />
      ),
      showCloseButton: true,
    },
  };

  const currentConfig = config[type];

  const positionClasses = {
    "bottom-left": "fixed bottom-5 left-5",
    "bottom-right": "fixed bottom-5 right-5",
    "top-left": "fixed top-5 left-5",
    "top-right": "fixed top-5 right-5",
  };

  return (
    <div
      className={`
        ${positionClasses[position]}
        z-50 flex items-center gap-3 px-4 py-4 rounded-lg border shadow-lg
        transition-opacity duration-300
        ${fade ? "opacity-100" : "opacity-0"}
        ${currentConfig.containerClass}
      `}
    >
      {currentConfig.showCloseButton && (
        <button
          onClick={() => {
            setFade(false);
            setTimeout(() => {
              setShow(false);
              onClose && onClose();
            }, 300);
          }}
          className={`absolute -top-2 -left-2 rounded-full p-1 border shadow-sm transition-colors
            ${
              type === "success"
                ? "bg-[#051b11] border-[#0f4c3a] text-[#4ade80] hover:bg-[#0f4c3a]"
                : ""
            }
            ${
              type === "error"
                ? "bg-[#2a0b0b] border-[#5c1c1c] text-[#f87171] hover:bg-[#3f1212]"
                : ""
            }
          `}
          aria-label="Close notification"
        >
          <X size={10} />
        </button>
      )}

      <div className="flex-shrink-0 flex items-center justify-center">
        {currentConfig.icon}
      </div>

      <span className="font-semibold text-sm tracking-wide">{message}</span>
    </div>
  );
};
