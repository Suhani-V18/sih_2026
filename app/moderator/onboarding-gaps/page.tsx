
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ShieldCheck,
  MailWarning,
  Building,
  AlertTriangle,
  Send,
  Clock,
  CheckCircle2,
  FileText,
  MapPin,
  ArrowLeft
} from "lucide-react";

export default async function OnboardingGapsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 1. Verify Moderator Access (User must belong to a Local Body with isModerator: true)
  const localBody = await prisma.localBody.findUnique({
    where: { clerkUserId: userId },
  });

  if (!localBody?.isModerator) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl max-w-md">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white mb-1">Moderator Access Required</h2>
          <p className="text-xs text-slate-400 mb-4">
            Only designated moderator local bodies (e.g. Howrah Municipal Corporation) can access the Onboarding Gaps portal.
          </p>
          <Link href="/mc-panchayat/inbox" className="text-xs text-indigo-400 hover:underline">
            Return to Inbox
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch Unregistered Local Bodies & Dispatched Outreach Notifications
  const rawUnregistered = await prisma.localBody.findMany({
    where: { isRegistered: false },
    orderBy: { createdAt: "desc" },
  });

  const rawNotifications = await prisma.jurisdictionNotification.findMany({
    include: {
      problem: true,
    },
    orderBy: { notifiedAt: "desc" },
  });

  // Serialize BigInts safely
  const unregisteredBodies = JSON.parse(
    JSON.stringify(rawUnregistered, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

  const notifications = JSON.parse(
    JSON.stringify(rawNotifications, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Button */}
        <Link
          href="/mc-panchayat/inbox"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Municipal Inbox
        </Link>

        {/* Header Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Outreach & Onboarding Gaps</h1>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Moderator Privileges
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Managed by {localBody.name} • Monitoring unregistered authorities and automated email notifications
              </p>
            </div>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Unregistered Authorities</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-400">{unregisteredBodies.length}</span>
              <Building className="w-5 h-5 text-amber-400 opacity-80" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Outreach Emails Dispatched</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-sky-400">{notifications.length}</span>
              <MailWarning className="w-5 h-5 text-sky-400 opacity-80" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Grievances Pending Onboarding</p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-indigo-400">{notifications.length}</span>
              <Clock className="w-5 h-5 text-indigo-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* Unregistered Local Bodies Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" /> Unregistered Municipalities & Panchayats
          </h2>

          <div className="space-y-3">
            {unregisteredBodies.map((body: any) => (
              <div
                key={body.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{body.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {body.bodyType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    District: <strong className="text-slate-200">{body.district}</strong> • Official Email: <code className="text-indigo-300 font-mono">{body.officialEmail}</code>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                    Registration Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatched Outreach Email Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MailWarning className="w-5 h-5 text-sky-400" /> Automated Outreach Email Log
          </h2>

          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1 font-mono">
                    <span className="text-slate-400">Target: <strong className="text-slate-200">{notif.notifiedEmail}</strong></span>
                    <span>•</span>
                    <span className="text-indigo-400 font-semibold">{notif.problem?.problemCode}</span>
                  </div>
                  <p className="text-slate-300 line-clamp-1">{notif.problem?.title}</p>
                </div>

                <span className="text-[11px] text-slate-500 shrink-0">
                  Sent: {new Date(notif.notifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}