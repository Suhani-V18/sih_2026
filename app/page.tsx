"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  MapPin,
  Cpu,
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Coins,
  Activity,
  Users,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const { user, isSignedIn, isLoaded } = useUser();

  const getRoleDashboard = () => {
    const role = user?.publicMetadata?.role as string | undefined;
    switch (role) {
      case "mc_panchayat":
        return "/mc-panchayat/inbox";
      case "university":
        return "/university/shortlist";
      case "company":
        return "/company/marketplace";
      case "moderator":
        return "/moderator/low-confidence";
      default:
        return "/my-reports";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-indigo-600 group-hover:bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20 transition-all">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              CivicBridge <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">SIH 2024</span>
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 font-medium">
              Civic Innovation & CSR Engine
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">
            How It Works
          </a>
          <a href="#portals" className="hover:text-indigo-400 transition-colors">
            Stakeholder Portals
          </a>
          <a href="#impact" className="hover:text-indigo-400 transition-colors">
            Platform Stats
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!isLoaded ? (
            <div className="h-9 w-24 bg-slate-900 animate-pulse rounded-lg" />
          ) : !isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 transition-all"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href={getRoleDashboard()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <UserButton   />
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 overflow-hidden border-b border-slate-800/50">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[200px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Routed Civic Execution & Escrow Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Bridging Civic Ground Issues to <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
              Funded Technical R&D Solutions
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Connecting <span className="text-white font-medium">Citizens</span> &{" "}
            <span className="text-white font-medium">Panchayats/MC</span> directly with{" "}
            <span className="text-white font-medium">University R&D Cells</span> and{" "}
            <span className="text-white font-medium">Corporate CSR Sponsors</span> through transparent, milestone-based escrow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href={isSignedIn ? "/submit" : "/sign-up"}
              className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <MapPin className="w-5 h-5 text-indigo-200" />
              Report a Problem
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#portals"
              className="w-full sm:w-auto px-6 py-3.5 text-base font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all text-center"
            >
              Explore Portals
            </Link>
          </div>
        </div>
      </section>

      {/* LIVE PLATFORM METRICS */}
      <section id="impact" className="py-12 bg-slate-900/50 border-b border-slate-800/50 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center text-center">
            <Activity className="w-6 h-6 text-indigo-400 mb-2" />
            <span className="text-2xl md:text-3xl font-extrabold text-white">1,248+</span>
            <span className="text-xs text-slate-400 font-medium mt-1">Civic Issues Logged</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center text-center">
            <GraduationCap className="w-6 h-6 text-sky-400 mb-2" />
            <span className="text-2xl md:text-3xl font-extrabold text-white">86+</span>
            <span className="text-xs text-slate-400 font-medium mt-1">University R&D Projects</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center text-center">
            <Coins className="w-6 h-6 text-amber-400 mb-2" />
            <span className="text-2xl md:text-3xl font-extrabold text-white">₹42.5 Lakhs</span>
            <span className="text-xs text-slate-400 font-medium mt-1">CSR Escrow Funds Committed</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-2" />
            <span className="text-2xl md:text-3xl font-extrabold text-white">312</span>
            <span className="text-xs text-slate-400 font-medium mt-1">Verified Ground Resolutions</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 border-b border-slate-800/50 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            The Civic Bridge Workflow
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            From raw civic complaint to fully funded execution and citizen feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" /> Report & Geotag
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Citizens or MC/Panchayat officials upload photo/video evidence. Geotag auto-maps to official LGD jurisdiction code.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-medium text-slate-500">Non-blocking Auto Routing</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" /> AI Classification
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI categorizes severity and routes problem statements to relevant University R&D cells while alerting local authorities.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-medium text-slate-500">Shortlist & Counter-Scope</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" /> Gate 1 & Gate 2
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                University teams submit technical proposals (Gate 1) & video pitch decks (Gate 2) with milestone breakdowns.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-medium text-slate-500">Funding-Ready Project</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                04
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" /> CSR Escrow
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Corporates browse marketplace, commit funds to escrow, and release payments upon proof of milestone completion.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-medium text-slate-500">Verified Ground Resolution</span>
          </div>
        </div>
      </section>

      {/* STAKEHOLDER PORTAL CARDS */}
      <section id="portals" className="py-20 px-4 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            Multi-Stakeholder Portal Gateways
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Select your persona to access specialized tools and action queues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Citizen Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Citizens</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Log local issues, track real-time resolution status, and give final star ratings on resolved ground work.
              </p>
            </div>
            <Link
              href={isSignedIn ? "/my-reports" : "/sign-up"}
              className="w-full py-2.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              {isSignedIn ? "My Reports" : "Sign Up to Report"} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* MC / Panchayat Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-sky-500/50 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">MC / Panchayat</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Co-sign auto-mapped reports in your LGD jurisdiction inbox and grant statutory approvals for university execution.
              </p>
            </div>
            <Link
              href={isSignedIn ? "/mc-panchayat/inbox" : "/sign-up"}
              className="w-full py-2.5 text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              {isSignedIn ? "Jurisdiction Inbox" : "Official Sign Up"} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* University Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/50 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Universities</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Review AI-routed problem statements, submit Gate 1/2 pitch packages, build solutions, and earn Trust Scores.
              </p>
            </div>
            <Link
              href={isSignedIn ? "/university/shortlist" : "/sign-up"}
              className="w-full py-2.5 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              {isSignedIn ? "University Workspace" : "Faculty/Student Sign Up"} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Corporate / CSR Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Corporate / CSR</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Browse funding-ready project marketplace, commit milestone escrow, and monitor progress on supervisory Kanbans.
              </p>
            </div>
            <Link
              href={isSignedIn ? "/company/marketplace" : "/sign-up"}
              className="w-full py-2.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              {isSignedIn ? "CSR Marketplace" : "CSR Sponsor Sign Up"} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST & GOVERNANCE BADGES */}
      <section className="py-12 bg-slate-900/40 border-t border-slate-800/60 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-around gap-6 text-slate-400 text-xs font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> LGD Code Jurisdiction Mapping
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" /> Milestone-Based Escrow Protection
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" /> Public Trust Score Rating System
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-4 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-300">CivicBridge</span>
            <span>— Smart India Hackathon Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-slate-300 transition-colors">Workflow</a>
            <a href="#portals" className="hover:text-slate-300 transition-colors">Portals</a>
            <Link href="/sign-up" className="hover:text-slate-300 transition-colors">Sign Up</Link>
            <Link href="/submit" className="hover:text-slate-300 transition-colors">Submit Report</Link>
          </div>

          <div className="text-slate-600">
            © {new Date().getFullYear()} CivicBridge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}