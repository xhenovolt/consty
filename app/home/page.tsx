import WebsiteNavbar from "../components/WebsiteNavbar";

export default function HomePage() {
  return (
    <div>
      <WebsiteNavbar />
      <section className="relative w-full flex flex-col items-center justify-center py-20 px-4 bg-gradient-to-r from-blue-700 to-blue-400 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-cover bg-center" style={{backgroundImage: 'url(/hero-construction.jpg)'}}></div>
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center drop-shadow-lg animate-fadeIn">Building Tomorrow, Today</h1>
          <p className="text-2xl mb-8 text-center max-w-2xl mx-auto animate-fadeIn">Innovative Construction Solutions | Quality Craftsmanship | Timely Delivery</p>
        </div>
      </section>
    </div>
  );
}