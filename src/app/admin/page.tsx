import Link from "next/link";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { listAllTitlesForAdmin } from "@/lib/catalog";
import type { TitleWithVideos } from "@/lib/types";
import { adminLogoutAction, deleteTitleAction } from "./actions";
import { AddEpisodeForm, CreateTitleForm, LoginForm } from "./forms";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const loggedIn = await isAdminLoggedIn();

  if (!loggedIn) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
        <Link href="/" className="mb-8 text-sm text-zinc-500 hover:text-zinc-300">
          ← Back to library
        </Link>
        <h1 className="mb-6 text-2xl font-semibold">Admin</h1>
        <LoginForm />
      </div>
    );
  }

  let titles: TitleWithVideos[] = [];
  let loadError: string | null = null;
  try {
    titles = await listAllTitlesForAdmin();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Could not load titles. Check SUPABASE_SERVICE_ROLE_KEY.";
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Library
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Admin</h1>
        </div>
        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300"
          >
            Log out
          </button>
        </form>
      </div>

      {loadError ? (
        <p className="mb-6 rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          {loadError}
        </p>
      ) : null}

      <CreateTitleForm />

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Your library</h2>
        {titles.length === 0 ? (
          <p className="text-zinc-500">Nothing added yet.</p>
        ) : (
          <ul className="space-y-4">
            {titles.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {item.kind}
                      {item.year ? ` · ${item.year}` : ""}
                    </p>
                    <h3 className="text-lg font-medium">{item.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {item.videos.length} file
                      {item.videos.length === 1 ? "" : "s"}
                    </p>
                    <Link
                      href={`/watch/${item.id}`}
                      className="mt-2 inline-block text-sm text-zinc-300 underline-offset-2 hover:underline"
                    >
                      Open watch page
                    </Link>
                  </div>
                  <form action={deleteTitleAction}>
                    <input type="hidden" name="title_id" value={item.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-900/60 px-3 py-1.5 text-sm text-red-300"
                    >
                      Delete
                    </button>
                  </form>
                </div>

                {item.videos.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm text-zinc-400">
                    {item.videos.map((video) => (
                      <li key={video.id}>
                        {item.kind === "series"
                          ? `S${video.season_number ?? "?"}E${video.episode_number ?? "?"} · `
                          : ""}
                        {video.label || "Video"}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {item.kind === "series" ? (
                  <AddEpisodeForm titleId={item.id} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
