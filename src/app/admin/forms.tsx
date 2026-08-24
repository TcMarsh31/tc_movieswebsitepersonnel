"use client";

import { useActionState, useState } from "react";
import type { TitleWithVideos, Video } from "@/lib/types";
import {
  type ActionState,
  adminLoginAction,
  createTitleAction,
  addEpisodeAction,
  updateTitleAction,
  updateVideoAction,
  deleteVideoAction,
  deleteTitleAction,
} from "./actions";

const initial: ActionState = { ok: false, message: "" };

const fieldClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2";

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

export function AddEpisodeForm({
  titleId,
  isSeries = true,
}: {
  titleId: string;
  isSeries?: boolean;
}) {
  const [state, action, pending] = useActionState(addEpisodeAction, initial);

  return (
    <form action={action} className="mt-3 space-y-3 border-t border-zinc-800 pt-3">
      <input type="hidden" name="title_id" value={titleId} />
      <p className="text-sm font-medium text-zinc-300">
        {isSeries ? "Add another episode" : "Add video file"}
      </p>
      {isSeries ? (
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            name="season_number"
            type="number"
            min={1}
            defaultValue={1}
            placeholder="Season"
            className={fieldClass}
          />
          <input
            name="episode_number"
            type="number"
            min={1}
            defaultValue={1}
            placeholder="Episode"
            className={fieldClass}
          />
          <input
            name="label"
            placeholder="Name"
            className={`${fieldClass} sm:col-span-2`}
          />
        </div>
      ) : (
        <input name="label" placeholder="Label (optional)" className={fieldClass} />
      )}
      <input
        name="drive_url"
        required
        placeholder="Google Drive link"
        className={fieldClass}
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
        {pending ? "Adding…" : isSeries ? "Add episode" : "Add video"}
      </button>
    </form>
  );
}

function EditTitleForm({ item }: { item: TitleWithVideos }) {
  const [state, action, pending] = useActionState(updateTitleAction, initial);

  return (
    <form action={action} className="mt-4 space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
      <input type="hidden" name="title_id" value={item.id} />
      <p className="text-sm font-medium text-zinc-200">Edit details</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Title</label>
          <input
            name="title"
            required
            defaultValue={item.title}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Year</label>
          <input
            name="year"
            type="number"
            min={1900}
            max={2100}
            defaultValue={item.year ?? ""}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-500">Poster URL</label>
        <input
          name="poster_url"
          defaultValue={item.poster_url ?? ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-zinc-500">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={item.description ?? ""}
          className={fieldClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={item.is_published}
          className="rounded border-zinc-600"
        />
        Published (visible on home page)
      </label>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}

function EditVideoForm({
  video,
  titleId,
  isSeries,
}: {
  video: Video;
  titleId: string;
  isSeries: boolean;
}) {
  const [state, action, pending] = useActionState(updateVideoAction, initial);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-300">
          {isSeries
            ? `S${video.season_number ?? "?"}E${video.episode_number ?? "?"} · `
            : ""}
          {video.label || (isSeries ? "Episode" : "Film file")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-zinc-600 px-2.5 py-1 text-xs text-zinc-200"
          >
            {open ? "Close" : "Edit link"}
          </button>
          <form action={deleteVideoAction}>
            <input type="hidden" name="video_id" value={video.id} />
            <input type="hidden" name="title_id" value={titleId} />
            <button
              type="submit"
              className="rounded-lg border border-red-900/60 px-2.5 py-1 text-xs text-red-300"
              onClick={(e) => {
                if (!confirm("Delete this video / episode?")) {
                  e.preventDefault();
                }
              }}
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {open ? (
        <form action={action} className="mt-3 space-y-3 border-t border-zinc-800 pt-3">
          <input type="hidden" name="video_id" value={video.id} />
          <input type="hidden" name="title_id" value={titleId} />
          <input type="hidden" name="is_series" value={isSeries ? "true" : "false"} />

          {isSeries ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Season</label>
                <input
                  name="season_number"
                  type="number"
                  min={1}
                  defaultValue={video.season_number ?? 1}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Episode</label>
                <input
                  name="episode_number"
                  type="number"
                  min={1}
                  defaultValue={video.episode_number ?? 1}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Name</label>
                <input
                  name="label"
                  defaultValue={video.label ?? ""}
                  className={fieldClass}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Label (optional)</label>
              <input
                name="label"
                defaultValue={video.label ?? ""}
                className={fieldClass}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs text-zinc-500">Google Drive link</label>
            <input
              name="drive_url"
              required
              defaultValue={video.drive_url}
              className={fieldClass}
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
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-950 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save video"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function LibraryItemCard({ item }: { item: TitleWithVideos }) {
  const [editing, setEditing] = useState(false);
  const isSeries = item.kind === "series";

  return (
    <li className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {item.kind}
            {item.year ? ` · ${item.year}` : ""}
            {!item.is_published ? " · hidden" : ""}
          </p>
          <h3 className="text-lg font-medium">{item.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {item.videos.length} file
            {item.videos.length === 1 ? "" : "s"}
          </p>
          <a
            href={`/watch/${item.id}`}
            className="mt-2 inline-block text-sm text-zinc-300 underline-offset-2 hover:underline"
          >
            Open watch page
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200"
          >
            {editing ? "Close edit" : "Edit"}
          </button>
          <form action={deleteTitleAction}>
            <input type="hidden" name="title_id" value={item.id} />
            <button
              type="submit"
              className="rounded-lg border border-red-900/60 px-3 py-1.5 text-sm text-red-300"
              onClick={(e) => {
                if (
                  !confirm(
                    `Delete "${item.title}" and all its videos? This cannot be undone.`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              Delete all
            </button>
          </form>
        </div>
      </div>

      {editing ? <EditTitleForm item={item} /> : null}

      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-zinc-300">
          {isSeries ? "Episodes" : "Video file"}
        </p>
        {item.videos.length === 0 ? (
          <p className="text-sm text-zinc-500">No files yet.</p>
        ) : (
          item.videos.map((video) => (
            <EditVideoForm
              key={video.id}
              video={video}
              titleId={item.id}
              isSeries={isSeries}
            />
          ))
        )}
      </div>

      {isSeries ? <AddEpisodeForm titleId={item.id} isSeries /> : null}
      {!isSeries && item.videos.length === 0 ? (
        <AddEpisodeForm titleId={item.id} isSeries={false} />
      ) : null}
    </li>
  );
}
