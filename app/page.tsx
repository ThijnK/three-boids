import Scene from "@/app/scene";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] min-h-screen bg-black">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0)_30%,_rgba(24,24,48,0.75)_100%)]" />
      <Scene />
    </div>
  );
}
