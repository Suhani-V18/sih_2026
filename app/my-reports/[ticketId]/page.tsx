import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  AlertTriangle,
  Building,
  GraduationCap,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  FileText,
  Volume2,
  Image as ImageIcon,
  Video,
  MailWarning,
  ShieldCheck,
  Layers
} from "lucide-react";

export default async function CitizenTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { ticketId } = await params;

  // Search problem by problemCode or BigInt ID
  const rawProblem = await prisma.problem.findFirst({
    where: {
      OR: [
        { problemCode: ticketId },
        { id: isNaN(Number(ticketId)) ? BigInt(-1) : BigInt(ticketId) },
      ],
    },
    include: {
      matchedBody: true,
      citizen: true,
      media: true,
      jurisdictionNotifications: true,
      project: {
        include: {
          university: true,
          department: true,
          milestones: { orderBy: { orderIndex: "asc" } },
          fundings: { include: { company: true } },
        },
      },
    },
  });

  if (!rawProblem) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-400 mb-4">Ticket not found.</p>
        <Link href="/my-reports" className="text-xs text-indigo-400 hover:underline">
          Return to My Reports
        </Link>
      </div>
    );
  }

  // Serialize BigInts safely
  const problem = JSON.parse(
    JSON.stringify(rawProblem, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const hasProject = Boolean(problem.project);
  const isUnregisteredOutreach = problem.jurisdictionNotifications?.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link
          href="/my-reports"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Reports
        </Link>

        {/* Header Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  {problem.problemCode}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Submitted {new Date(problem.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{problem.title}</h1>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              {problem.aiSeverity && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Severity {problem.aiSeverity}/5
                </span>
              )}
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200">
                {problem.status}
              </span>
            </div>
          </div>
        </div>

        {/* AI CLASSIFICATION & LOCATION CARD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">AI Category Classification</span>
            <p className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> {problem.aiCategory || "Civil Infrastructure"}
            </p>
            {problem.aiConfidence && (
              <span className="text-[11px] text-slate-400 block pt-1">
                AI Match Confidence: <strong className="text-slate-200">{(Number(problem.aiConfidence) * 100).toFixed(1)}%</strong>
              </span>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Jurisdiction Address</span>
            <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" /> {problem.addressText || `${problem.district}, Ward 12`}
            </p>
            <p className="text-[11px] text-slate-400">
              State: {problem.state || "West Bengal"} • District: {problem.district} {problem.ward ? `• ${problem.ward}` : ""}
            </p>
          </div>
        </div>

        {/* PROBLEM DESCRIPTION & MEDIA ATTACHMENTS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Submitted Complaint Details
          </h2>

          {problem.descriptionText && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              {problem.descriptionText}
            </div>
          )}

          {/* Voice Audio Player if Voice Recording */}
          {problem.descriptionAudioUrl && (
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4 flex items-center gap-3 text-xs text-indigo-200">
              <Volume2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold block">Voice Recording Attached ({problem.language || "hi"})</span>
                <audio controls src={problem.descriptionAudioUrl} className="mt-2 h-8 w-full max-w-xs" />
              </div>
            </div>
          )}

          {/* Media Attachments */}
          {problem.media?.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-400 block">Attached Media Files</span>
              <div className="flex flex-wrap gap-3">
                {problem.media.map((m: any) => (
                  <a
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-300 transition-all"
                  >
                    {m.mediaType === "VIDEO" ? <Video className="w-4 h-4 text-purple-400" /> : <ImageIcon className="w-4 h-4 text-sky-400" />}
                    <span>View {m.mediaType}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* JURISDICTION & OUTREACH NOTIFICATION STATUS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-sky-400" /> Jurisdiction & Outreach Status
          </h2>

          {problem.matchedBody ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-semibold">Matched Local Authority</span>
                <span className="text-slate-200 font-bold text-sm">{problem.matchedBody.name}</span>
                <span className="text-slate-400 block mt-0.5">District: {problem.matchedBody.district}</span>
              </div>
              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                Registered Authority
              </span>
            </div>
          ) : isUnregisteredOutreach ? (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 space-y-2 text-xs text-amber-300">
              <div className="flex items-center gap-2 font-bold text-amber-200">
                <MailWarning className="w-4 h-4 text-amber-400" /> Outreach Invitation Email Sent
              </div>
              <p className="text-slate-300 leading-relaxed">
                The local authority for this area ({problem.district}) is not yet registered on Sahyog. Our system has automatically dispatched an outreach email to <strong>{problem.jurisdictionNotifications[0]?.notifiedEmail || 'local authority'}</strong> inviting them to register and resolve this issue.
              </p>
            </div>
          ) : (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">
              Auto-matching jurisdiction authority...
            </div>
          )}
        </div>

        {/* UNIVERSITY R&D RESOLUTION ROADMAP */}
        {hasProject && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20 text-purple-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{problem.project.university.name}</h3>
                  <p className="text-xs text-purple-300">{problem.project.department?.name}</p>
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                {problem.project.stage}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-300 block">Itemized Milestone Progress</span>
              {problem.project.milestones?.map((milestone: any, idx: number) => (
                <div
                  key={milestone.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-[11px]">M{idx + 1}</span>
                    <span className="text-slate-200 font-medium">{milestone.title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {milestone.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
