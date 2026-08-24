/** Extract a Google Drive file id from common share / view / open URLs. */
export function extractDriveFileId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
    /\/uc\?.*?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  if (/^[a-zA-Z0-9_-]{20,}$/.test(value)) return value;

  return null;
}

/** Direct stream candidates for HTML5 <video> (tried in order). */
export function driveStreamUrls(
  fileId: string,
  apiKey?: string | null,
): string[] {
  const urls: string[] = [];

  // Best when Drive API is enabled + file is "Anyone with the link"
  if (apiKey) {
    urls.push(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`,
    );
  }

  // Public Drive files often stream through googleusercontent
  urls.push(
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`,
  );

  return urls;
}

/** Google embed — desktop fallback only (weak on mobile). */
export function drivePreviewUrl(driveUrl: string): string | null {
  const fileId = extractDriveFileId(driveUrl);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function isValidDriveUrl(driveUrl: string): boolean {
  return extractDriveFileId(driveUrl) !== null;
}
