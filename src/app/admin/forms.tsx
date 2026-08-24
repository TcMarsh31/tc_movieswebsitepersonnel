"use client";

import { useActionState } from "react";
import {
  type ActionState,
  adminLoginAction,
  createTitleAction,
  addEpisodeAction,
} from "./actions";

const initial: ActionState = { ok: false, message: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, initial);

  return (
    <form action={action} className="mx-auto w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm text-zinc-400">
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-400"
        />
      </div>
      {state.message ? (
        <p className="text-sm text-red-400">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-950 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}

export function CreateTitleForm() {
  const [state, action, pending] = useActionState(createTitleAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-lg font-semibold">Add film or series</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-400" htmlFor="kind">
            Type
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue="film"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          >
            <option value="film">Film</option>
            <option value="series">Series</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400" htmlFor="year">
            Year (optional)
          </label>
          <input
            id="year"
            name="year"
            type="number"
            min={1900}
            max={2100}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-400" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="e.g. Finding Nemo"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-400" htmlFor="drive_url">
          Google Drive file link
        </label>
        <input
          id="drive_url"
          name="drive_url"
          required
          placeholder="https://drive.google.com/file/d/.../view"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <p className="mt-1 text-xs text-zinc-500">
          File must be shared as &quot;Anyone with the link&quot;.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-zinc-400" htmlFor="season_number">
            Season (series)
          </label>
          <input
            id="season_number"
            name="season_number"
            type="number"
            min={1}
            defaultValue={1}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400" htmlFor="episode_number">
            Episode (series)
          </label>
          <input
            id="episode_number"
            name="episode_number"
            type="number"
            min={1}
            defaultValue={1}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400" htmlFor="label">
            Episode name
          </label>
          <input
            id="label"
            name="label"
            placeholder="Optional"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-400" htmlFor="poster_url">
          Poster image URL (optional)
        </label>
        <input
          id="poster_url"
          name="poster_url"
          placeholder="https://..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-400" htmlFor="description">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
      </div>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-950 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function AddEpisodeForm({ titleId }: { titleId: string }) {
  const [state, action, pending] = useActionState(addEpisodeAction, initial);

  return (
    <form action={action} className="mt-3 space-y-3 border-t border-zinc-800 pt-3">
      <input type="hidden" name="title_id" value={titleId} />
      <p className="text-sm font-medium text-zinc-300">Add another episode</p>
      <div className="grid gap-3 sm:grid-cols-4">
        <input
          name="season_number"
          type="number"
          min={1}
          defaultValue={1}
          placeholder="Season"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <input
          name="episode_number"
          type="number"
          min={1}
          defaultValue={1}
          placeholder="Episode"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <input
          name="label"
          placeholder="Name"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 sm:col-span-2"
        />
      </div>
      <input
        name="drive_url"
        required
        placeholder="Google Drive link"
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
      />
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add episode"}
      </button>
    </form>
  );
}
