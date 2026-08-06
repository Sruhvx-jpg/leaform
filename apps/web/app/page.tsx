import Image from "next/image";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { status } = await api.health.getHealth.query();
  return (
    <main className="min-h-screen min-w-screen flex flex-col justify-center items-center bg-black text-white p-6 font-sans">
      <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl max-w-md w-full text-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-lg shadow-emerald-500/20">
          <Image
            src="/leafform_logo.png"
            alt="LeafForm Official Logo"
            fill
            className="object-cover scale-105"
            priority
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">LeafForm</h1>
          <p className="text-sm text-neutral-400 mt-1">Smart Monorepo & Form Platform</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-950 border border-neutral-800 text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-neutral-300 font-medium">Server Status: {status}</span>
        </div>
      </div>
    </main>
  );
}
