"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminLoggedIn, loginAdmin, logoutAdmin } from "@/lib/admin-auth";
import { isValidDriveUrl } from "@/lib/drive";
import { createServiceClient } from "@/lib/supabase/server";
import type { TitleKind } from "@/lib/types";

export type ActionState = {
  ok: boolean;
  message: string;
};

export async function adminLoginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  try {
    const ok = await loginAdmin(password);
    if (!ok) return { ok: false, message: "Wrong password." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Login failed.",
    };
  }
  redirect("/admin");
}

export async function adminLogoutAction() {
  await logoutAdmin();
  redirect("/admin");
}

export async function createTitleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdminLoggedIn())) {
    return { ok: false, message: "Not logged in." };
  }

  const kind = String(formData.get("kind") ?? "") as TitleKind;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const posterUrl = String(formData.get("poster_url") ?? "").trim() || null;
  const yearRaw = String(formData.get("year") ?? "").trim();
  const year = yearRaw ? Number(yearRaw) : null;
  const driveUrl = String(formData.get("drive_url") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  const seasonRaw = String(formData.get("season_number") ?? "").trim();
  const episodeRaw = String(formData.get("episode_number") ?? "").trim();

  if (kind !== "film" && kind !== "series") {
    return { ok: false, message: "Choose film or series." };
  }
  if (!title) return { ok: false, message: "Title is required." };
  if (!driveUrl) return { ok: false, message: "Drive link is required." };
  if (!isValidDriveUrl(driveUrl)) {
    return {
      ok: false,
      message: "That does not look like a Google Drive file link.",
    };
  }
  if (yearRaw && Number.isNaN(year)) {
    return { ok: false, message: "Year must be a number." };
  }

  try {
    const supabase = createServiceClient();
    const { data: created, error: titleError } = await supabase
      .from("titles")
      .insert({
        kind,
        title,
        description,
        poster_url: posterUrl,
        year,
        is_published: true,
      })
      .select("id")
      .single();

    if (titleError || !created) {
      return { ok: false, message: titleError?.message ?? "Could not create title." };
    }

    const { error: videoError } = await supabase.from("videos").insert({
      title_id: created.id,
      label: kind === "series" ? label ?? "Episode 1" : label,
      season_number: seasonRaw ? Number(seasonRaw) : kind === "series" ? 1 : null,
      episode_number: episodeRaw
        ? Number(episodeRaw)
        : kind === "series"
          ? 1
          : null,
      drive_url: driveUrl,
      sort_order: 0,
    });

    if (videoError) {
      return { ok: false, message: videoError.message };
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Create failed.",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: "Saved. It will show on the home page." };
}

export async function addEpisodeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAdminLoggedIn())) {
    return { ok: false, message: "Not logged in." };
  }

  const titleId = String(formData.get("title_id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  const driveUrl = String(formData.get("drive_url") ?? "").trim();
  const seasonRaw = String(formData.get("season_number") ?? "").trim();
  const episodeRaw = String(formData.get("episode_number") ?? "").trim();

  if (!titleId) return { ok: false, message: "Missing series id." };
  if (!driveUrl) return { ok: false, message: "Drive link is required." };
  if (!isValidDriveUrl(driveUrl)) {
    return {
      ok: false,
      message: "That does not look like a Google Drive file link.",
    };
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("videos").insert({
      title_id: titleId,
      label,
      season_number: seasonRaw ? Number(seasonRaw) : 1,
      episode_number: episodeRaw ? Number(episodeRaw) : 1,
      drive_url: driveUrl,
      sort_order: 0,
    });

    if (error) return { ok: false, message: error.message };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Add episode failed.",
    };
  }

  revalidatePath("/");
  revalidatePath(`/watch/${titleId}`);
  revalidatePath("/admin");
  return { ok: true, message: "Episode added." };
}

export async function deleteTitleAction(formData: FormData) {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin");
  }

  const titleId = String(formData.get("title_id") ?? "");
  if (!titleId) return;

  const supabase = createServiceClient();
  await supabase.from("titles").delete().eq("id", titleId);

  revalidatePath("/");
  revalidatePath("/admin");
}
