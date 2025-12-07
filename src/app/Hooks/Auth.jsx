"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/user");
        if (!res.ok) {
          router.push("/");
          return;
        }
        const data = await res.json();
        setUser(data);
        setLoading(false);
      } catch (error) {
        router.push("/");
      }
    }
    fetchUser();
  }, [router]);

  return { user, loading };
}
