 
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

import Link from "next/link";
// add Ban to the lucide-react import
import { GraduationCap, Award, Sparkles, FolderKanban, Layers, CheckCircle2, Ban } from "lucide-react";
import ShortlistActions from "./shortlist-actions";
import StartProposalButton from "./start-proposal-button";

export default async function UniversityShortlistPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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
        <p className="text-slate-400 mb-4">University profile not found. Please complete onboarding.</p>
        <Link href="/onboarding?role=university" className="text-xs text-indigo-400 hover:underline">
          Complete Onboarding
        </Link>
      </div>
    );
  }

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
      universityMatches: {
        where: { universityId: member.universityId }
      },
      project: {
        include: { milestones: true }
      }
    },
    orderBy: { submittedAt: "desc" }
  });

  const problems = JSON.parse(
    JSON.stringify(rawProblems, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Institution Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/10 p-3.5 rounded-2xl border border-purple-500/20 text-purple-400">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{member.university.name}</h1>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Verified Institution
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {member.name} ({member.designation || "Faculty Member"}) • <span className="text-purple-300">{member.department?.name}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-right self-start md:self-auto">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Trust Score</span>
            <span className="text-lg font-black text-amber-400">{member.university.trustScore}/100</span>
          </div>
        </div>

        {/* 🌟 COMPACT HORIZONTAL BUTTON PILL BAR */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
          <Link
            href="/university/shortlist"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-md shadow-purple-600/20 flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-purple-200" /> R&D Shortlist
          </Link>

          <Link
            href="/university/projects"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2"
          >
            <FolderKanban className="w-4 h-4 text-purple-400" /> All R&D Projects
          </Link>

          <Link
            href="/university/projects/1"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-amber-400" /> Active Pitch & Milestones
          </Link>
        </div>

        {/* Shortlisted Problems Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            AI Recommended Civic Problems ({problems.length})
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {problems.map((problem: any) => {
             const matchRecord = problem.universityMatches?.[0];
             const matchStatus = matchRecord?.status || (problem.project ? "ACCEPTED" : "SUGGESTED");
             const isAccepted = matchStatus === "ACCEPTED";
             const iMarkedNonInnovative = matchStatus === "NON_INNOVATIVE";
             const myProject = problem.project?.universityId === member.universityId.toString() ? problem.project : null;
              return (
                <div
                  key={problem.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">{problem.problemCode}</span>
                      <span>•</span>
                      <span>{problem.district} {problem.ward ? `, ${problem.ward}` : ''}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {myProject && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                          Stage: {myProject.stage}
                        </span>
                      )}
                   {problem.aiConfidence != null && (
  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
    <Sparkles className="w-3 h-3 text-purple-400" /> {(Number(problem.aiConfidence) * 100).toFixed(1)}% AI Match
  </span>
)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-2">{problem.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{problem.descriptionText}</p>
                  </div>
                  {iMarkedNonInnovative ? (
  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
    <div>
      <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5 mb-0.5">
        <Ban className="w-3.5 h-3.5" /> You marked this non-innovative
      </span>
      <p className="text-[11px] text-slate-400">
        {problem.nonInnovativeCount}/3 universities have flagged this problem.
      </p>
    </div>
  </div>
) :
                  !isAccepted ? (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-0.5">
                          <Sparkles className="w-3.5 h-3.5" /> AI Recommendation Pending Decision
                        </span>
                        <p className="text-[11px] text-slate-400">Accept this recommendation to unlock Gate 1 R&D Proposal creation.</p>
                      </div>

                      <ShortlistActions
  problemId={problem.id}
  universityId={member.universityId.toString()}
  aiConfidence={problem.aiConfidence}
/>
                    </div>
                  ) : myProject ? (
                    <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-4 h-4" /> R&D Project Active ({myProject.stage})
                        </span>
                        <p className="text-xs text-purple-200">{myProject.proposalText}</p>
                      </div>

                      <Link
                        href={`/university/projects/${myProject.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-600/20 shrink-0"
                      >
                        Manage Gate 1 & Gate 2 Pitch
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-4 h-4" /> Problem Accepted by University
                        </span>
                        <p className="text-xs text-purple-200">Click below to select an AI-recommended CSR sponsor and submit Gate 1.</p>
                      </div>

                      <StartProposalButton problemId={problem.id} />
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