// app/api/projects/[id]/broadcast/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { proposalText, pitchDeckUrl, companyIds } = body;
    // companyIds: optional string[] — if omitted, broadcast to every AI match
    const projectId = BigInt(id);

    const member = await prisma.universityMember.findUnique({ where: { clerkUserId: userId } });
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!member || !project || project.universityId !== member.universityId) {
      return NextResponse.json({ error: "Project not found for your university." }, { status: 404 });
    }

    const matches = await prisma.universityCompanyMatch.findMany({
      where: {
        universityId: project.universityId,
        status: { not: "REJECTED" },
        ...(companyIds?.length ? { companyId: { in: companyIds.map(BigInt) } } : {}),
      },
      orderBy: { matchScore: "desc" },
      take: 10,
    });

    if (matches.length === 0) {
      return NextResponse.json({ error: "No companies selected to pitch to." }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: { stage: "GATE1_PROPOSAL", proposalText, pitchDeckUrl },
      }),
      prisma.projectPitch.createMany({
        data: matches.map((m) => ({
          projectId,
          companyId: m.companyId,
          matchScore: m.matchScore,
          matchReasons: m.matchReasons,
        })),
        skipDuplicates: true,
      }),
    ]);

    return NextResponse.json({ success: true, sentTo: matches.length });
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: "Failed to broadcast." }, { status: 500 });
  }
}