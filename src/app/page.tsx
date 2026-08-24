import Link from "next/link";
import { getPublishedTitles } from "@/lib/catalog";
import type { Title } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let titles: Title[] = [];
  let errorMessage: string | null = null;

  //test comment added
  try {
    titles = await getPublishedTitles();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Could not load the library. Check Supabase env vars.";
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Family Movies</h1>
        <Link
          href="/admin"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          Admin
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {errorMessage ? (
          <p className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
            {errorMessage}
          </p>
        ) : null}

        {!errorMessage && titles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
              Private family library
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight">
              No movies yet
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-8 text-zinc-400">
              Add a film or series from the admin page with a Google Drive link.
            </p>
            <Link
              href="/admin"
              className="mt-8 rounded-lg bg-zinc-100 px-5 py-2.5 font-medium text-zinc-950"
            >
              Open admin
            </Link>
          </div>
        ) : null}

        {titles.length > 0 ? (
          <>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">
              Watch
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {titles.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/watch/${item.id}`}
                    className="block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 transition-colors hover:border-zinc-600"
                  >
                    <div className="relative flex aspect-[2/3] items-end overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-950 p-4">
                      {item.poster_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.poster_url}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <span className="relative text-4xl font-semibold text-zinc-600">
                          {item.title.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <div className="border-t border-zinc-800 p-4">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        {item.kind}
                        {item.year ? ` · ${item.year}` : ""}
                      </p>
                      <h3 className="mt-1 text-lg font-medium leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </main>
    </div>
  );
}
