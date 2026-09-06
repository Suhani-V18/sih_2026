"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Users, FileSpreadsheet, GraduationCap, Building2, Handshake } from "lucide-react";
import type { RegistrationRole } from "@/lib/validators";
import { DEMO_MODE_ENABLED, getDemoEmailFor } from "@/lib/demo-allowlist";

const ROLES: {
  id: RegistrationRole;
  label: string;
  description: string;
  icon: typeof Users;
  accent: string;
}[] = [
  {
    id: "citizen",
    label: "Citizen",
    description: "Report a local civic issue and track its resolution.",
    icon: Users,
    accent: "indigo",
  },
  {
    id: "mc_panchayat",
    label: "MC / Panchayat",
    description: "Official portal for municipal or panchayat staff.",
    icon: FileSpreadsheet,
    accent: "sky",
  },
  {
    id: "university",
    label: "University / R&D",
    description: "Faculty mentor & student team sign-up.",
    icon: GraduationCap,
    accent: "purple",
  },
  {
    id: "company",
    label: "Company / CSR",
    description: "Register your organization to sponsor & fund projects.",
    icon: Building2,
    accent: "emerald",
  },
];

const ACCENT_CLASSES: Record<string, { border: string; bg: string; text: string }> = {
  indigo: { border: "border-indigo-500/50", bg: "bg-indigo-500/10", text: "text-indigo-400" },
  sky: { border: "border-sky-500/50", bg: "bg-sky-500/10", text: "text-sky-400" },
  purple: { border: "border-purple-500/50", bg: "bg-purple-500/10", text: "text-purple-400" },
  emerald: { border: "border-emerald-500/50", bg: "bg-emerald-500/10", text: "text-emerald-400" },
};

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<RegistrationRole | null>(null);

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-16">
        <button
          onClick={() => setSelectedRole(null)}
          className="text-sm text-slate-400 hover:text-white mb-6 self-start max-w-sm mx-auto w-full cursor-pointer transition-colors"
        >
          ← Choose a different role
        </button>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl={`/onboarding?role=${selectedRole}`}
          appearance={{
            elements: {
              rootBox: "mx-auto w-full max-w-md",
              card: "bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl",
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center mb-10">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="bg-indigo-600 group-hover:bg-indigo-500 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20 transition-all">
            <Handshake className="w-6 h-6" />
          </div>
        </Link>
        <br />
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
          Sahyog Platform
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
          Welcome to Sahyog Platform!
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Who's signing up? Select your role to get started.
        </p>
        {DEMO_MODE_ENABLED && (
          <p className="mt-3 inline-block text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3.5 py-1">
            Demo mode is active — validation is relaxed for presentation accounts.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const accent = ACCENT_CLASSES[role.accent];
          const demoEmail = getDemoEmailFor(role.id as any);
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`text-left bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:${accent.border} transition-all group cursor-pointer`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${accent.bg} border ${accent.border} ${accent.text} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">{role.label}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{role.description}</p>
              {demoEmail && (
                <p className="text-[11px] text-amber-400/80 mt-3 font-mono">
                  demo: {demoEmail}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}