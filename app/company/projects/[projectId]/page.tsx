import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  GraduationCap,
  Layers,
  FileText,
  Video,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import CSRGateActions from "@/app/company/marketplace/csr-gate-actions";
import MilestoneReleaseButton from "./milestone-release-button";

export default async function CompanyProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projectId } = await params;

  const company = await prisma.company.findUnique({
    where: { clerkUserId: userId },
  });
  if (!company) redirect("/onboarding");

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

  const isPitchedToThisCompany = rawProject.pitchedCompanyId === company.id;
  const isFundingThisProject = rawProject.fundings.some((f) => f.companyId === company.id);
  if (!isPitchedToThisCompany && !isFundingThisProject) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <p className="text-slate-400">This project isn't pitched to your company.</p>
      </div>
    );
  }

  const project = JSON.parse(
    JSON.stringify(rawProject, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/company/marketplace"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to CSR Marketplace
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  CSR Incubation Portal
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">Stage: {project.stage}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white">{project.problem?.title}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-purple-400" /> {project.university.name} • {project.department?.name}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-right">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Total Funding Required</span>
              <span className="text-xl font-extrabold text-emerald-400">
                ₹{Number(project.budgetEstimate || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <CSRGateActions
              projectId={project.id}
              companyId={company.id.toString()}
              stage={project.stage}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Review University Proposal & Pitch
          </h2>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {project.proposalText || "Basic proposal concept."}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {project.pitchDeckUrl && (
              <a
                href={project.pitchDeckUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition-all"
              >
                <FileText className="w-4 h-4 text-red-400" /> Review Pitch Deck (PDF) <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
            {project.pitchVideoUrl && (
              <a
                href={project.pitchVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition-all"
              >
                <Video className="w-4 h-4 text-indigo-400" /> Watch Video Pitch <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
          </div>
        </div>

        {(project.stage === "FUNDED" || project.stage === "IN_PROGRESS" || project.stage === "COMPLETED") && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" /> Milestone Budget & Escrow Release
            </h2>

            <div className="space-y-3">
              {project.milestones?.map((milestone: any, idx: number) => (
                <div
                  key={milestone.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-400 font-mono">Stage {idx + 1}</span>
                      <span className="text-xs font-bold text-white">{milestone.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {milestone.status}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-bold">
                      Funding Amount: ₹{Number(milestone.amount).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <MilestoneReleaseButton milestoneId={milestone.id} status={milestone.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}