import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const problemId = body?.problemId;
    if (!problemId) {
      return NextResponse.json({ error: "problemId is required." }, { status: 400 });
    }

    // Confirm the caller is faculty, and which university/department they belong to.
    const member = await prisma.universityMember.findUnique({ where: { clerkUserId: userId } });
    if (!member) {
      return NextResponse.json({ error: "Only registered faculty can start a proposal." }, { status: 403 });
    }

    const pId = BigInt(problemId);

    // Confirm this university actually has an ACCEPTED match on this problem.
    const match = await prisma.problemUniversityMatch.findUnique({
      where: { problemId_universityId: { problemId: pId, universityId: member.universityId } },
    });
    if (!match || match.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "No accepted match found between your university and this problem." },
        { status: 404 }
      );
    }

    // Idempotent: a double-click or refresh shouldn't create a second Project.
    const existing = await prisma.project.findUnique({ where: { problemId: pId } });
    if (existing) {
      return NextResponse.json({ projectId: existing.id.toString() });
    }

    const project = await prisma.project.create({
      data: {
        problemId: pId,
        universityId: member.universityId,
        departmentId: match.departmentId ?? member.departmentId,
        stage: "ACCEPTED",
      },
    });

    return NextResponse.json({ projectId: project.id.toString() });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
}