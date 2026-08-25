import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name} in environment variables`);
  }
  return value;
}

export function isR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

function createR2Client() {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

function bucketName() {
  return requireEnv("R2_BUCKET_NAME");
}

/** Create a short-lived play URL for a private R2 object key. */
export async function getSignedR2PlayUrl(
  objectKey: string,
  expiresInSeconds = 60 * 60 * 6,
) {
  const key = objectKey.replace(/^\/+/, "").trim();
  if (!key) throw new Error("Empty R2 object key");

  const client = createR2Client();
  const command = new GetObjectCommand({
    Bucket: bucketName(),
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export function buildMovieObjectKey(filename: string) {
  const base = filename.split(/[/\\]/).pop() || "video.mp4";
  const safe = base
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `movies/${Date.now()}-${safe || "video.mp4"}`;
}

export async function createMultipartUpload(params: {
  key: string;
  contentType: string;
}) {
  const client = createR2Client();
  const result = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: bucketName(),
      Key: params.key,
      ContentType: params.contentType || "video/mp4",
    }),
  );

  if (!result.UploadId) {
    throw new Error("R2 did not return an upload id");
  }

  return { uploadId: result.UploadId, key: params.key };
}

export async function getUploadPartSignedUrl(params: {
  key: string;
  uploadId: string;
  partNumber: number;
}) {
  const client = createR2Client();
  return getSignedUrl(
    client,
    new UploadPartCommand({
      Bucket: bucketName(),
      Key: params.key,
      UploadId: params.uploadId,
      PartNumber: params.partNumber,
    }),
    { expiresIn: 60 * 60 },
  );
}

export async function completeMultipartUpload(params: {
  key: string;
  uploadId: string;
  parts: { ETag: string; PartNumber: number }[];
}) {
  const client = createR2Client();
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucketName(),
      Key: params.key,
      UploadId: params.uploadId,
      MultipartUpload: {
        Parts: [...params.parts].sort((a, b) => a.PartNumber - b.PartNumber),
      },
    }),
  );
}

export async function abortMultipartUpload(params: {
  key: string;
  uploadId: string;
}) {
  const client = createR2Client();
  await client.send(
    new AbortMultipartUploadCommand({
      Bucket: bucketName(),
      Key: params.key,
      UploadId: params.uploadId,
    }),
  );
}
