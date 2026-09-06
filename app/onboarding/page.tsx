"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  isPlausibleGSTIN,
  isPlausibleCIN,
  isPlausibleUdyam,
  isLikelyOfficialEmail,
  isLikelyGovEmail,
  isLikelyInstitutionalEmail,
} from "@/lib/validators";

type FieldState = { value: string; touched: boolean };

const emptyField = (): FieldState => ({ value: "", touched: false });

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const role = searchParams.get("role");

  const [fullName, setFullName] = useState(emptyField());
  const [phone, setPhone] = useState(emptyField());
  const [govEmail, setGovEmail] = useState(emptyField());
  const [lgdCode, setLgdCode] = useState(emptyField());
  const [instEmail, setInstEmail] = useState(emptyField());
  const [universityName, setUniversityName] = useState(emptyField());
  const [designation, setDesignation] = useState(emptyField());
  const [companyName, setCompanyName] = useState(emptyField());
  const [companyEmail, setCompanyEmail] = useState(emptyField());
  const [cin, setCin] = useState(emptyField());
  const [gstin, setGstin] = useState(emptyField());
  const [udyam, setUdyam] = useState(emptyField());

  const govEmailValid = useMemo(() => isLikelyGovEmail(govEmail.value), [govEmail.value]);
  const instEmailValid = useMemo(() => isLikelyInstitutionalEmail(instEmail.value), [instEmail.value]);
  const companyEmailValid = useMemo(() => isLikelyOfficialEmail(companyEmail.value), [companyEmail.value]);
  const cinValid = useMemo(() => cin.value === "" || isPlausibleCIN(cin.value), [cin.value]);
  const gstinValid = useMemo(() => gstin.value === "" || isPlausibleGSTIN(gstin.value), [gstin.value]);
  const udyamValid = useMemo(() => udyam.value === "" || isPlausibleUdyam(udyam.value), [udyam.value]);
  const hasOneCompanyId = cin.value || gstin.value || udyam.value;

  if (!isLoaded) return null;

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 px-4 text-center">
        We couldn't find your selected role. Please{" "}
        <a href="/sign-up" className="text-indigo-400 hover:underline ml-1">
          start sign-up again
        </a>
        .
      </div>
    );
  }

  const canSubmit = (() => {
    if (!fullName.value.trim()) return false;
    switch (role) {
      case "citizen":
        return phone.value.trim().length >= 10;
      case "mc_panchayat":
        return govEmailValid && lgdCode.value.trim().length > 0;
      case "university":
        return instEmailValid && universityName.value.trim().length > 0;
      case "company":
        return (
          companyName.value.trim().length > 0 &&
          companyEmailValid &&
          hasOneCompanyId &&
          cinValid &&
          gstinValid &&
          udyamValid
        );
      default:
        return false;
    }
  })();

  async function handleSubmit() {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          fullName: fullName.value,
          phone: phone.value,
          govEmail: govEmail.value,
          lgdCode: lgdCode.value,
          instEmail: instEmail.value,
          universityName: universityName.value,
          designation: designation.value,
          companyName: companyName.value,
          companyEmail: companyEmail.value,
          cin: cin.value,
          gstin: gstin.value,
          udyam: udyam.value,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Please try again.");
      }
      const dest = {
        citizen: "/my-reports",
        mc_panchayat: "/mc-panchayat/inbox",
        university: "/university/shortlist",
        company: "/company/marketplace",
      }[role as string] ?? "/";
      router.push(dest);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-16">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-bold text-white mb-2">Finish setting up your account</h1>
        <p className="text-sm text-slate-400 mb-8">
          A few details so we can route things to the right place.
        </p>

        <div className="space-y-5">
          <Field label="Full name">
            <input
              className="onboarding-input"
              value={fullName.value}
              onChange={(e) => setFullName({ value: e.target.value, touched: true })}
              placeholder="As it should appear on your account"
            />
          </Field>

          {role === "citizen" && (
            <Field label="Phone number" hint="We'll send an OTP to verify this number.">
              <input
                className="onboarding-input"
                value={phone.value}
                onChange={(e) => setPhone({ value: e.target.value, touched: true })}
                placeholder="10-digit mobile number"
                inputMode="numeric"
              />
            </Field>
          )}

          {role === "mc_panchayat" && (
            <>
              <Field
                label="Official government email"
                hint="Must be a .gov.in or .nic.in address."
                error={govEmail.touched && !govEmailValid ? "Doesn't look like a government email." : undefined}
              >
                <input
                  className="onboarding-input"
                  value={govEmail.value}
                  onChange={(e) => setGovEmail({ value: e.target.value, touched: true })}
                  placeholder="name@yourdistrict.gov.in"
                />
              </Field>
              <Field label="Jurisdiction (LGD code)" hint="Your official Local Government Directory code.">
                <input
                  className="onboarding-input"
                  value={lgdCode.value}
                  onChange={(e) => setLgdCode({ value: e.target.value, touched: true })}
                  placeholder="e.g. 123456"
                />
              </Field>
            </>
          )}

          {role === "university" && (
            <>
              <Field
                label="Institutional email"
                hint="Must be your university's official domain."
                error={instEmail.touched && !instEmailValid ? "Doesn't look like an institutional email." : undefined}
              >
                <input
                  className="onboarding-input"
                  value={instEmail.value}
                  onChange={(e) => setInstEmail({ value: e.target.value, touched: true })}
                  placeholder="name@youruniversity.ac.in"
                />
              </Field>
              <Field label="University name">
                <input
                  className="onboarding-input"
                  value={universityName.value}
                  onChange={(e) => setUniversityName({ value: e.target.value, touched: true })}
                  placeholder="Full institution name"
                />
              </Field>
              <Field label="Designation" hint="e.g. Assistant Professor, HOD">
                <input
                  className="onboarding-input"
                  value={designation.value}
                  onChange={(e) => setDesignation({ value: e.target.value, touched: true })}
                />
              </Field>
            </>
          )}

          {role === "company" && (
            <>
              <Field label="Company name">
                <input
                  className="onboarding-input"
                  value={companyName.value}
                  onChange={(e) => setCompanyName({ value: e.target.value, touched: true })}
                />
              </Field>
              <Field
                label="Official company email"
                hint="A generic Gmail/Yahoo address won't pass this check."
                error={companyEmail.touched && !companyEmailValid ? "Please use your company domain email." : undefined}
              >
                <input
                  className="onboarding-input"
                  value={companyEmail.value}
                  onChange={(e) => setCompanyEmail({ value: e.target.value, touched: true })}
                  placeholder="name@yourcompany.com"
                />
              </Field>
              <Field
                label="GSTIN"
                hint="Optional here if you provide CIN or Udyam instead."
                error={gstin.touched && gstin.value && !gstinValid ? "That GSTIN doesn't check out." : undefined}
              >
                <input
                  className="onboarding-input"
                  value={gstin.value}
                  onChange={(e) => setGstin({ value: e.target.value, touched: true })}
                  placeholder="15-character GSTIN"
                />
              </Field>
              <Field
                label="CIN"
                hint="Optional here if you provide GSTIN or Udyam instead."
                error={cin.touched && cin.value && !cinValid ? "That CIN format looks off." : undefined}
              >
                <input
                  className="onboarding-input"
                  value={cin.value}
                  onChange={(e) => setCin({ value: e.target.value, touched: true })}
                  placeholder="21-character CIN"
                />
              </Field>
              <Field
                label="Udyam Registration Number"
                hint="Optional here if you provide GSTIN or CIN instead."
                error={udyam.touched && udyam.value && !udyamValid ? "That Udyam number format looks off." : undefined}
              >
                <input
                  className="onboarding-input"
                  value={udyam.value}
                  onChange={(e) => setUdyam({ value: e.target.value, touched: true })}
                  placeholder="UDYAM-XX-00-0000000"
                />
              </Field>
              {!hasOneCompanyId && (
                <p className="text-xs text-amber-400">
                  Provide at least one of GSTIN, CIN, or Udyam Registration Number.
                </p>
              )}
              <p className="text-xs text-slate-500 leading-relaxed">
                These are format-checked now for free. Full verification against government
                records happens later, when a project reaches the funding stage.
              </p>
            </>
          )}

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold transition-all"
          >
            {submitting ? "Saving…" : "Complete sign-up"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .onboarding-input {
          width: 100%;
          background: rgb(15 23 42);
          border: 1px solid rgb(30 41 59);
          border-radius: 0.75rem;
          padding: 0.65rem 0.9rem;
          font-size: 0.875rem;
          color: white;
        }
        .onboarding-input:focus {
          outline: none;
          border-color: rgb(99 102 241);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-200 mb-1.5">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-red-400 mt-1">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-slate-500 mt-1">{hint}</span>
      ) : null}
    </label>
  );
}