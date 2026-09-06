 
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Building2,
  FileText,
  Video,
  Send,
  Lock,
  CheckCircle2,
  Clock,
  ChevronRight,
  Layers,
  ShieldCheck,
  ExternalLink
} from "lucide-react";

export default function GateWorkflow({
  project,
  recommendedCompanies,
}: {
  project: any;
  recommendedCompanies: any[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Gate 1 Form State
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    recommendedCompanies[0]?.id || ""
  );
  const [gate1Concept, setGate1Concept] = useState(
    project.proposalText || "Modular Low-Cost Sensor-Based Automated Silt Trap Mechanism"
  );
  const [gate1PrototypeUrl, setGate1PrototypeUrl] = useState(
    project.pitchDeckUrl || "https://example.com/gate1-basic-prototype.pdf"
  );

  // Gate 2 Form State
  const [gate2PitchDeck, setGate2PitchDeck] = useState(
    project.pitchDeckUrl || "https://example.com/gate2-detailed-pitch-deck.pdf"
  );
  const [gate2VideoDemo, setGate2VideoDemo] = useState(
    project.pitchVideoUrl || "https://example.com/gate2-video-demo.mp4"
  );
  const [budgetEstimate, setBudgetEstimate] = useState(
    project.budgetEstimate || "450000"
  );

  const stage = project.stage; // "ACCEPTED", "GATE1_PROPOSAL", "GATE2_PITCH", "FUNDED"

  // SUBMIT GATE 1 BASIC PROPOSAL
  async function handleGate1Submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "GATE1_PROPOSAL",
          proposalText: gate1Concept,
          pitchDeckUrl: gate1PrototypeUrl,
          pitchedCompanyId: selectedCompanyId,
        }),
      });

      if (res.ok) router.refresh();
    } catch (err) {
      console.error("Gate 1 submission error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // SUBMIT GATE 2 DETAILED PITCH & MILESTONE BUDGET
  async function handleGate2Submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "GATE2_PITCH",
          proposalText: gate1Concept,
          budgetEstimate: Number(budgetEstimate),
          pitchDeckUrl: gate2PitchDeck,
          pitchVideoUrl: gate2VideoDemo,
        }),
      });

      if (res.ok) router.refresh();
    } catch (err) {
      console.error("Gate 2 submission error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* 2-GATE WORKFLOW PROGRESS PIPELINE HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          R&D Incubation Pipeline Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Gate 1 Box */}
          <div className={`p-4 rounded-xl border ${
            stage === "ACCEPTED" || stage === "GATE1_PROPOSAL"
              ? "bg-purple-950/40 border-purple-500/50 text-purple-200"
              : "bg-slate-950 border-slate-800 text-slate-400"
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span>Gate 1: Basic Concept</span>
              {stage === "ACCEPTED" ? (
                <Clock className="w-4 h-4 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <p className="text-[11px] opacity-80">AI Company Recommendation & Basic Prototype</p>
          </div>

          {/* Gate 2 Box */}
          <div className={`p-4 rounded-xl border ${
            stage === "GATE2_PITCH"
              ? "bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-lg shadow-purple-500/10"
              : stage === "FUNDED" || stage === "IN_PROGRESS"
              ? "bg-slate-950 border-slate-800 text-slate-400"
              : "bg-slate-950/60 border-slate-800/60 text-slate-600 opacity-60"
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span>Gate 2: Detailed Pitch</span>
              {stage === "GATE2_PITCH" ? (
                <Sparkles className="w-4 h-4 text-amber-400" />
              ) : stage === "FUNDED" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 text-slate-600" />
              )}
            </div>
            <p className="text-[11px] opacity-80">
              {stage === "GATE1_PROPOSAL" ? "Locked (Awaiting Corporate Gate 1 Approval)" : "Detailed PPT, Demo Video & Milestones"}
            </p>
          </div>

          {/* Funding Box */}
          <div className={`p-4 rounded-xl border ${
            stage === "FUNDED" || stage === "IN_PROGRESS"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
              : "bg-slate-950/60 border-slate-800/60 text-slate-600 opacity-60"
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span>CSR Escrow Funding</span>
              {stage === "FUNDED" ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-600" />}
            </div>
            <p className="text-[11px] opacity-80">Milestone Payouts Active</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHASE 1: SUBMIT GATE 1 BASIC PROPOSAL */}
      {/* ========================================================================= */}
      {stage === "ACCEPTED" && (
        <form onSubmit={handleGate1Submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">Phase 1: Select AI-Recommended CSR Sponsor & Submit Gate 1</h3>
              <p className="text-xs text-slate-400">Choose a recommended company and send your basic prototype concept.</p>
            </div>
          </div>

          {/* AI Recommended Companies Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              AI Recommended CSR Sponsors *
            </label>
            <div className="space-y-2">
              {recommendedCompanies.map((comp) => (
                <label
                  key={comp.id}
                  onClick={() => setSelectedCompanyId(comp.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedCompanyId === comp.id
                      ? "bg-purple-950/30 border-purple-500/50 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold block text-slate-200">{comp.name}</span>
                      <span className="text-[11px] text-slate-500">Region: {comp.region} • Trust Score: {comp.trustScore}/100</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    94.5% Domain Match
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Gate 1 Basic Concept Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Gate 1 Basic Solution Concept *
            </label>
            <textarea
              rows={3}
              required
              value={gate1Concept}
              onChange={(e) => setGate1Concept(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Gate 1 Basic Prototype URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Basic Prototype / PPT Link (URL) *
            </label>
            <input
              type="url"
              required
              value={gate1PrototypeUrl}
              onChange={(e) => setGate1PrototypeUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Gate 1 Concept to Company</>}
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: AWAITING COMPANY GATE 1 REVIEW */}
      {/* ========================================================================= */}
      {stage === "GATE1_PROPOSAL" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-300">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-200 text-sm mb-1">
                Gate 1 Basic Proposal Submitted
              </span>
              <p className="text-slate-300 leading-relaxed">
                Your Gate 1 Solution Concept has been sent to the corporate sponsor for review. Once the company accepts your Gate 1 concept, the <strong>Gate 2 Detailed Pitch Dashboard</strong> will automatically unlock here!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 3: GATE 2 DASHBOARD UNLOCKED (COMPANY APPROVED GATE 1!) */}
      {/* ========================================================================= */}
      {stage === "GATE2_PITCH" && (
        <form onSubmit={handleGate2Submit} className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 space-y-5 shadow-2xl shadow-purple-950/30">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                🎉 Gate 1 Approved! Phase 2: Submit Gate 2 Detailed Pitch & Budget
              </h3>
              <p className="text-xs text-purple-300">
                The CSR sponsor accepted your concept. Upload your detailed PPT, demo video, and budget.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Detailed Prototype Pitch Deck URL (PDF) *
            </label>
            <input
              type="url"
              required
              value={gate2PitchDeck}
              onChange={(e) => setGate2PitchDeck(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Demo Video Pitch URL (MP4 / YouTube) *
            </label>
            <input
              type="url"
              required
              value={gate2VideoDemo}
              onChange={(e) => setGate2VideoDemo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Total Budget Estimate (₹) *
            </label>
            <input
              type="number"
              required
              value={budgetEstimate}
              onChange={(e) => setBudgetEstimate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? "Updating Pitch..." : <><Send className="w-4 h-4" /> Submit Gate 2 Detailed Pitch & Milestones</>}
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* PHASE 4: FUNDED / IN PROGRESS (MILESTONE ESCROW ACTIVE) */}
      {/* ========================================================================= */}
      {(stage === "FUNDED" || stage === "IN_PROGRESS") && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">CSR Capital Committed — Milestone Escrow Active</h3>
              <p className="text-xs text-emerald-400">Project is officially funded by Tata Sustainability & CSR Foundation.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}