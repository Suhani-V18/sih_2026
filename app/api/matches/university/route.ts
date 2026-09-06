import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { problemId, universityId, status } = body; // status: "ACCEPTED" or "REJECTED"

    if (!problemId || !universityId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert or update ProblemUniversityMatch status in PostgreSQL
    const match = await prisma.problemUniversityMatch.upsert({
      where: {
        problemId_universityId: {
          problemId: BigInt(problemId),
          universityId: BigInt(universityId),
        },
      },
      update: {
        status,
        decidedAt: new Date(),
      },
      create: {
        problemId: BigInt(problemId),
        universityId: BigInt(universityId),
        matchScore: 0.94,
        matchReasons: ["AI Expertise Alignment", "Geographic Proximity"],
        status,
        decidedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, status: match.status });
  } catch (error) {
    console.error("Match decision API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}