import Link from "next/link";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { listAllTitlesForAdmin } from "@/lib/catalog";
import type { TitleWithVideos } from "@/lib/types";
import { adminLogoutAction } from "./actions";
import { CreateTitleForm, LibraryItemCard, LoginForm } from "./forms";

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
              <LibraryItemCard key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
