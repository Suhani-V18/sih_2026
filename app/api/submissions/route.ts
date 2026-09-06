import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // 1. Fetch or create Citizen
    let citizen = await prisma.citizen.findUnique({
      where: { clerkUserId: userId },
    });

    if (!citizen) {
      citizen = await prisma.citizen.create({
        data: {
          clerkUserId: userId,
          name: "Citizen User",
          email: "citizen@civicbridge.app",
        },
      });
    }

    const body = await req.json();
    const { inputType, title, descriptionText, audioUrl, language, location, media } = body;

    const district = location?.district || "Howrah";
    const areaType = location?.areaType === "rural" ? "RURAL" : "URBAN";

    // 2. Local Body Auto-Match
    const matchedBody = await prisma.localBody.findFirst({
      where: {
        district: { equals: district, mode: "insensitive" },
      },
    });

    const submissionId = `SUB-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const problemCode = `PRB-2026-${Date.now().toString().slice(-4)}`;

    const isRegistered = matchedBody?.isRegistered ?? false;

    // 3. Save Problem to PostgreSQL
    const newProblem = await prisma.problem.create({
      data: {
        problemCode,
        submitterType: "CITIZEN",
        citizenId: citizen.id,
        title: title || (inputType === "voice" ? `Voice Report (${district})` : "Civic Complaint"),
        descriptionType: inputType === "voice" ? "AUDIO" : "TEXT",
        descriptionText: descriptionText || null,
        descriptionAudioUrl: audioUrl || null,
        language: language || "hi",
        state: location?.state || "West Bengal",
        district,
        areaType,
        block: location?.block || null,
        ward: location?.ward || null,
        village: location?.village || null,
        pincode: location?.pincode || null,
        lat: location?.lat || 22.5958,
        lng: location?.lng || 88.2636,
        addressText: location?.addressText || `${district}, Ward 12`,
        matchedBodyId: matchedBody ? matchedBody.id : null,
        jurisdictionMatchStatus: isRegistered ? "MATCHED" : "UNMATCHED",
        aiCategory: areaType === "RURAL" ? "Rural Drinking Water & Sanitation" : "Urban Civil Infrastructure",
        aiSeverity: 4,
        aiConfidence: 0.95,
        status: "PENDING_REVIEW",

        // If local body is NOT registered, create Outreach Email Notification!
        ...(!isRegistered && matchedBody?.officialEmail
          ? {
              jurisdictionNotifications: {
                create: [
                  {
                    notifiedEmail: matchedBody.officialEmail,
                  },
                ],
              },
            }
          : {}),
      },
    });

    // 4. Save Problem Media
    if (media && Array.isArray(media) && media.length > 0) {
      await prisma.problemMedia.createMany({
        data: media.map((m: { type: string; url: string }) => ({
          problemId: newProblem.id,
          mediaType: m.type === "video" ? "VIDEO" : "IMAGE",
          url: m.url,
        })),
      });
    }

    return NextResponse.json({
      submission_id: submissionId,
      problemCode: newProblem.problemCode,
      jurisdiction_notified: !isRegistered,
      notified_email: matchedBody?.officialEmail || null,
    });
  } catch (error) {
    console.error("Submission API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}