import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Building } from "lucide-react";
import GateWorkflow from "./gate-workflow";

export default async function UniversityProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projectId } = await params;

  // Fetch Project
  const rawProject = await prisma.project.findUnique({
    where: { id: BigInt(projectId) },
    include: {
      problem: true,
      university: true,
      department: true,
      milestones: { orderBy: { orderIndex: "asc" } },
      fundings: { include: { company: true } },
    },
  });

  if (!rawProject) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <p className="text-slate-400">Project not found.</p>
      </div>
    );
  }

  // Fetch AI recommended CSR companies
  const rawCompanies = await prisma.company.findMany({
    take: 3,
    orderBy: { trustScore: "desc" },
  });

  const project = JSON.parse(
    JSON.stringify(rawProject, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

  const recommendedCompanies = JSON.parse(
    JSON.stringify(rawCompanies, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Button */}
        <Link
          href="/university/shortlist"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to R&D Shortlist
        </Link>

        {/* Header Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 mb-2 inline-block">
                Stage: {project.stage}
              </span>
              <h1 className="text-2xl font-extrabold text-white">{project.problem?.title}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-purple-400" /> {project.university.name} • {project.department?.name}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-right">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Estimated Budget</span>
              <span className="text-xl font-extrabold text-emerald-400">
                ₹{Number(project.budgetEstimate || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* 🌟 PROGRESSIVE UNLOCKING GATE WORKFLOW COMPONENT */}
        <GateWorkflow
          project={project}
          recommendedCompanies={recommendedCompanies}
        />

      </div>
    </div>
  );
}