import Link from "next/link";
import { notFound } from "next/navigation";
import { DrivePlayer } from "@/components/drive-player";
import { getTitleWithVideos } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v?: string }>;
};

export default async function WatchPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { v } = await searchParams;
  const item = await getTitleWithVideos(id);

  if (!item) notFound();

  const selected =
    item.videos.find((video) => video.id === v) ?? item.videos[0] ?? null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6">
      <header className="mb-6">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← All movies
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {item.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {item.kind === "series" ? "Series" : "Film"}
          {item.year ? ` · ${item.year}` : ""}
        </p>
        {item.description ? (
          <p className="mt-3 max-w-2xl text-zinc-400">{item.description}</p>
        ) : null}
      </header>

      {selected ? (
        <DrivePlayer
          driveUrl={selected.drive_url}
          title={selected.label || item.title}
        />
      ) : (
        <p className="rounded-xl border border-zinc-800 p-6 text-zinc-400">
          No video link yet for this title.
        </p>
      )}

      {item.kind === "series" && item.videos.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-medium">Episodes</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {item.videos.map((video) => {
              const active = selected?.id === video.id;
              const name =
                video.label ||
                `S${video.season_number ?? "?"}E${video.episode_number ?? "?"}`;
              return (
                <li key={video.id}>
                  <Link
                    href={`/watch/${item.id}?v=${video.id}`}
                    className={`block rounded-lg border px-4 py-3 text-sm transition-colors ${
                      active
                        ? "border-zinc-400 bg-zinc-800 text-zinc-50"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-xs text-zinc-500">
                      S{video.season_number ?? "?"}E
                      {video.episode_number ?? "?"}
                    </span>
                    <span className="mt-0.5 block font-medium">{name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
