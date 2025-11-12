import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-white/80 border-t border-gray-200 py-4 px-4 md:px-8 text-center text-gray-500 text-sm shadow-inner">
      <span>
        &copy; {new Date().getFullYear()} Consty. Crafted with <span className="text-red-600">♥</span> by Xhenvolt.
      </span>
    </footer>
  );
}
