"use client";

import { useEffect, useRef, useState } from "react";

type UploadPart = { ETag: string; PartNumber: number };

function networkErrorMessage(step: string, err: unknown) {
  const base = err instanceof Error ? err.message : "Request failed";
  if (/failed to fetch|networkerror|load failed/i.test(base)) {
    if (step === "r2-put") {
      return (
        "Failed to upload to R2 (browser blocked the request). " +
        "Almost always CORS: Cloudflare → R2 → your bucket → Settings → CORS policy → " +
        "paste r2-cors.json from this project, Save, then hard-refresh Admin. " +
        "Use http://localhost:3000 (not 127.0.0.1) unless that origin is in CORS too."
      );
    }
    return (
      "Failed to reach the upload API. Is npm run dev running? " +
      "Are you logged into /admin? Try hard-refresh and log in again."
    );
  }
  return `${step}: ${base}`;
}

async function postUploadApi(body: Record<string, unknown>) {
  let response: Response;
  try {
    response = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(networkErrorMessage("api", err));
  }

  let data: {
    error?: string;
    key?: string;
    uploadId?: string;
    partSize?: number;
    url?: string;
  } = {};

  try {
    data = (await response.json()) as typeof data;
  } catch {
    throw new Error(
      `Upload API returned non-JSON (${response.status}). Check the terminal running next dev.`,
    );
  }

  if (!response.ok) {
    throw new Error(data.error || `Upload API failed (${response.status})`);
  }
  return data;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function R2Uploader({
  name = "drive_url",
  defaultValue = "",
  inputId,
}: {
  name?: string;
  defaultValue?: string;
  inputId?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<{ key: string; uploadId: string } | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  async function uploadFile(file: File) {
    setError("");
    setStatus(`Starting (${formatBytes(file.size)})…`);
    setProgress(0);
    setUploading(true);
    abortRef.current = null;

    try {
      setStatus("Creating multipart upload on R2…");
      const created = await postUploadApi({
        action: "create",
        filename: file.name,
        contentType: file.type || "video/mp4",
      });

      if (!created.key || !created.uploadId || !created.partSize) {
        throw new Error("Could not start multipart upload");
      }

      abortRef.current = { key: created.key, uploadId: created.uploadId };
      setStatus(`Upload started. Key will be: ${created.key}`);

      const partSize = created.partSize;
      const totalParts = Math.max(1, Math.ceil(file.size / partSize));
      const completed: UploadPart[] = [];
      let uploadedBytes = 0;

      const concurrency = 3;
      let nextPart = 1;

      async function uploadOne(partNumber: number) {
        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, file.size);
        const blob = file.slice(start, end);

        const signed = await postUploadApi({
          action: "sign-part",
          key: created.key,
          uploadId: created.uploadId,
          partNumber,
        });

        if (!signed.url) {
          throw new Error(`Missing signed URL for part ${partNumber}`);
        }

        let put: Response;
        try {
          // Do not set Content-Type — it can break the signature / CORS preflight.
          put = await fetch(signed.url, {
            method: "PUT",
            body: blob,
          });
        } catch (err) {
          throw new Error(networkErrorMessage("r2-put", err));
        }

        if (!put.ok) {
          const text = await put.text().catch(() => "");
          throw new Error(
            `R2 rejected part ${partNumber} (${put.status}). ${text.slice(0, 180)}`,
          );
        }

        const etag = put.headers.get("ETag") || put.headers.get("etag");
        if (!etag) {
          throw new Error(
            "R2 upload response had no ETag. CORS ExposeHeaders must include ETag. Re-apply r2-cors.json in the bucket settings.",
          );
        }

        completed.push({
          ETag: etag.replaceAll('"', ""),
          PartNumber: partNumber,
        });

        uploadedBytes += blob.size;
        const pct = Math.min(99, Math.round((uploadedBytes / file.size) * 100));
        setProgress(pct);
        setStatus(`Uploading to R2… ${completed.length}/${totalParts} parts (${pct}%)`);
      }

      const workers = Array.from(
        { length: Math.min(concurrency, totalParts) },
        async () => {
          while (nextPart <= totalParts) {
            const partNumber = nextPart;
            nextPart += 1;
            await uploadOne(partNumber);
          }
        },
      );

      await Promise.all(workers);

      setStatus("Finalizing upload on R2…");
      await postUploadApi({
        action: "complete",
        key: created.key,
        uploadId: created.uploadId,
        parts: completed.map((part) => ({
          ETag: part.ETag.includes('"') ? part.ETag : `"${part.ETag}"`,
          PartNumber: part.PartNumber,
        })),
      });

      abortRef.current = null;
      setValue(created.key);
      setProgress(100);
      setStatus(`Success — saved key: ${created.key}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setProgress(0);
      setStatus("Upload did not finish. Check Cloudflare bucket — file should NOT appear yet.");
      if (abortRef.current) {
        try {
          await postUploadApi({
            action: "abort",
            key: abortRef.current.key,
            uploadId: abortRef.current.uploadId,
          });
        } catch {
          // ignore abort errors
        }
        abortRef.current = null;
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm text-zinc-400" htmlFor={inputId ?? name}>
          Video file (R2)
        </label>
        <input
          id={inputId ?? name}
          type="text"
          name={name}
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="movies/my-film.mp4"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
      </div>

      <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/40 p-4">
        <input
          type="file"
          accept="video/*,.mp4,.m4v,.webm,.mov"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
            e.target.value = "";
          }}
          className="block w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-950"
        />
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Uploads go browser → R2 in chunks. Prefer MP4 H.264. A real upload of a
          multi‑GB movie takes minutes; if it finishes in a second, it failed.
          Success fills the key field above and shows &quot;Success — saved key&quot;.
        </p>

        {uploading || progress > 0 || status ? (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-zinc-100 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-400">{status || `${progress}%`}</p>
          </div>
        ) : null}

        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
