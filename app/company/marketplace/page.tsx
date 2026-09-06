import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Building2,
  Award,
  AlertTriangle,
  GraduationCap,
  FileText,
  Video,
  Layers,
  ChevronRight,
  CheckCircle2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from "lucide-react";
import CSRGateActions from "./csr-gate-actions";

export default async function CSRMarketplacePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch Company
  const company = await prisma.company.findUnique({
    where: { clerkUserId: userId },
    include: {
      fundings: { include: { project: true } }
    }
  });

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-400 mb-4">Company profile not found. Please complete onboarding.</p>
        <Link href="/onboarding?role=company" className="text-xs text-indigo-400 hover:underline">
          Complete Onboarding
        </Link>
      </div>
    );
  }

  // Fetch projects
  const rawProjects = await prisma.project.findMany({
    include: {
      problem: true,
      university: true,
      department: true,
      milestones: { orderBy: { orderIndex: "asc" } },
      fundings: { include: { company: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const projects = JSON.parse(
    JSON.stringify(rawProjects, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

  const totalCommitted = company.fundings.reduce(
    (sum, f) => sum + Number(f.totalCommitted || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Company Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{company.name}</h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Verified CSR Sponsor
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Region: <strong className="text-slate-200">{company.region}</strong></span>
                {company.companyIdValue && (
                  <span>• GSTIN: <code className="text-slate-300 font-mono">{company.companyIdValue}</code></span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 self-start md:self-auto">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">CSR Trust Score</span>
              <span className="text-lg font-black text-emerald-400">{company.trustScore}/100</span>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Available CSR Projects</p>
            <span className="text-3xl font-extrabold text-emerald-400">{projects.length}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total CSR Capital Committed</p>
            <span className="text-3xl font-extrabold text-white">₹{totalCommitted.toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Impact R&D Projects</p>
            <span className="text-3xl font-extrabold text-indigo-400">{company.successfulProjects}</span>
          </div>
        </div>

        {/* CSR Marketplace Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            AI Recommended University Pitches Seeking CSR Funding ({projects.length})
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {projects.map((project: any) => {
              const totalBudget = Number(project.budgetEstimate || 0);

              return (
                <div
                  key={project.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl group"
                >
                  {/* Top University & Stage Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500/10 p-2 rounded-xl text-purple-400">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{project.university?.name}</h4>
                        <p className="text-[11px] text-slate-400">{project.department?.name}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      Stage: {project.stage}
                    </span>
                  </div>

                  {/* Proposal Summary */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{project.problem?.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{project.proposalText}</p>
                  </div>

                  {/* Pitch Deck & Video Links */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {project.pitchDeckUrl && (
                      <a
                        href={project.pitchDeckUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-400" /> Review Gate 2 Pitch Deck (PDF) <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    )}
                    {project.pitchVideoUrl && (
                      <a
                        href={project.pitchVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Video className="w-3.5 h-3.5 text-indigo-400" /> Watch Demo Video <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    )}
                  </div>

                  {/* Interactive Gate 1 & Gate 2 Approval Control */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 block mb-0.5">
                        Total CSR Funding Required: ₹{totalBudget.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {project.stage === "GATE2_PITCH"
                          ? "Gate 2 Detailed Pitch Deck & Milestone Budget Submitted."
                          : "Gate 1 Basic Proposal Concept Submitted."}
                      </p>
                    </div>

                    <CSRGateActions
                      projectId={project.id}
                      companyId={company.id.toString()}
                      stage={project.stage}
                    />
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}