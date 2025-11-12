"use client";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-blue-950">
        <WebsiteNavbar />
        {children}
        <footer className="w-full py-8 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 mt-12">
          <div className="mb-4 flex justify-center gap-8 text-lg font-bold">
            <Link href="#" className="hover:underline">Home</Link>
            <Link href="#about" className="hover:underline">About Us</Link>
            <Link href="#services" className="hover:underline">Services</Link>
            <Link href="#projects" className="hover:underline">Projects</Link>
            <Link href="#contact" className="hover:underline">Contact</Link>
          </div>
          <div className="mb-4 flex justify-center gap-6">
            <a href="#" className="text-blue-700 dark:text-blue-300"><i className="bi bi-facebook text-2xl"></i></a>
            <a href="#" className="text-blue-700 dark:text-blue-300"><i className="bi bi-instagram text-2xl"></i></a>
            <a href="#" className="text-blue-700 dark:text-blue-300"><i className="bi bi-linkedin text-2xl"></i></a>
            <a href="#" className="text-blue-700 dark:text-blue-300"><i className="bi bi-youtube text-2xl"></i></a>
          </div>
          <div>
            © {new Date().getFullYear()} Consty Construction. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
