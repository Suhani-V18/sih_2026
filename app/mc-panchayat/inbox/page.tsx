import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  MapPin, 
  Building, 
  ShieldCheck,
  ChevronRight,
  Filter
} from "lucide-react";

export default async function MCInboxPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Fetch LocalBody linked to the logged-in Clerk user
  const localBody = await prisma.localBody.findUnique({
    where: { clerkUserId: userId },
  });

  if (!localBody) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl max-w-md">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white mb-1">Local Body Account Not Linked</h2>
          <p className="text-xs text-slate-400 mb-4">
            We couldn't find a Local Body profile attached to your Clerk account. Please complete onboarding.
          </p>
          <Link
            href="/onboarding?role=mc_panchayat"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Complete Onboarding
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch matched problems for this Local Body
  const rawProblems = await prisma.problem.findMany({
    where: {
      OR: [
        { matchedBodyId: localBody.id },
        { submittedByBodyId: localBody.id }
      ]
    },
    include: {
      citizen: true,
      submittedByBody: true,
      project: {
        include: {
          university: true,
          department: true,
        }
      }
    },
    orderBy: { submittedAt: "desc" }
  });

  // 3. Serialize BigInts safely for Next.js
  const problems = JSON.parse(
    JSON.stringify(rawProblems, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  // Stats calculation
  const totalReceived = problems.length;
  const assignedToRD = problems.filter((p: any) => p.status === "ASSIGNED" || p.project).length;
  const highSeverityCount = problems.filter((p: any) => (p.aiSeverity ?? 0) >= 4).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-sky-500/10 p-3.5 rounded-2xl border border-sky-500/20 text-sky-400">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{localBody.name}</h1>
                {localBody.isModerator && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Moderator Access
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> District: <span className="text-slate-200 font-medium">{localBody.district}</span>
                {localBody.ward && <span>• {localBody.ward}</span>}
                {localBody.lgdCode && <span>• LGD: {localBody.lgdCode}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Jurisdiction Live Sync Active
          </div>
        </div>

        {/* Analytics Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Jurisdiction Complaints</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{totalReceived}</span>
              <FileSpreadsheet className="w-5 h-5 text-sky-400 opacity-80" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">High Severity Alerts</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-400">{highSeverityCount}</span>
              <AlertTriangle className="w-5 h-5 text-amber-400 opacity-80" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigned to University R&D</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-purple-400">{assignedToRD}</span>
              <GraduationCap className="w-5 h-5 text-purple-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* Problems Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Civic Issues Inbox <span className="text-xs font-normal text-slate-400">({problems.length})</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Sorted by Priority & Recency
            </div>
          </div>

          {problems.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              No civic issues matched to your jurisdiction yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {problems.map((problem: any) => {
                const isHighSeverity = (problem.aiSeverity ?? 0) >= 4;
                const hasProject = Boolean(problem.project);

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
                        {/* Severity Badge */}
                        {problem.aiSeverity && (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isHighSeverity
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" /> Severity {problem.aiSeverity}/5
                          </span>
                        )}

                        {/* Status Badge */}
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                          {problem.status}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                        {problem.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {problem.descriptionText}
                      </p>
                    </div>

                    {/* AI Classification & Submitter */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      <div>
                        <span className="text-slate-500 text-[11px] block">AI Category Classification</span>
                        <span className="text-slate-200 font-medium">{problem.aiCategory || "General Civil Engineering"}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-500 text-[11px] block">Submitted By</span>
                        <span className="text-slate-300 font-medium">
                          {problem.submitterType === "CITIZEN"
                            ? problem.citizen?.name || "Citizen Report"
                            : problem.submittedByBody?.name || "Local Body Official"}
                        </span>
                      </div>
                    </div>

                    {/* Attached University R&D Project Banner */}
                    {hasProject && (
                      <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-purple-200">
                              R&D Project Attached ({problem.project.stage})
                            </p>
                            <p className="text-[11px] text-purple-300/80">
                              {problem.project.university.name} • {problem.project.department?.name}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/university/projects/${problem.project.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-purple-300 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 px-3 py-1.5 rounded-lg transition-all"
                        >
                          View R&D Pitch <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}