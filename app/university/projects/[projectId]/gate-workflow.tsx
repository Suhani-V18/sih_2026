"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Building2,
  Send,
  Lock,
  CheckCircle2,
  Clock,
  ShieldCheck,
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

  // Default: every AI-recommended company is checked. Faculty can uncheck
  // ones they don't want to pitch to before broadcasting.
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(
    new Set(recommendedCompanies.map((c) => c.id))
  );

  const [gate1Concept, setGate1Concept] = useState(
    project.proposalText || ""
  );
  const [gate1PrototypeUrl, setGate1PrototypeUrl] = useState(
    project.pitchDeckUrl || ""
  );

  const [gate2PitchDeck, setGate2PitchDeck] = useState(project.pitchDeckUrl || "");
  const [gate2VideoDemo, setGate2VideoDemo] = useState(project.pitchVideoUrl || "");
  const [budgetEstimate, setBudgetEstimate] = useState(project.budgetEstimate || "");

  const stage = project.stage;

  function toggleCompany(id: string) {
    setSelectedCompanyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGate1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedCompanyIds.size === 0) {
      alert("Select at least one company to send this pitch to.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalText: gate1Concept,
          pitchDeckUrl: gate1PrototypeUrl,
          companyIds: Array.from(selectedCompanyIds),
        }),
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error("Gate 1 broadcast error:", err);
    } finally {
      setSubmitting(false);
    }
  }

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
      {/* Pipeline header — unchanged from before */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          R&D Incubation Pipeline Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className={`p-4 rounded-xl border ${
            stage === "ACCEPTED" || stage === "GATE1_PROPOSAL"
              ? "bg-purple-950/40 border-purple-500/50 text-purple-200"
              : "bg-slate-950 border-slate-800 text-slate-400"
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span>Gate 1: Basic Concept</span>
              {stage === "ACCEPTED" ? <Clock className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-[11px] opacity-80">Broadcast to AI-recommended sponsors</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            stage === "GATE2_PITCH"
              ? "bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-lg shadow-purple-500/10"
              : stage === "FUNDED" || stage === "IN_PROGRESS"
              ? "bg-slate-950 border-slate-800 text-slate-400"
              : "bg-slate-950/60 border-slate-800/60 text-slate-600 opacity-60"
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span>Gate 2: Detailed Pitch</span>
              {stage === "GATE2_PITCH" ? <Sparkles className="w-4 h-4 text-amber-400" /> : stage === "FUNDED" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-600" />}
            </div>
            <p className="text-[11px] opacity-80">
              {stage === "GATE1_PROPOSAL" ? "Locked (awaiting a company to accept)" : "Detailed PPT, demo video & milestones"}
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${
            stage === "FUNDED" || stage === "IN_PROGRESS"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
              : "bg-slate-950/60 border-slate-800/60 text-slate-600 opacity-60"
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span>CSR Escrow Funding</span>
              {stage === "FUNDED" ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-600" />}
            </div>
            <p className="text-[11px] opacity-80">Milestone payouts active</p>
          </div>
        </div>
      </div>

      {/* PHASE 1 — select which AI matches to pitch, then broadcast */}
      {stage === "ACCEPTED" && (
        <form onSubmit={handleGate1Submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">Phase 1: Broadcast Gate 1 to CSR Sponsors</h3>
              <p className="text-xs text-slate-400">
                All AI-recommended sponsors are selected by default — uncheck any you'd rather skip.
                Whichever company accepts first moves to Gate 2.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              AI Recommended CSR Sponsors * ({selectedCompanyIds.size} selected)
            </label>
            <div className="space-y-2">
              {recommendedCompanies.map((comp) => {
                const checked = selectedCompanyIds.has(comp.id);
                return (
                  <label
                    key={comp.id}
                    onClick={() => toggleCompany(comp.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "bg-purple-950/30 border-purple-500/50 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={checked} readOnly className="w-4 h-4 accent-purple-500" />
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="text-xs font-bold block text-slate-200">{comp.name}</span>
                        <span className="text-[11px] text-slate-500">
                          Region: {comp.region} • Trust Score: {comp.trustScore}/100
                        </span>
                      </div>
                    </div>
                    {comp.matchScore != null && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        {Math.round(Number(comp.matchScore) * 100)}% Match
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

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
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Broadcasting..." : <><Send className="w-4 h-4" /> Broadcast Gate 1 to {selectedCompanyIds.size} Companies</>}
          </button>
        </form>
      )}

      {/* PHASE 2 — awaiting responses */}
      {stage === "GATE1_PROPOSAL" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-300">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-200 text-sm mb-1">
                Gate 1 sent to your selected sponsors
              </span>
              <p className="text-slate-300 leading-relaxed">
                Whichever company accepts first will move to Gate 2 — all other pending pitches
                on this project close automatically once that happens.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3 — Gate 2, unchanged */}
      {stage === "GATE2_PITCH" && (
        <form onSubmit={handleGate2Submit} className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 space-y-5 shadow-2xl shadow-purple-950/30">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">🎉 A sponsor accepted Gate 1! Submit Gate 2</h3>
              <p className="text-xs text-purple-300">Upload your detailed PPT, demo video, and budget.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Detailed Prototype Pitch Deck URL (PDF) *
            </label>
            <input type="url" required value={gate2PitchDeck} onChange={(e) => setGate2PitchDeck(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Demo Video Pitch URL (MP4 / YouTube) *
            </label>
            <input type="url" required value={gate2VideoDemo} onChange={(e) => setGate2VideoDemo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Total Budget Estimate (₹) *
            </label>
            <input type="number" required value={budgetEstimate} onChange={(e) => setBudgetEstimate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            {submitting ? "Updating Pitch..." : <><Send className="w-4 h-4" /> Submit Gate 2 Detailed Pitch & Milestones</>}
          </button>
        </form>
      )}

      {/* PHASE 4 — funded, unchanged */}
      {(stage === "FUNDED" || stage === "IN_PROGRESS") && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">CSR Capital Committed — Milestone Escrow Active</h3>
              <p className="text-xs text-emerald-400">Project is officially funded.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}