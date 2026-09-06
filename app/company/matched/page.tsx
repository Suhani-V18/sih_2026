import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, Award, ChevronRight, ArrowLeft } from "lucide-react";

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

  const rawProjects = await prisma.project.findMany({
    include: {
      problem: true,
      university: true,
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
              <p className="text-xs text-slate-400">Recommended for {company.name} based on domain expertise</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            {projects.map((project: any) => (
              <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{project.problem?.title}</h3>
                  <p className="text-xs text-purple-300 mt-0.5">{project.university?.name}</p>
                </div>
                <Link
                  href={`/company/projects/${project.id}`}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl transition-all"
                >
                  View Pitch <ChevronRight className="w-4 h-4 inline" />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}