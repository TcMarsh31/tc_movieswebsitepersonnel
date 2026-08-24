export type TitleKind = "film" | "series";

export type Title = {
  id: string;
  kind: TitleKind;
  title: string;
  description: string | null;
  poster_url: string | null;
  year: number | null;
  is_published: boolean;
  created_at: string;
};

export type Video = {
  id: string;
  title_id: string;
  label: string | null;
  season_number: number | null;
  episode_number: number | null;
  drive_url: string;
  sort_order: number;
  created_at: string;
};

export type TitleWithVideos = Title & {
  videos: Video[];
};
