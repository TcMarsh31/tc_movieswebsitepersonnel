import { createAnonClient, createServiceClient } from "@/lib/supabase/server";
import type { Title, TitleWithVideos, Video } from "@/lib/types";

export async function getPublishedTitles(): Promise<Title[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("titles")
    .select("*")
    .eq("is_published", true)
    .order("title", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Title[];
}

export async function getTitleWithVideos(
  id: string,
): Promise<TitleWithVideos | null> {
  const supabase = createAnonClient();
  const { data: title, error: titleError } = await supabase
    .from("titles")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (titleError) throw titleError;
  if (!title) return null;

  const { data: videos, error: videoError } = await supabase
    .from("videos")
    .select("*")
    .eq("title_id", id)
    .order("season_number", { ascending: true, nullsFirst: true })
    .order("episode_number", { ascending: true, nullsFirst: true })
    .order("sort_order", { ascending: true });

  if (videoError) throw videoError;

  return {
    ...(title as Title),
    videos: (videos ?? []) as Video[],
  };
}

export async function listAllTitlesForAdmin(): Promise<TitleWithVideos[]> {
  const supabase = createServiceClient();
  const { data: titles, error } = await supabase
    .from("titles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (titles ?? []) as Title[];
  if (rows.length === 0) return [];

  const ids = rows.map((t) => t.id);
  const { data: videos, error: videoError } = await supabase
    .from("videos")
    .select("*")
    .in("title_id", ids)
    .order("season_number", { ascending: true, nullsFirst: true })
    .order("episode_number", { ascending: true, nullsFirst: true })
    .order("sort_order", { ascending: true });

  if (videoError) throw videoError;

  const byTitle = new Map<string, Video[]>();
  for (const video of (videos ?? []) as Video[]) {
    const list = byTitle.get(video.title_id) ?? [];
    list.push(video);
    byTitle.set(video.title_id, list);
  }

  return rows.map((title) => ({
    ...title,
    videos: byTitle.get(title.id) ?? [],
  }));
}
