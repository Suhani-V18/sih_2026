import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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
    const { stage, proposalText, budgetEstimate, pitchDeckUrl, pitchVideoUrl, pitchedCompanyId } = body;

    const projectId = BigInt(id);

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(stage ? { stage } : {}),
        ...(proposalText ? { proposalText } : {}),
        ...(budgetEstimate ? { budgetEstimate } : {}),
        ...(pitchDeckUrl ? { pitchDeckUrl } : {}),
        ...(pitchVideoUrl ? { pitchVideoUrl } : {}),
        ...(pitchedCompanyId ? { pitchedCompanyId: BigInt(pitchedCompanyId) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      project: JSON.parse(
        JSON.stringify(updatedProject, (k, v) => (typeof v === "bigint" ? v.toString() : v))
      ),
    });
  } catch (error) {
    console.error("Project API update error:", error);
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
}