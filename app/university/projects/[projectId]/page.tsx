import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  GraduationCap,
  Layers,
  FileText,
  Video,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default async function UniversityProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projectId } = await params;

  // Fetch Project details
  const rawProject = await prisma.project.findUnique({
    where: { id: BigInt(projectId) },
    include: {
      problem: {
        include: { matchedBody: true },
      },
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

  // Serialize BigInts safely
  const project = JSON.parse(
    JSON.stringify(rawProject, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const isGate1 = project.stage === "GATE1_PROPOSAL" || project.stage === "ACCEPTED";
  const isGate2 = project.stage === "GATE2_PITCH";
  const isFunded = project.stage === "FUNDED" || project.stage === "IN_PROGRESS" || project.stage === "COMPLETED";

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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 mb-2 inline-block">
                Stage: {project.stage}
              </span>
              <h1 className="text-2xl font-extrabold text-white">{project.problem?.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                {project.university.name} • {project.department?.name}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-right">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Estimated Budget</span>
              <span className="text-xl font-extrabold text-emerald-400">
                ₹{Number(project.budgetEstimate || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* 2-GATE WORKFLOW PROGRESS PIPELINE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
            {/* Gate 1 */}
            <div className={`p-3 rounded-xl border ${isGate1 ? "bg-purple-950/40 border-purple-500/50 text-purple-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span>Gate 1: Basic PPT Proposal</span>
                {isGate1 ? <Clock className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] opacity-80">Submitted solution concept for corporate review</p>
            </div>

            {/* Gate 2 */}
            <div className={`p-3 rounded-xl border ${isGate2 ? "bg-purple-950/40 border-purple-500/50 text-purple-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span>Gate 2: Detailed Prototype Pitch</span>
                {isGate2 ? <Clock className="w-4 h-4 text-amber-400" /> : isFunded ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : null}
              </div>
              <p className="text-[11px] opacity-80">Pitch deck, demo video & milestone budget</p>
            </div>

            {/* Funded */}
            <div className={`p-3 rounded-xl border ${isFunded ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-500"}`}>
              <div className="flex items-center justify-between font-bold mb-1">
                <span>Milestone Escrow Workflow</span>
                {isFunded ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : null}
              </div>
              <p className="text-[11px] opacity-80">Corporate funding released per milestone proof</p>
            </div>
          </div>
        </div>

        {/* PROPOSAL TEXT & PITCH MATERIALS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" /> R&D Proposal Details
          </h2>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {project.proposalText || "No proposal text provided yet."}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {project.pitchDeckUrl && (
              <a
                href={project.pitchDeckUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition-all"
              >
                <FileText className="w-4 h-4 text-red-400" /> Gate 2 Pitch Deck (PDF) <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}

            {project.pitchVideoUrl && (
              <a
                href={project.pitchVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-200 bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition-all"
              >
                <Video className="w-4 h-4 text-indigo-400" /> Gate 2 Video Demo <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
          </div>
        </div>

        {/* MILESTONE WORKFLOW & PROOF SUBMISSION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" /> Milestone Escrow Roadmap ({project.milestones?.length || 0})
            </h2>
          </div>

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
                    Escrow Value: ₹{Number(milestone.amount).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {milestone.status === "PENDING" && (
                    <button className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-3.5 py-2 rounded-xl transition-all">
                      Submit Milestone Proof
                    </button>
                  )}
                  {milestone.status === "RELEASED" && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> Funds Released
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}