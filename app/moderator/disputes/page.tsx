import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, Layers, ArrowLeft, CheckCircle2 } from "lucide-react";

export default async function DisputesPage() {
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

  // Fetch flagged or pending dispute milestones
  const rawMilestones = await prisma.milestone.findMany({
    where: {
      OR: [{ status: "FLAGGED" }, { status: "PENDING" }],
    },
    include: {
      project: {
        include: {
          university: true,
          problem: true,
        },
      },
    },
  });

  const milestones = JSON.parse(
    JSON.stringify(rawMilestones, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

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
            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Milestone Dispute Resolution</h1>
              <p className="text-xs text-slate-400">Review flagged escrow releases between Universities & Corporate Sponsors</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Active Disputes & Pending Reviews ({milestones.length})</h2>

          <div className="space-y-3">
            {milestones.map((milestone: any) => (
              <div
                key={milestone.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{milestone.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {milestone.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    University: <strong className="text-purple-300">{milestone.project?.university?.name}</strong> • Amount: <strong className="text-emerald-400">₹{Number(milestone.amount).toLocaleString('en-IN')}</strong>
                  </p>
                </div>

                <button className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20">
                  Resolve Dispute
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}