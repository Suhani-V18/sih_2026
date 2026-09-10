import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isLowConfidenceMatch, NON_INNOVATIVE_KILL_COUNT } from "@/lib/classification";

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { problemId, universityId, status } = body;

    if (!problemId || !universityId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const problemIdBig = BigInt(problemId);
    const universityIdBig = BigInt(universityId);

    if (status === "NON_INNOVATIVE") {
      const problem = await prisma.problem.findUnique({ where: { id: problemIdBig } });
      if (!problem) {
        return NextResponse.json({ error: "Problem not found" }, { status: 404 });
      }
      if (!isLowConfidenceMatch(problem.aiConfidence as unknown as number)) {
        return NextResponse.json(
          { error: "Only low-confidence AI matches can be marked non-innovative" },
          { status: 409 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const existingMatch = await tx.problemUniversityMatch.findUnique({
          where: {
            problemId_universityId: { problemId: problemIdBig, universityId: universityIdBig },
          },
        });
        const alreadyVoted = existingMatch?.status === "NON_INNOVATIVE";

        const match = await tx.problemUniversityMatch.upsert({
          where: {
            problemId_universityId: { problemId: problemIdBig, universityId: universityIdBig },
          },
          update: { status: "NON_INNOVATIVE", decidedAt: new Date() },
          create: {
            problemId: problemIdBig,
            universityId: universityIdBig,
            matchScore: problem.aiConfidence ? Number(problem.aiConfidence) : 0,
            matchReasons: [],
            status: "NON_INNOVATIVE",
            decidedAt: new Date(),
          },
        });

        if (!alreadyVoted) {
          const updatedProblem = await tx.problem.update({
            where: { id: problemIdBig },
            data: { nonInnovativeCount: { increment: 1 } },
          });

          if (updatedProblem.nonInnovativeCount >= NON_INNOVATIVE_KILL_COUNT) {
            await tx.problem.update({
              where: { id: problemIdBig },
              data: { status: "NON_INNOVATIVE" },
            });
          }
        }

        return match;
      });

      return NextResponse.json({ success: true, status: result.status });
    }

    // existing ACCEPTED / REJECTED / SUGGESTED path, unchanged
    const match = await prisma.problemUniversityMatch.upsert({
      where: {
        problemId_universityId: { problemId: problemIdBig, universityId: universityIdBig },
      },
      update: { status, decidedAt: new Date() },
      create: {
        problemId: problemIdBig,
        universityId: universityIdBig,
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