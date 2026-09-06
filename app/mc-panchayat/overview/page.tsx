import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FileSpreadsheet,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  Building,
  CheckCircle2,
  ArrowLeft,
  PieChart
} from "lucide-react";

export default async function MunicipalOverviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const localBody = await prisma.localBody.findUnique({
    where: { clerkUserId: userId },
  });

  if (!localBody) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <p className="text-slate-400">Local Body profile not found.</p>
      </div>
    );
  }

  const rawProblems = await prisma.problem.findMany({
    where: { matchedBodyId: localBody.id },
    include: { project: true },
  });

  const problems = JSON.parse(
    JSON.stringify(rawProblems, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

  const total = problems.length;
  const highSeverity = problems.filter((p: any) => (p.aiSeverity ?? 0) >= 4).length;
  const assignedToRD = problems.filter((p: any) => p.project).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <Link
          href="/mc-panchayat/inbox"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Municipal Inbox
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20 text-sky-400">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">{localBody.name} Analytics</h1>
              <p className="text-xs text-slate-400">Grievance statistics and university R&D conversion metrics</p>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Complaints</p>
            <span className="text-3xl font-extrabold text-white">{total}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">High Severity Alerts</p>
            <span className="text-3xl font-extrabold text-amber-400">{highSeverity}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Converted to R&D Projects</p>
            <span className="text-3xl font-extrabold text-purple-400">{assignedToRD}</span>
          </div>
        </div>

      </div>
    </div>
  );
}