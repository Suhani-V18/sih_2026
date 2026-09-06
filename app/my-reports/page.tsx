import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  PlusCircle,
  AlertTriangle,
  Building,
  GraduationCap,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Layers,
  Sparkles
} from "lucide-react";

export default async function MyReportsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Fetch Citizen profile linked to the logged-in Clerk user
  const citizen = await prisma.citizen.findUnique({
    where: { clerkUserId: userId },
  });

  if (!citizen) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md shadow-xl">
          <div className="bg-indigo-500/10 p-3.5 rounded-2xl border border-indigo-500/20 text-indigo-400 w-fit mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Welcome to Sahyog Platform</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Report civic issues in your area and track AI categorization, municipal body matching, and university R&D resolutions in real-time.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" /> Report Your First Issue
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch problems reported by this citizen
  const rawProblems = await prisma.problem.findMany({
    where: { citizenId: citizen.id },
    include: {
      matchedBody: true,
      project: {
        include: {
          university: true,
          department: true,
          milestones: true,
        }
      },
      media: true,
    },
    orderBy: { submittedAt: "desc" }
  });

  // 3. Serialize BigInts safely
  const problems = JSON.parse(
    JSON.stringify(rawProblems, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const activeReportsCount = problems.filter((p: any) => p.status !== "RESOLVED").length;
  const resolvedCount = problems.filter((p: any) => p.status === "RESOLVED").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Citizen Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 p-3.5 rounded-2xl border border-indigo-500/20 text-indigo-400">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{citizen.name}</h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                  Verified Citizen
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {citizen.email || "Registered Citizen Portal User"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto">
            {/* Trust Score */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Citizen Trust Score</span>
              <span className="text-base font-black text-indigo-400">{citizen.trustScore}/100</span>
            </div>

            {/* Submit New Issue Button */}
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> Report Issue
            </Link>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Reports Submitted</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{problems.length}</span>
              <Layers className="w-5 h-5 text-indigo-400 opacity-80" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">In Active Resolution / R&D</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-400">{activeReportsCount}</span>
              <Clock className="w-5 h-5 text-amber-400 opacity-80" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Resolved Civic Issues</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-400">{resolvedCount}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* Citizen Reports Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              My Submitted Civic Complaints <span className="text-xs font-normal text-slate-400">({problems.length})</span>
            </h2>
          </div>

          {problems.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <p className="text-sm">You haven't reported any civic issues yet.</p>
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Report an Issue Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {problems.map((problem: any) => {
                const isAssignedToUniversity = Boolean(problem.project);

                return (
                  <div
                    key={problem.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all space-y-5 shadow-xl group"
                  >
                    {/* Top Meta Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                        <span className="font-semibold text-slate-200">{problem.problemCode}</span>
                        <span>•</span>
                        <span>Submitted on {new Date(problem.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {problem.aiSeverity && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                            <AlertTriangle className="w-3 h-3" /> Severity {problem.aiSeverity}/5
                          </span>
                        )}
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                          {problem.status}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                        {problem.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {problem.descriptionText}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                        <MapPin className="w-3.5 h-3.5" /> Location: {problem.addressText || `${problem.district}, Ward 12`}
                      </p>
                    </div>

                    {/* AI Classification Tag */}
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1.5 text-xs text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Category: <strong>{problem.aiCategory || "Civil & Environmental Engineering"}</strong></span>
                    </div>

                    {/* Resolution Progress Bar / Pipeline */}
                    <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolution Pipeline Progress</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Matched Local Body */}
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 flex items-center gap-3">
                          <div className="bg-sky-500/10 p-2 rounded-lg text-sky-400">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Matched Local Body</span>
                            <span className="text-slate-200 font-bold">{problem.matchedBody?.name || "Howrah Municipal Corporation"}</span>
                          </div>
                        </div>

                        {/* Assigned University R&D */}
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 flex items-center gap-3">
                          <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-semibold">Assigned R&D Partner</span>
                            <span className="text-purple-200 font-bold">
                              {isAssignedToUniversity ? problem.project.university.name : "Matching R&D Team..."}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Milestones Roadmap if Assigned */}
                      {isAssignedToUniversity && problem.project.milestones?.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-400 font-medium">R&D Solution Stage: <strong className="text-purple-300">{problem.project.stage}</strong></span>
                            <span className="text-slate-500 text-[11px]">{problem.project.milestones.length} Milestones Defined</span>
                          </div>

                          <div className="space-y-1.5">
                            {problem.project.milestones.map((milestone: any, index: number) => (
                              <div key={milestone.id} className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                                <span className="text-slate-300 font-mono text-[11px]">
                                  M{index + 1}: {milestone.title}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  {milestone.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* View Details Link */}
                    <div className="flex justify-end pt-1">
                      <Link
                        href={`/my-reports/${problem.problemCode}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-white transition-colors"
                      >
                        View Complete Ticket Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

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