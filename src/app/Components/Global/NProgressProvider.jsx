"use client";

import { useEffect } from "react";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import { usePathname } from "next/navigation";

export default function NProgressProvider() {
  const pathname = usePathname();

  useEffect(() => {
    nProgress.configure({ showSpinner: false });
    nProgress.start();

    const timer = setTimeout(() => {
      nProgress.done();
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
