import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Server-only — never prefix with NEXT_PUBLIC_
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME as string;
const API_KEY = process.env.CLOUDINARY_API_KEY as string;
const API_SECRET = process.env.CLOUDINARY_API_SECRET as string;

export async function POST(req: NextRequest) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json({ error: "Cloudinary is not configured on the server." }, { status: 500 });
  }

  // Optional but recommended: rate-limit / auth-check this route so it
  // can't be hammered to mint unlimited signatures. Even a simple
  // per-IP throttle here is worth it for a public form.

  const body = await req.json().catch(() => ({}));
  const folder = body.folder === "sahyog_videos" ? "sahyog_videos" : "sahyog_submissions"; // whitelist, don't trust arbitrary input

  const timestamp = Math.round(Date.now() / 1000);

  // Only include params here that you also send in the upload —
  // the signature is computed over exactly this param set.
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };

  const sortedParamString = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(sortedParamString + API_SECRET)
    .digest("hex");

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: API_KEY,
    cloudName: CLOUD_NAME,
    folder,
  });
}