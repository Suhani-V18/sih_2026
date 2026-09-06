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
    const { proposalText, pitchDeckUrl } = body;
    const projectId = BigInt(id);

    const member = await prisma.universityMember.findUnique({ where: { clerkUserId: userId } });
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!member || !project || project.universityId !== member.universityId) {
      return NextResponse.json({ error: "Project not found for your university." }, { status: 404 });
    }

    // Pull real AI-scored candidates instead of a hardcoded top-3.
    const matches = await prisma.universityCompanyMatch.findMany({
      where: { universityId: project.universityId, status: { not: "REJECTED" } },
      orderBy: { matchScore: "desc" },
      take: 10, // broadcast ceiling — tune as needed
    });

    if (matches.length === 0) {
      return NextResponse.json(
        { error: "No qualifying companies found for your university yet." },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: { stage: "GATE1_PROPOSAL", proposalText, pitchDeckUrl },
      }),
      // Create a pitch per matched company. skipDuplicates handles a
      // re-broadcast without erroring on companies already pitched.
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