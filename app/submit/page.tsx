"use client";

import { useState, useRef, useCallback } from "react";
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
  MailWarning,
  LocateFixed,
  Loader2,
  Square,
  X,
  UploadCloud,
} from "lucide-react";

// ---- Cloudinary config (signed uploads) ----
// Signing happens server-side in /api/cloudinary-signature.
// This client code never sees CLOUDINARY_API_SECRET.

type CloudinaryResourceType = "image" | "video";

async function uploadToCloudinary(
  file: File | Blob,
  resourceType: CloudinaryResourceType,
  onProgress?: (pct: number) => void
): Promise<{ secureUrl: string; publicId: string; bytes: number; format: string }> {
  // 1. Get a fresh signature from our own server for this specific upload
  const sigRes = await fetch("/api/cloudinary-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder: resourceType === "video" ? "sahyog_videos" : "sahyog_submissions",
    }),
  });

  if (!sigRes.ok) {
    throw new Error("Couldn't get an upload authorization. Please try again.");
  }

  const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

  // 2. Upload directly to Cloudinary, signed
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  // Use XHR instead of fetch so we can report upload progress.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            secureUrl: data.secure_url,
            publicId: data.public_id,
            bytes: data.bytes,
            format: data.format,
          });
        } catch {
          reject(new Error("Couldn't parse Cloudinary response."));
        }
      } else {
        reject(new Error(`Cloudinary upload failed (${xhr.status}).`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });
}

// Tracks an uploaded (or uploading) media asset in one place.
interface MediaAsset {
  file: File | Blob;
  previewUrl: string; // local object URL, for instant preview
  cloudUrl: string | null; // Cloudinary secure_url once uploaded
  uploading: boolean;
  progress: number;
  error: string | null;
}

function emptyAsset(): MediaAsset | null {
  return null;
}

export default function CitizenSubmitPage() {
  const router = useRouter();
  const [inputType, setInputType] = useState<"text" | "voice">("text");
  const [areaType, setAreaType] = useState<"urban" | "rural">("urban");

  const [title, setTitle] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [language, setLanguage] = useState("hi");

  // Location fields
  const [state, setState] = useState("West Bengal");
  const [district, setDistrict] = useState("Howrah");
  const [block, setBlock] = useState("");
  const [ward, setWard] = useState("Ward 12");
  const [village, setVillage] = useState("");
  const [pincode, setPincode] = useState("711101");
  const [addressText, setAddressText] = useState("");

  // Resolved coordinates + how they were obtained
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationSource, setLocationSource] = useState<"gps" | "address" | null>(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // ---- Real audio recording state ----
  const [audioAsset, setAudioAsset] = useState<MediaAsset | null>(emptyAsset());
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ---- Real image/video file upload state ----
  const [imageAsset, setImageAsset] = useState<MediaAsset | null>(emptyAsset());
  const [videoAsset, setVideoAsset] = useState<MediaAsset | null>(emptyAsset());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------- Audio recording ----------------

  async function startRecording() {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const previewUrl = URL.createObjectURL(blob);
        setAudioAsset({ file: blob, previewUrl, cloudUrl: null, uploading: true, progress: 0, error: null });

        // Stop mic tracks now that we have the recording.
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        try {
          const result = await uploadToCloudinary(blob, "video", (pct) =>
            setAudioAsset((prev) => (prev ? { ...prev, progress: pct } : prev))
          );
          setAudioAsset((prev) =>
            prev ? { ...prev, uploading: false, progress: 100, cloudUrl: result.secureUrl } : prev
          );
        } catch (err) {
          setAudioAsset((prev) =>
            prev
              ? { ...prev, uploading: false, error: err instanceof Error ? err.message : "Upload failed." }
              : prev
          );
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setMicError("Couldn't access your microphone. Please allow microphone permission and try again.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function clearAudio() {
    if (audioAsset?.previewUrl) URL.revokeObjectURL(audioAsset.previewUrl);
    setAudioAsset(null);
  }

  // ---------------- Image / video file upload ----------------

  const handleFileSelect = useCallback(
    async (
      file: File,
      resourceType: CloudinaryResourceType,
      setAsset: React.Dispatch<React.SetStateAction<MediaAsset | null>>
    ) => {
      const previewUrl = URL.createObjectURL(file);
      setAsset({ file, previewUrl, cloudUrl: null, uploading: true, progress: 0, error: null });

      try {
        const result = await uploadToCloudinary(file, resourceType, (pct) =>
          setAsset((prev) => (prev ? { ...prev, progress: pct } : prev))
        );
        setAsset((prev) => (prev ? { ...prev, uploading: false, progress: 100, cloudUrl: result.secureUrl } : prev));
      } catch (err) {
        setAsset((prev) =>
          prev ? { ...prev, uploading: false, error: err instanceof Error ? err.message : "Upload failed." } : prev
        );
      }
    },
    []
  );

  function clearAsset(
    asset: MediaAsset | null,
    setAsset: React.Dispatch<React.SetStateAction<MediaAsset | null>>
  ) {
    if (asset?.previewUrl) URL.revokeObjectURL(asset.previewUrl);
    setAsset(null);
  }

  // ---------------- Location ----------------

  function useMyGpsLocation() {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support GPS location.");
      return;
    }

    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationSource("gps");
        setLocatingGps(false);
      },
      () => {
        setLocationError(
          "Couldn't access your GPS location. Please allow location access, or fill in the address below instead."
        );
        setLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function geocodeTypedAddress(): Promise<{ lat: number; lng: number } | null> {
    const query = [
      addressText,
      areaType === "urban" ? ward : null,
      areaType === "rural" ? block : null,
      areaType === "rural" ? village : null,
      district,
      state,
      pincode,
      "India",
    ]
      .filter(Boolean)
      .join(", ");

    if (!query.trim()) return null;

    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return { lat: data.lat, lng: data.lng };
    } catch {
      return null;
    }
  }

  // ---------------- Submit ----------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (inputType === "text" && !descriptionText.trim()) {
      setError("Please enter a text description.");
      return;
    }
    if (inputType === "voice" && !audioAsset) {
      setError("Please record a voice message.");
      return;
    }
    if (audioAsset?.uploading || imageAsset?.uploading || videoAsset?.uploading) {
      setError("Please wait for uploads to finish before submitting.");
      return;
    }
    if (inputType === "voice" && audioAsset && !audioAsset.cloudUrl) {
      setError("Your voice recording didn't upload successfully. Please re-record.");
      return;
    }

    setSubmitting(true);
    setError(null);

    let finalLat = lat;
    let finalLng = lng;

    if (finalLat === null || finalLng === null) {
      const geocoded = await geocodeTypedAddress();
      if (geocoded) {
        finalLat = geocoded.lat;
        finalLng = geocoded.lng;
        setLocationSource("address");
      } else {
        setLocationError(
          "Couldn't determine exact coordinates from the address. Your report will still be submitted with the text address."
        );
      }
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType,
          title: title || (inputType === "voice" ? `Voice Report (${district})` : "Civic Complaint"),
          descriptionText,
          audioUrl: inputType === "voice" ? audioAsset?.cloudUrl ?? null : null,
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
            lat: finalLat,
            lng: finalLng,
            locationSource,
          },
          media: [
            ...(imageAsset?.cloudUrl ? [{ type: "image", url: imageAsset.cloudUrl }] : []),
            ...(videoAsset?.cloudUrl ? [{ type: "video", url: videoAsset.cloudUrl }] : []),
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
        <Link
          href="/my-reports"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Reports
        </Link>

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
          {/* INPUT TYPE SELECTOR */}
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
                  <Mic className="w-4 h-4 text-indigo-400" /> Audio Recording
                </span>
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
                      : audioAsset
                      ? "bg-emerald-600 text-white shadow-emerald-600/30"
                      : "bg-indigo-600 text-white shadow-indigo-600/30 hover:scale-105"
                  }`}
                >
                  {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-8 h-8" />}
                </button>
                <p className="text-xs text-slate-400 font-medium">
                  {isRecording
                    ? "Recording... tap to stop"
                    : audioAsset
                    ? "Recording captured — tap to re-record"
                    : "Tap mic to start voice recording"}
                </p>
                {micError && <p className="text-[11px] text-red-400">{micError}</p>}

                {audioAsset && (
                  <div className="w-full space-y-2">
                    <audio src={audioAsset.previewUrl} controls className="w-full h-9" />
                    {audioAsset.uploading && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Cloudinary… {audioAsset.progress}%
                      </div>
                    )}
                    {audioAsset.cloudUrl && (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                      </div>
                    )}
                    {audioAsset.error && (
                      <p className="text-[11px] text-red-400">{audioAsset.error}</p>
                    )}
                    <button
                      type="button"
                      onClick={clearAudio}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove recording
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TITLE & DESCRIPTION */}
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

          {/* AREA TYPE SELECTOR */}
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

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <p className="text-xs font-semibold text-slate-200">Are you at the problem location right now?</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {locationSource === "gps"
                    ? "Using your device's current GPS location."
                    : "If yes, use GPS for the most accurate pin. Otherwise, just fill in the address below."}
                </p>
              </div>
              <button
                type="button"
                onClick={useMyGpsLocation}
                disabled={locatingGps}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                  locationSource === "gps" ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                } disabled:opacity-60`}
              >
                {locatingGps ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Locating...
                  </>
                ) : locationSource === "gps" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> GPS Location Set
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-3.5 h-3.5" /> Yes, Use My GPS
                  </>
                )}
              </button>
            </div>

            {locationError && <p className="text-[11px] text-amber-400 font-medium">{locationError}</p>}

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
              {locationSource !== "gps" && (
                <p className="text-[10px] text-slate-500 mt-1">
                  We'll use this address to automatically locate the problem on the map when you submit.
                </p>
              )}
            </div>
          </div>

          {/* MEDIA ATTACHMENTS */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Media Attachments (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MediaPicker
                label="Photo"
                icon={<ImageIcon className="w-4 h-4 text-sky-400" />}
                accept="image/*"
                capture="environment"
                asset={imageAsset}
                onSelect={(file) => handleFileSelect(file, "image", setImageAsset)}
                onClear={() => clearAsset(imageAsset, setImageAsset)}
                previewKind="image"
              />
              <MediaPicker
                label="Video"
                icon={<Video className="w-4 h-4 text-purple-400" />}
                accept="video/*"
                capture="environment"
                asset={videoAsset}
                onSelect={(file) => handleFileSelect(file, "video", setVideoAsset)}
                onClear={() => clearAsset(videoAsset, setVideoAsset)}
                previewKind="video"
              />
            </div>
          </div>

          {/* OUTREACH NOTIFICATION WARNING */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-300">
            <MailWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Outreach Trigger Active:</strong> If the target Municipal Corporation / Panchayat in {district} is
              not yet registered on Sahyog, our system will automatically generate an invitation notification email
              urging them to register and resolve this civic issue.
            </span>
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

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

// ---------------- Reusable file-picker + preview + Cloudinary progress ----------------

function MediaPicker({
  label,
  icon,
  accept,
  capture,
  asset,
  onSelect,
  onClear,
  previewKind,
}: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  capture?: string;
  asset: MediaAsset | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  previewKind: "image" | "video";
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture as "environment" | "user" | undefined}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />

      {!asset ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-1.5"
        >
          {icon}
          <span>Choose {label.toLowerCase()} from device</span>
          <UploadCloud className="w-3.5 h-3.5 ml-auto" />
        </button>
      ) : (
        <div className="space-y-2">
          {previewKind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.previewUrl} alt={label} className="w-full h-28 object-cover rounded-lg" />
          ) : (
            <video src={asset.previewUrl} controls className="w-full h-28 rounded-lg bg-black" />
          )}

          {asset.uploading && (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading… {asset.progress}%
            </div>
          )}
          {asset.cloudUrl && (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
            </div>
          )}
          {asset.error && <p className="text-red-400">{asset.error}</p>}

          <button type="button" onClick={onClear} className="text-slate-400 hover:text-white flex items-center gap-1">
            <X className="w-3 h-3" /> Remove
          </button>
        </div>
      )}
    </div>
  );
}