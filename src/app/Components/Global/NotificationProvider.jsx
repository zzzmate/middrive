"use client";

import React, { createContext, useState, useCallback } from "react";
import { Notification } from "./Notification";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [config, setConfig] = useState({
    type: "",
    message: "",
    isVisible: false,
    position: "bottom-right",
  });

  const notify = useCallback((type, message, position = "bottom-right") => {
    setConfig({
      type,
      message,
      position,
      isVisible: true,
    });
  }, []);

  const hide = useCallback(() => {
    setConfig((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, hide }}>
      {children}

      <Notification
        type={config.type}
        message={config.message}
        isVisible={config.isVisible}
        position={config.position}
        onClose={hide}
      />
    </NotificationContext.Provider>
  );
}
