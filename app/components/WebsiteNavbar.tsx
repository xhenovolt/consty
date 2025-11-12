import Link from "next/link";

export default function WebsiteNavbar({ onOpenAuth }: { onOpenAuth: (mode: 'login'|'signup') => void }) {
  return (
     <nav className="w-full flex justify-between py-2 bg-gradient-to-br from-gray-50 to-blue-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 text-gray-900 dark:text-gray-100 shadow mb-8">
      <div className="flex gap-2 text-lg font-bold items-center justify-between w-full max-w-6xl px-4">
        <div className="mx-4">
          <Link href="/" className="flex items-center gap-2 mr-28">
            <img src="/consty/consty.png" alt="Consty Logo" className="h-10 w-auto" style={{display:'inline-block', verticalAlign:'middle'}} />
            <span className="text-2xl font-extrabold text-[#0a2e57] tracking-wide">Consty</span>
          </Link>
        </div>
          
        <div className="flex gap-8 text-lg font-bold items-center justify-between  max-w-6xl">
        <Link href="/" className="text-blue-700 dark:text-blue-300 hover:underline">Home</Link>
        <Link href="/about" className="text-blue-700 dark:text-blue-300 hover:underline">About</Link>
        <Link href="/services" className="text-blue-700 dark:text-blue-300 hover:underline">Services</Link>
        <Link href="/our-projects" className="text-blue-700 dark:text-blue-300 hover:underline">Projects</Link>
        <Link href="/contact" className="text-blue-700 dark:text-blue-300 hover:underline">Contact</Link>
        <button onClick={()=>onOpenAuth('login')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-xl shadow transition text-lg">Login</button>
        </div>
      </div>
    </nav>
  );
}