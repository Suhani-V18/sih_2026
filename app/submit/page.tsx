"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  FileText,
  MapPin,
  Building,
  TreePine,
  Sparkles,
  Send,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Languages,
  CheckCircle2,
  MailWarning
} from "lucide-react";

export default function CitizenSubmitPage() {
  const router = useRouter();
  const [inputType, setInputType] = useState<"text" | "voice">("text");
  const [areaType, setAreaType] = useState<"urban" | "rural">("urban");

  const [title, setTitle] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [language, setLanguage] = useState("hi");

  // Location fields
  const [state, setState] = useState("West Bengal");
  const [district, setDistrict] = useState("Howrah");
  const [block, setBlock] = useState("");
  const [ward, setWard] = useState("Ward 12");
  const [village, setVillage] = useState("");
  const [pincode, setPincode] = useState("711101");
  const [addressText, setAddressText] = useState("");

  // Media URLs
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle Mock Mic Recording
  function toggleRecording() {
    if (isRecording) {
      setIsRecording(false);
      setAudioUrl("https://example.com/audio/mock_voice_recording.mp3");
    } else {
      setIsRecording(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputType === "text" && !descriptionText.trim()) {
      setError("Please enter a text description.");
      return;
    }
    if (inputType === "voice" && !audioUrl && !isRecording) {
      setError("Please record or provide an audio URL.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType,
          title: title || (inputType === "voice" ? `Voice Report (${district})` : "Civic Complaint"),
          descriptionText,
          audioUrl: inputType === "voice" ? (audioUrl || "https://example.com/audio/voice_recording.mp3") : null,
          language,
          location: {
            state,
            district,
            areaType,
            block: areaType === "rural" ? block : null,
            ward: areaType === "urban" ? ward : null,
            village: areaType === "rural" ? village : null,
            pincode,
            addressText,
            lat: 22.5958,
            lng: 88.2636,
          },
          media: [
            ...(imageUrl ? [{ type: "image", url: imageUrl }] : []),
            ...(videoUrl ? [{ type: "video", url: videoUrl }] : []),
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to submit civic issue.");
      }

      router.push("/my-reports");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Back Link */}
        <Link
          href="/my-reports"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Reports
        </Link>

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Report a Civic Problem</h1>
              <p className="text-xs text-slate-400">Voice recording or text report with auto-jurisdiction routing</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          
          {/* 1. INPUT TYPE SELECTOR (Voice vs Text) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Input Format *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInputType("text")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inputType === "text"
                    ? "bg-indigo-600 text-white border border-indigo-500 shadow-lg shadow-indigo-600/20"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <FileText className="w-4 h-4" /> Text Description
              </button>

              <button
                type="button"
                onClick={() => setInputType("voice")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inputType === "voice"
                    ? "bg-indigo-600 text-white border border-indigo-500 shadow-lg shadow-indigo-600/20"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <Mic className="w-4 h-4" /> Voice Recording
              </button>
            </div>
          </div>

          {/* VOICE RECORDING SECTION */}
          {inputType === "voice" && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-indigo-400" /> Audio Recording Tool
                </span>
                
                {/* Language Picker */}
                <div className="flex items-center gap-2 text-xs">
                  <Languages className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none"
                  >
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="bn">Bengali (বাংলা)</option>
                    <option value="en">English</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-xl space-y-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse shadow-red-500/30"
                      : audioUrl
                      ? "bg-emerald-600 text-white shadow-emerald-600/30"
                      : "bg-indigo-600 text-white shadow-indigo-600/30 hover:scale-105"
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
                <p className="text-xs text-slate-400 font-medium">
                  {isRecording
                    ? "Recording... Click again to stop"
                    : audioUrl
                    ? "Voice Recording Captured! (Click mic to re-record)"
                    : "Tap mic to start voice recording"}
                </p>
              </div>
            </div>
          )}

          {/* TITLE & TEXT DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Problem Title {inputType === "voice" ? "(Optional)" : "*"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water pump broken near government school"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {inputType === "text" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="Describe the problem, duration, and impact..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          )}

          {/* 2. AREA TYPE SELECTOR (Urban vs Rural) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Jurisdiction Area Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAreaType("urban")}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  areaType === "urban"
                    ? "bg-sky-600 text-white border border-sky-500 shadow-lg shadow-sky-600/20"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <Building className="w-4 h-4" /> Urban (Municipal Corp / ULB)
              </button>

              <button
                type="button"
                onClick={() => setAreaType("rural")}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  areaType === "rural"
                    ? "bg-emerald-600 text-white border border-emerald-500 shadow-lg shadow-emerald-600/20"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <TreePine className="w-4 h-4" /> Rural (Gram Panchayat)
              </button>
            </div>
          </div>

          {/* LOCATION FIELDS */}
          <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <MapPin className="w-4 h-4 text-indigo-400" /> Location & Address Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Howrah or Hooghly"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              {areaType === "urban" ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ward Number / Name</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="e.g. Ward 12"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Block</label>
                    <input
                      type="text"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      placeholder="e.g. Singur"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Village Name</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Hesag"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 711101"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Address / Landmark</label>
              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="e.g. Near Govt Primary School, Ward 12"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* MEDIA ATTACHMENTS (Images / Videos) */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Media Attachments (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                <ImageIcon className="w-4 h-4 text-sky-400 shrink-0" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image URL (e.g. s3://.../img1.jpg)"
                  className="bg-transparent text-white focus:outline-none w-full text-xs"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                <Video className="w-4 h-4 text-purple-400 shrink-0" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Video URL (e.g. s3://.../vid1.mp4)"
                  className="bg-transparent text-white focus:outline-none w-full text-xs"
                />
              </div>
            </div>
          </div>

          {/* OUTREACH NOTIFICATION WARNING */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-300">
            <MailWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Outreach Trigger Active:</strong> If the target Municipal Corporation / Panchayat in {district} is not yet registered on Sahyog, our system will automatically generate an invitation notification email urging them to register and resolve this civic issue.
            </span>
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? "Processing & Matching Jurisdiction..." : <><Send className="w-4 h-4" /> Submit Civic Complaint</>}
          </button>
        </form>

      </div>
    </div>
  );
}