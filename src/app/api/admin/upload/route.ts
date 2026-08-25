import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import {
  abortMultipartUpload,
  buildMovieObjectKey,
  completeMultipartUpload,
  createMultipartUpload,
  getUploadPartSignedUrl,
  isR2Configured,
} from "@/lib/r2";

async function requireAdmin() {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "R2 is not configured on the server." },
      { status: 500 },
    );
  }
  return null;
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: {
    action?: string;
    filename?: string;
    contentType?: string;
    key?: string;
    uploadId?: string;
    partNumber?: number;
    parts?: { ETag: string; PartNumber: number }[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action;

  try {
    if (action === "create") {
      const filename = String(body.filename ?? "").trim();
      if (!filename) {
        return NextResponse.json({ error: "filename is required" }, { status: 400 });
      }
      const key = buildMovieObjectKey(filename);
      const created = await createMultipartUpload({
        key,
        contentType: String(body.contentType ?? "video/mp4"),
      });
      return NextResponse.json({
        key: created.key,
        uploadId: created.uploadId,
        partSize: 16 * 1024 * 1024,
      });
    }

    if (action === "sign-part") {
      const key = String(body.key ?? "").trim();
      const uploadId = String(body.uploadId ?? "").trim();
      const partNumber = Number(body.partNumber);
      if (!key || !uploadId || !Number.isInteger(partNumber) || partNumber < 1) {
        return NextResponse.json({ error: "Invalid part request" }, { status: 400 });
      }
      const url = await getUploadPartSignedUrl({ key, uploadId, partNumber });
      return NextResponse.json({ url });
    }

    if (action === "complete") {
      const key = String(body.key ?? "").trim();
      const uploadId = String(body.uploadId ?? "").trim();
      const parts = Array.isArray(body.parts) ? body.parts : [];
      if (!key || !uploadId || parts.length === 0) {
        return NextResponse.json({ error: "Invalid complete request" }, { status: 400 });
      }
      await completeMultipartUpload({ key, uploadId, parts });
      return NextResponse.json({ key, ok: true });
    }

    if (action === "abort") {
      const key = String(body.key ?? "").trim();
      const uploadId = String(body.uploadId ?? "").trim();
      if (!key || !uploadId) {
        return NextResponse.json({ error: "Invalid abort request" }, { status: 400 });
      }
      await abortMultipartUpload({ key, uploadId });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Upload API request failed",
      },
      { status: 500 },
    );
  }
}
