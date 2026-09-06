import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  AlertTriangle,
  Lightbulb,
  FileText,
  ChevronRight,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";

export default async function UniversityShortlistPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Fetch University Member linked to the logged-in Clerk user
  const member = await prisma.universityMember.findUnique({
    where: { clerkUserId: userId },
    include: {
      university: true,
      department: true,
    },
  });

  if (!member) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl max-w-md">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white mb-1">University Profile Not Found</h2>
          <p className="text-xs text-slate-400 mb-4">
            We couldn't find an R&D member profile attached to your Clerk account. Please complete onboarding.
          </p>
          <Link
            href="/onboarding?role=university"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Complete Onboarding
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch problems open for R&D (or assigned/matched to this university)
  const rawProblems = await prisma.problem.findMany({
    where: {
      OR: [
        { status: "ASSIGNED" },
        { status: "VALIDATED" },
        { project: { universityId: member.universityId } }
      ]
    },
    include: {
      matchedBody: true,
      project: {
        include: {
          milestones: true,
          fundings: {
            include: { company: true }
          }
        }
      }
    },
    orderBy: { submittedAt: "desc" }
  });

  // 3. Serialize BigInts safely
  const problems = JSON.parse(
    JSON.stringify(rawProblems, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const activeProjectsCount = problems.filter((p: any) => p.project?.universityId === member.universityId.toString()).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Institution Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/10 p-3.5 rounded-2xl border border-purple-500/20 text-purple-400">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{member.university.name}</h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Verified Institution
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{member.name} ({member.designation || "Faculty Member"})</span>
                <span>•</span>
                <span className="text-purple-300">{member.department?.name}</span>
              </p>
            </div>
          </div>

          {/* Trust Score Badge */}
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 self-start md:self-auto">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Trust Score</span>
              <span className="text-lg font-black text-amber-400">{member.university.trustScore}/100</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active R&D Pitches</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-purple-400">{activeProjectsCount}</span>
              <Lightbulb className="w-5 h-5 text-purple-400 opacity-80" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Shortlisted Problems</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{problems.length}</span>
              <FileText className="w-5 h-5 text-sky-400 opacity-80" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Successful R&D Projects</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-400">{member.department?.successfulProjects || 8}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* Shortlisted Problems & Active R&D Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Civic Problems Shortlist for R&D <span className="text-xs font-normal text-slate-400">({problems.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {problems.map((problem: any) => {
              const myProject = problem.project?.universityId === member.universityId.toString() ? problem.project : null;

              return (
                <div
                  key={problem.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all space-y-4 shadow-lg group"
                >
                  {/* Top Meta Line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">{problem.problemCode}</span>
                      <span>•</span>
                      <span>{problem.district} {problem.ward ? `, ${problem.ward}` : ''}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {problem.aiSeverity && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          <AlertTriangle className="w-3 h-3" /> Severity {problem.aiSeverity}/5
                        </span>
                      )}
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                        {problem.aiCategory}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {problem.descriptionText}
                    </p>
                  </div>

                  {/* Local Body Jurisdiction Info */}
                  <div className="flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-sky-400" /> Local Body: <strong className="text-slate-200">{problem.matchedBody?.name || "Howrah Municipal Corporation"}</strong>
                    </span>
                    <span className="text-slate-500 text-[11px]">Status: <span className="text-emerald-400">{problem.status}</span></span>
                  </div>

                  {/* Active Proposal / Pitch Banner OR Submit Proposal Action */}
                  {myProject ? (
                    <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white">Your Active R&D Proposal</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            {myProject.stage}
                          </span>
                        </div>
                        <p className="text-xs text-purple-200/90 line-clamp-1">{myProject.proposalText}</p>
                        <p className="text-[11px] text-purple-400/80 mt-1">
                          Estimated Budget: <strong>₹{Number(myProject.budgetEstimate || 0).toLocaleString('en-IN')}</strong> • {myProject.milestones?.length || 0} Milestones Created
                        </p>
                      </div>

                      <Link
                        href={`/university/projects/${myProject.id}`}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-600/20 shrink-0"
                      >
                        Manage Pitch & Milestones <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-2">
                      <Link
                        href={`/university/projects?problemId=${problem.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 px-4 py-2 rounded-xl transition-all"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-400" /> Submit R&D Innovation Proposal
                      </Link>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}