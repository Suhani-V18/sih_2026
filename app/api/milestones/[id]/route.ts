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

    // Ownership check — only the company that owns this Clerk account may
    // act as `companyId`. Without this, anyone could pass any companyId
    // in the request body and act on someone else's behalf.
    const company = await prisma.company.findUnique({ where: { id: cId } });
    if (!company || company.clerkUserId !== userId) {
      return NextResponse.json({ error: "Not authorized for this company." }, { status: 403 });
    }

    const project = await prisma.project.findUnique({ where: { id: pId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    // Only the company this project is actually pitched to can act on it.
    if (project.pitchedCompanyId !== cId) {
      return NextResponse.json(
        { error: "This project isn't pitched to your company." },
        { status: 403 }
      );
    }

    if (action === "ACCEPT_GATE1") {
      // Company accepts Gate 1 proposal and requests Gate 2 detailed pitch
      await prisma.project.update({
        where: { id: pId },
        data: { stage: "GATE2_PITCH" },
      });
    } else if (action === "DECLINE") {
      // Send it back to the university to pick a different sponsor —
      // reset to ACCEPTED (pre-pitch) and clear the pitch link so the
      // university's recommended-companies list can surface someone else.
      await prisma.project.update({
        where: { id: pId },
        data: { stage: "ACCEPTED", pitchedCompanyId: null },
      });
    } else if (action === "APPROVE_GATE2_FUND") {
      // Company approves Gate 2 pitch and commits funding
      await prisma.project.update({
        where: { id: pId },
        data: { stage: "FUNDED" },
      });

      // Upsert ProjectFunding record
      await prisma.projectFunding.upsert({
        where: {
          projectId_companyId: { projectId: pId, companyId: cId },
        },
        update: {
          totalCommitted: project.budgetEstimate || 450000,
        },
        create: {
          projectId: pId,
          companyId: cId,
          totalCommitted: project.budgetEstimate || 450000,
          releasedSoFar: 0,
        },
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