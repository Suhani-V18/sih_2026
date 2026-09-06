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
    const { projectId, companyId, action } = body;
    // action: "ACCEPT_GATE1" | "DECLINE" | "APPROVE_GATE2_FUND"

    if (!projectId || !companyId || !action) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const pId = BigInt(projectId);
    const cId = BigInt(companyId);

    const company = await prisma.company.findUnique({ where: { id: cId } });
    if (!company || company.clerkUserId !== userId) {
      return NextResponse.json({ error: "Not authorized for this company." }, { status: 403 });
    }

    if (action === "ACCEPT_GATE1") {
      const pitch = await prisma.projectPitch.findUnique({
        where: { projectId_companyId: { projectId: pId, companyId: cId } },
      });
      if (!pitch || pitch.status !== "PENDING") {
        return NextResponse.json({ error: "This pitch is no longer open." }, { status: 409 });
      }

      // Atomic lock: only succeeds if no one has won yet. The WHERE clause
      // (pitchedCompanyId: null) is what prevents two companies both
      // "winning" if they click accept at the same moment.
      const result = await prisma.project.updateMany({
        where: { id: pId, pitchedCompanyId: null },
        data: { pitchedCompanyId: cId, stage: "GATE2_PITCH" },
      });

      if (result.count === 0) {
        // Someone else already won the race between your read and write.
        await prisma.projectPitch.update({
          where: { id: pitch.id },
          data: { status: "EXPIRED", respondedAt: new Date() },
        });
        return NextResponse.json(
          { error: "Another company already accepted this project." },
          { status: 409 }
        );
      }

      await prisma.$transaction([
        prisma.projectPitch.update({
          where: { id: pitch.id },
          data: { status: "ACCEPTED", respondedAt: new Date() },
        }),
        // Everyone else who hadn't responded yet loses the opportunity.
        prisma.projectPitch.updateMany({
          where: { projectId: pId, status: "PENDING", id: { not: pitch.id } },
          data: { status: "EXPIRED", respondedAt: new Date() },
        }),
      ]);
    } else if (action === "DECLINE") {
      const pitch = await prisma.projectPitch.findUnique({
        where: { projectId_companyId: { projectId: pId, companyId: cId } },
      });
      if (!pitch || pitch.status !== "PENDING") {
        return NextResponse.json({ error: "This pitch is no longer open." }, { status: 409 });
      }
      await prisma.projectPitch.update({
        where: { id: pitch.id },
        data: { status: "DECLINED", respondedAt: new Date() },
      });
    } else if (action === "APPROVE_GATE2_FUND") {
      const project = await prisma.project.findUnique({ where: { id: pId } });
      if (!project || project.pitchedCompanyId !== cId) {
        return NextResponse.json({ error: "You didn't win this project's Gate 1." }, { status: 403 });
      }

      await prisma.project.update({ where: { id: pId }, data: { stage: "FUNDED" } });
      await prisma.projectFunding.upsert({
        where: { projectId_companyId: { projectId: pId, companyId: cId } },
        update: { totalCommitted: project.budgetEstimate || 450000 },
        create: { projectId: pId, companyId: cId, totalCommitted: project.budgetEstimate || 450000, releasedSoFar: 0 },
      });
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("Company match action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}