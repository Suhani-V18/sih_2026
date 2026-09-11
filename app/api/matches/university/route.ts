import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust to your actual prisma client path
import { ProblemMatchStatus, ProblemStatus } from "@prisma/client";

const NON_INNOVATIVE_THRESHOLD = 3;

export async function PATCH(req: Request) {
  try {
    const { problemId, universityId, status } = await req.json();

    if (!problemId || !universityId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Object.values(ProblemMatchStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const problemIdBig = BigInt(problemId);
    const universityIdBig = BigInt(universityId);

    const result = await prisma.$transaction(async (tx) => {
      const existingMatch = await tx.problemUniversityMatch.findUnique({
        where: {
          problemId_universityId: {
            problemId: problemIdBig,
            universityId: universityIdBig,
          },
        },
      });

      if (!existingMatch) {
        throw new Error("MATCH_NOT_FOUND");
      }

      const updatedMatch = await tx.problemUniversityMatch.update({
        where: {
          problemId_universityId: {
            problemId: problemIdBig,
            universityId: universityIdBig,
          },
        },
        data: { status, decidedAt: new Date() },
      });

      const wasAlreadyNonInnovative = existingMatch.status === ProblemMatchStatus.NON_INNOVATIVE;

      if (status === ProblemMatchStatus.NON_INNOVATIVE && !wasAlreadyNonInnovative) {
        const updatedProblem = await tx.problem.update({
          where: { id: problemIdBig },
          data: { nonInnovativeCount: { increment: 1 } },
        });

        if (updatedProblem.nonInnovativeCount >= NON_INNOVATIVE_THRESHOLD) {
          await tx.problem.update({
            where: { id: problemIdBig },
            data: { status: ProblemStatus.NON_INNOVATIVE },
          });
        }
      }

      if (wasAlreadyNonInnovative && status !== ProblemMatchStatus.NON_INNOVATIVE) {
        await tx.problem.update({
          where: { id: problemIdBig },
          data: { nonInnovativeCount: { decrement: 1 } },
        });
      }

      return updatedMatch;
    });

    return NextResponse.json({ success: true, match: result });
  } catch (err) {
    if (err instanceof Error && err.message === "MATCH_NOT_FOUND") {
      return NextResponse.json(
        { error: "No match exists between this problem and university" },
        { status: 404 }
      );
    }
    console.error("Match decision error:", err);
    return NextResponse.json({ error: "Failed to update match status" }, { status: 500 });
  }
}