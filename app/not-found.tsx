import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-5xl">🪵</div>
      <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
      <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
        This page doesn&apos;t exist — or this builder hasn&apos;t signed up yet.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95 text-sm"
        >
          Go home →
        </Link>
        <Link
          href="/explore"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Explore builders
        </Link>
      </div>
    </main>
  );
}
