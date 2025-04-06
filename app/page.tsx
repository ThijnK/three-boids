import Background from "@/app/scene";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] min-h-screen bg-black">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_30%,_rgba(24,24,48,0.75)_100%)]" />
      <Background />
      <main className="relative min-h-screen flex justify-center items-center">
        <h1 className="font-extrabold text-6xl drop-shadow-[0_0px_8px_rgba(256,256,256,0.7)] text-white">
          Hi! I'm Thijn Kroon
        </h1>
      </main>
      <footer className=""></footer>
    </div>
  );
}
