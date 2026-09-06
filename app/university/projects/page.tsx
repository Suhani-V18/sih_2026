import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GraduationCap, ArrowLeft, ChevronRight } from "lucide-react";

export default async function UniversityProjectsListPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const member = await prisma.universityMember.findUnique({
    where: { clerkUserId: userId },
    include: { university: true },
  });

  if (!member) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <p className="text-slate-400">University profile not found.</p>
      </div>
    );
  }

  const rawProjects = await prisma.project.findMany({
    where: { universityId: member.universityId },
    include: {
      problem: true,
      milestones: true,
    },
  });

  const projects = JSON.parse(
    JSON.stringify(rawProjects, (k, v) => (typeof v === "bigint" ? v.toString() : v))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <Link
          href="/university/shortlist"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to R&D Shortlist
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 text-purple-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Active R&D Projects</h1>
              <p className="text-xs text-slate-400">{member.university.name} Incubated Projects</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {projects.map((project: any) => (
            <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mb-1 inline-block">
                  Stage: {project.stage}
                </span>
                <h3 className="text-sm font-bold text-white">{project.problem?.title}</h3>
              </div>
              <Link
                href={`/university/projects/${project.id}`}
                className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl transition-all"
              >
                Manage Milestones <ChevronRight className="w-4 h-4 inline" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}