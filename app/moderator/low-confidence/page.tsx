import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  FileText,
  MapPin,
  ArrowLeft,
  Filter
} from "lucide-react";

export default async function LowConfidencePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const localBody = await prisma.localBody.findUnique({
    where: { clerkUserId: userId },
  });

  if (!localBody?.isModerator) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-400 mb-4">Moderator privileges required.</p>
        <Link href="/mc-panchayat/inbox" className="text-xs text-indigo-400 hover:underline">
          Return to Inbox
        </Link>
      </div>
    );
  }

  // Fetch problems flagged for review or unmatched jurisdiction
  const rawProblems = await prisma.problem.findMany({
    where: {
      OR: [
        { needsModeratorReview: true },
        { jurisdictionMatchStatus: "UNMATCHED" },
        { status: "PENDING_REVIEW" },
      ],
    },
    include: {
      citizen: true,
      matchedBody: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  const problems = JSON.parse(
    JSON.stringify(rawProblems, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link
          href="/mc-panchayat/inbox"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Municipal Inbox
        </Link>

        {/* Header Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Low-Confidence AI Complaints Review</h1>
              <p className="text-xs text-slate-400">Human-in-the-loop validation for flagged AI classifications</p>
            </div>
          </div>
        </div>

        {/* Complaints Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Flagged Complaints Requiring Moderator Sign-Off ({problems.length})
            </h2>
          </div>

          <div className="space-y-4">
            {problems.map((problem: any) => (
              <div
                key={problem.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                  <span className="font-mono text-indigo-400 font-bold">{problem.problemCode}</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      AI Confidence: {(Number(problem.aiConfidence || 0.85) * 100).toFixed(0)}%
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {problem.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-1">{problem.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{problem.descriptionText}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span>AI Category: <strong className="text-slate-200">{problem.aiCategory || "Civil Infrastructure"}</strong></span>
                  <span>District: <strong className="text-slate-200">{problem.district}</strong></span>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20">
                    Approve AI Categorization
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}