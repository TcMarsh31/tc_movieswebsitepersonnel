import { extractDriveFileId, driveStreamUrls } from "@/lib/drive";
import { getSignedR2PlayUrl, isR2Configured } from "@/lib/r2";

/** True for public https URLs or R2 object keys like movies/film.mp4 */
export function isValidMediaSource(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  // object key: no spaces, has a file-looking path
  if (/\s/.test(trimmed)) return false;
  return trimmed.length > 1;
}

/**
 * Turn a stored admin value into a browser-playable URL.
 * - https://... → use as-is (public R2 URL)
 * - movies/foo.mp4 → signed private R2 URL
 * - legacy Google Drive links → best-effort direct stream (may fail)
 */
export async function resolvePlayableUrl(
  stored: string,
): Promise<{ url: string; kind: "r2-signed" | "direct" | "drive" } | null> {
  const value = stored.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    if (/drive\.google\.com|docs\.google\.com/i.test(value)) {
      const fileId = extractDriveFileId(value);
      if (!fileId) return null;
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? null;
      const stream = driveStreamUrls(fileId, apiKey)[0];
      return stream ? { url: stream, kind: "drive" } : null;
    }
    return { url: value, kind: "direct" };
  }

  if (!isR2Configured()) {
    throw new Error(
      "R2 is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.",
    );
  }

  const url = await getSignedR2PlayUrl(value);
  return { url, kind: "r2-signed" };
}
