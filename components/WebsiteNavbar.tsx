import Link from "next/link";

export default function WebsiteNavbar() {
  return (
    <nav className="w-full flex justify-center py-6 bg-white dark:bg-gray-900 shadow mb-8">
      <div className="flex gap-8 text-lg font-bold items-center">
        <Link href="/">
          <img src="/consty/consty.png" alt="Consty Logo" className="h-10 w-auto mr-4" style={{display:'inline-block', verticalAlign:'middle'}} />
        </Link>
        <Link href="/" className="text-blue-700 dark:text-blue-300 hover:underline">Home</Link>
        <Link href="#about" className="text-blue-700 dark:text-blue-300 hover:underline">About</Link>
        <Link href="#services" className="text-blue-700 dark:text-blue-300 hover:underline">Services</Link>
        <Link href="#projects" className="text-blue-700 dark:text-blue-300 hover:underline">Projects</Link>
        <Link href="#contact" className="text-blue-700 dark:text-blue-300 hover:underline">Contact</Link>
        <Link href="/(auth)/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg">Login</Link>
      </div>
    </nav>
  );
}
