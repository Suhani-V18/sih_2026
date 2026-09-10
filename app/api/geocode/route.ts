import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();

  if (!query || typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "Missing address to geocode" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(
      query
    )}`;

    const res = await fetch(url, {
      headers: {
        // Nominatim requires a descriptive User-Agent - replace with your real contact
        "User-Agent": "Sahyog-CivicApp/1.0 (contact@yourdomain.com)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding service unavailable" }, { status: 502 });
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No location match found for this address" }, { status: 404 });
    }

    return NextResponse.json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name as string,
    });
  } catch (err) {
    return NextResponse.json({ error: "Geocoding request failed" }, { status: 500 });
  }
}