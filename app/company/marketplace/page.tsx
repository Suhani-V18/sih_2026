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
  TrendingUp
} from "lucide-react";

export default async function CSRMarketplacePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Fetch Company linked to the logged-in Clerk user
  const company = await prisma.company.findUnique({
    where: { clerkUserId: userId },
    include: {
      fundings: {
        include: { project: true }
      }
    }
  });

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl max-w-md">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white mb-1">Company Profile Not Found</h2>
          <p className="text-xs text-slate-400 mb-4">
            We couldn't find a CSR company profile attached to your Clerk account. Please complete onboarding.
          </p>
          <Link
            href="/onboarding?role=company"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Complete Onboarding
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch projects ready for marketplace browsing
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

  // 3. Serialize BigInts safely
  const projects = JSON.parse(
    JSON.stringify(rawProjects, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
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
                  <span>• {company.companyIdType || 'GSTIN'}: <code className="text-slate-300 font-mono">{company.companyIdValue}</code></span>
                )}
              </p>
            </div>
          </div>

          {/* Trust Score Badge */}
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
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-400">{projects.length}</span>
              <Layers className="w-5 h-5 text-emerald-400 opacity-80" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total CSR Funds Committed</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">₹{totalCommitted.toLocaleString('en-IN')}</span>
              <TrendingUp className="w-5 h-5 text-sky-400 opacity-80" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Successful Impact Projects</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-indigo-400">{company.successfulProjects}</span>
              <CheckCircle2 className="w-5 h-5 text-indigo-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* CSR Marketplace Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              University R&D Pitches Seeking CSR Funding <span className="text-xs font-normal text-slate-400">({projects.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {projects.map((project: any) => {
              const totalBudget = Number(project.budgetEstimate || 0);
              const milestoneCount = project.milestones?.length || 0;
              const isFundedByMe = project.fundings?.some((f: any) => f.companyId === company.id.toString());

              return (
                <div
                  key={project.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all space-y-5 shadow-xl group"
                >
                  {/* Top University & Stage Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500/10 p-2 rounded-xl text-purple-400">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{project.university?.name}</h4>
                        <p className="text-[11px] text-slate-400">{project.department?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                        {project.stage}
                      </span>
                      {isFundedByMe && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          Funded by You
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Proposal Summary */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors mb-2">
                      {project.problem?.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {project.proposalText}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                      <MapPin className="w-3.5 h-3.5" /> Address: {project.problem?.addressText || `${project.problem?.district}, Ward 12`}
                    </p>
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
                        <FileText className="w-3.5 h-3.5 text-red-400" /> View Pitch Deck <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    )}
                    {project.pitchVideoUrl && (
                      <a
                        href={project.pitchVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Video className="w-3.5 h-3.5 text-indigo-400" /> Watch Video Pitch <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    )}
                  </div>

                  {/* Milestones Itemized Budget Breakdown */}
                  {milestoneCount > 0 && (
                    <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800 pb-2 mb-2">
                        <span>Milestone Budget Roadmap ({milestoneCount} Milestones)</span>
                        <span className="text-emerald-400 font-bold">Total Budget: ₹{totalBudget.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {project.milestones.map((milestone: any, index: number) => (
                          <div key={milestone.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/60 text-xs">
                            <span className="text-[10px] text-slate-500 block uppercase font-mono mb-0.5">Stage {index + 1}</span>
                            <p className="text-slate-200 font-medium truncate mb-1" title={milestone.title}>{milestone.title}</p>
                            <p className="text-emerald-400 font-bold">₹{Number(milestone.amount).toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="text-xs text-slate-400">
                      <span className="block text-slate-500 text-[11px]">CSR Domains</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {company.domains?.map((domain: string) => (
                          <span key={domain} className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                            {domain}
                          </span>
                        )) || <span className="text-slate-400">Infrastructure & Clean Water</span>}
                      </div>
                    </div>

                    <Link
                      href={`/company/projects/${project.id}`}
                      className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 shrink-0"
                    >
                      Sponsor & Fund Project <ChevronRight className="w-4 h-4" />
                    </Link>
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