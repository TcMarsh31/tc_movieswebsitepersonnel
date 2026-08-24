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

/** Google's embedded player — most reliable on phones and TVs. */
export function drivePreviewUrl(driveUrl: string): string | null {
  const fileId = extractDriveFileId(driveUrl);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function isValidDriveUrl(driveUrl: string): boolean {
  return extractDriveFileId(driveUrl) !== null;
}
