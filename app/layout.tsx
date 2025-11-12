"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const isPublicPage =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/services" ||
    pathname === "/projects" ||
    pathname === "/contact";

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    let cancelled = false;
    fetch("http://localhost/consty/api/session.php", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("unauth");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          if (typeof window !== "undefined") {
            localStorage.setItem("session", JSON.stringify(data.user));
          }
          setIsSignedIn(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsSignedIn(false);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p>Loading...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 text-gray-900 dark:text-gray-100">
          <div className="flex flex-1">
            {isSignedIn && !isAuthPage && !isPublicPage && <Sidebar />}
            <div className="flex-1 flex flex-col min-h-screen">
              {isSignedIn && !isAuthPage && !isPublicPage && <Navbar />}
              <main className="flex-1 p-4 md:p-8">{children}</main>
              <Footer />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
