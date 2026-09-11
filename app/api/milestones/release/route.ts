import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MilestoneStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { milestoneId } = await req.json();
    if (!milestoneId) {
      return NextResponse.json({ error: "Missing milestoneId" }, { status: 400 });
    }

    const milestoneIdBig = BigInt(milestoneId);

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneIdBig },
      include: {
        project: {
          include: { fundings: true },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    // Ownership check — only the company actually funding this project can release its milestones
    const company = await prisma.company.findUnique({ where: { clerkUserId: userId } });
    if (!company) {
      return NextResponse.json({ error: "Company profile not found" }, { status: 403 });
    }
    const isFunder = milestone.project.fundings.some((f) => f.companyId === company.id);
    if (!isFunder) {
      return NextResponse.json({ error: "You are not funding this project" }, { status: 403 });
    }

    // Only allow release from VERIFIED — adjust here if your real flow differs
    if (milestone.status !== MilestoneStatus.VERIFIED) {
      return NextResponse.json(
        { error: `Milestone must be VERIFIED before release (currently ${milestone.status})` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedMilestone = await tx.milestone.update({
        where: { id: milestoneIdBig },
        data: { status: MilestoneStatus.RELEASED, companyVerified: true },
      });

      const funding = milestone.project.fundings.find((f) => f.companyId === company.id);
      if (funding) {
        await tx.projectFunding.update({
          where: { id: funding.id },
          data: { releasedSoFar: { increment: milestone.amount } },
        });
      }

      return updatedMilestone;
    });

    return NextResponse.json({ success: true, milestone: result });
  } catch (err) {
    console.error("Milestone release error:", err);
    return NextResponse.json({ error: "Failed to release milestone" }, { status: 500 });
  }
}