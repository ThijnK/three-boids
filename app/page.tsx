import Background from "@/app/background";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] min-h-screen">
      <Background />
      <main className="min-h-screen flex justify-center items-center">
        <h1 className="font-extrabold text-5xl">Hi! I'm Thijn Kroon</h1>
      </main>
      <footer className=""></footer>
    </div>
  );
}
