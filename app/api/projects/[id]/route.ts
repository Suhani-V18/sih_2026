import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeProject(p: any) {
  return {
    ...p,
    id: p.id.toString(),
    problemId: p.problemId?.toString(),
    universityId: p.universityId?.toString(),
    departmentId: p.departmentId?.toString() ?? null,
    pitchedCompanyId: p.pitchedCompanyId?.toString() ?? null,
    budgetEstimate: p.budgetEstimate?.toString() ?? null,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: BigInt(id) },
    include: {
      problem: true,
      university: true,
      department: true,
      pitchedCompany: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(serializeProject(project));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = BigInt(id);
  const body = await req.json();
  const { gate2Description, budgetEstimate, pitchDeckUrl, pitchVideoUrl } = body;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { university: { include: { members: true } } },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const isMember = project.university.members.some(
    (m) => m.clerkUserId === userId
  );
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (project.stage !== "GATE2_PITCH") {
    return NextResponse.json(
      { error: `Cannot submit Gate 2 from stage ${project.stage}` },
      { status: 409 }
    );
  }

  if (!gate2Description || !pitchDeckUrl || !pitchVideoUrl || budgetEstimate == null) {
    return NextResponse.json(
      { error: "Missing required Gate 2 fields" },
      { status: 400 }
    );
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      gate2Description,
      budgetEstimate: Number(budgetEstimate),
      pitchDeckUrl,
      pitchVideoUrl,
      stage: "GATE2_SUBMITTED",
    },
  });

  return NextResponse.json(serializeProject(updated));
}