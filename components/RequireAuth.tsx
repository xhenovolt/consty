"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("http://localhost/consty/api/session.php", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("unauth");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          // Optionally cache session locally
          if (typeof window !== "undefined") {
            localStorage.setItem("session", JSON.stringify(data.user));
          }
          setChecking(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setChecking(false);
          router.replace("/login");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center py-20 text-blue-600 dark:text-blue-400 font-semibold">
        Verifying session...
      </div>
    );
  }
  return <>{children}</>;
}
