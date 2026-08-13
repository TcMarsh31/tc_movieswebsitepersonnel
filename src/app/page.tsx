export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Family Movies</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Private family library
        </p>
        <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
          Your movies will show up here
        </h2>
        <p className="mt-4 max-w-lg text-lg leading-8 text-zinc-400">
          A simple place to watch family movies on phones, TVs, and computers.
          The library is empty for now — upload and playback come next.
        </p>
      </main>
    </div>
  );
}
