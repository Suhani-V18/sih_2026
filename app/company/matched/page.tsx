import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, ChevronRight, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";

export default async function CompanyMatchedProjectsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const company = await prisma.company.findUnique({
    where: { clerkUserId: userId },
  });

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <p className="text-slate-400">Company profile not found.</p>
      </div>
    );
  }

  // Only pitches actually sent to THIS company — not every project on the
  // platform. This is what was missing before.
  const rawPitches = await prisma.projectPitch.findMany({
    where: { companyId: company.id },
    include: {
      project: {
        include: { problem: true, university: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pitches = JSON.parse(
    JSON.stringify(rawPitches, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

  const pending = pitches.filter((p: any) => p.status === "PENDING");
  const resolved = pitches.filter((p: any) => p.status !== "PENDING");

  const statusBadge: Record<string, { icon: any; className: string; label: string }> = {
    ACCEPTED: { icon: CheckCircle2, className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "You accepted" },
    DECLINED: { icon: XCircle, className: "text-slate-400 bg-slate-800 border-slate-700", label: "You declined" },
    EXPIRED: { icon: XCircle, className: "text-slate-500 bg-slate-800/60 border-slate-700/60", label: "Went to another sponsor" },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/company/marketplace"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to CSR Marketplace
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">AI-Matched CSR Projects</h1>
              <p className="text-xs text-slate-400">
                Pitches sent to {company.name} based on domain, region, and track record
              </p>
            </div>
          </div>
        </div>

        {/* Pending — needs a response */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Awaiting your response ({pending.length})
          </h2>
          {pending.length === 0 && (
            <p className="text-xs text-slate-500 py-4">No pitches currently waiting on you.</p>
          )}
          {pending.map((pitch: any) => (
            <div
              key={pitch.id}
              className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="text-sm font-bold text-white">{pitch.project.problem?.title}</h3>
                <p className="text-xs text-purple-300 mt-0.5">{pitch.project.university?.name}</p>
                {pitch.matchScore != null && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                    {Math.round(Number(pitch.matchScore) * 100)}% Match
                  </span>
                )}
              </div>
              <Link
                href={`/company/projects/${pitch.project.id}`}
                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl transition-all shrink-0"
              >
                Review <ChevronRight className="w-4 h-4 inline" />
              </Link>
            </div>
          ))}
        </div>

        {/* Resolved — history */}
        {resolved.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              History
            </h2>
            {resolved.map((pitch: any) => {
              const badge = statusBadge[pitch.status];
              const Icon = badge?.icon;
              return (
                <div
                  key={pitch.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 opacity-80"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">{pitch.project.problem?.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{pitch.project.university?.name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {badge && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${badge.className}`}>
                        <Icon className="w-3 h-3" /> {badge.label}
                      </span>
                    )}
                    {pitch.status === "ACCEPTED" && (
                      <Link
                        href={`/company/projects/${pitch.project.id}`}
                        className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all"
                      >
                        View <ChevronRight className="w-4 h-4 inline" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}