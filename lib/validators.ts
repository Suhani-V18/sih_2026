/**
 * Registration-time plausibility checks.
 *
 * These are deliberately NOT real KYC. They catch typos, garbage input, and
 * obviously fake entries for free, client-side, with zero API calls.
 * Real verification (GST/CIN lookup by MC-Panchayat, escrow KYC) happens
 * later, at the funding gateway.
 *
 * Demo accounts (see lib/demo-allowlist.ts) bypass these checks ONLY when
 * NEXT_PUBLIC_DEMO_MODE=true. Everyone else, always, goes through the real
 * checks below.
 */

import { isDemoEmail, isDemoCompanyId } from "./demo-allowlist";

// ---------------------------------------------------------------------------
// GSTIN — format + checksum (Luhn mod-36 variant used by GSTN)
// ---------------------------------------------------------------------------

const GSTIN_FORMAT = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const GSTIN_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function isPlausibleGSTIN(raw: string): boolean {
  if (isDemoCompanyId(raw)) return true;

  const gstin = raw.trim().toUpperCase();
  if (!GSTIN_FORMAT.test(gstin)) return false;

  let factor = 2;
  let sum = 0;
  for (let i = gstin.length - 2; i >= 0; i--) {
    const codePoint = GSTIN_ALPHABET.indexOf(gstin[i]);
    let digit = factor * codePoint;
    digit = Math.floor(digit / 36) + (digit % 36);
    sum += digit;
    factor = factor === 2 ? 1 : 2;
  }
  const checkCodePoint = (36 - (sum % 36)) % 36;
  return GSTIN_ALPHABET[checkCodePoint] === gstin[gstin.length - 1];
}

// ---------------------------------------------------------------------------
// CIN — structural format only (no public checksum algorithm)
// ---------------------------------------------------------------------------

const CIN_FORMAT = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;

export function isPlausibleCIN(raw: string): boolean {
  if (isDemoCompanyId(raw)) return true;
  return CIN_FORMAT.test(raw.trim().toUpperCase());
}

// ---------------------------------------------------------------------------
// Udyam Registration Number — UDYAM-XX-00-0000000
// ---------------------------------------------------------------------------

const UDYAM_FORMAT = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;

export function isPlausibleUdyam(raw: string): boolean {
  if (isDemoCompanyId(raw)) return true;
  return UDYAM_FORMAT.test(raw.trim().toUpperCase());
}

// ---------------------------------------------------------------------------
// Free-email domain check — reject consumer webmail for company/official
// email fields.
// ---------------------------------------------------------------------------

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.co.in",
  "outlook.com",
  "hotmail.com",
  "rediffmail.com",
  "icloud.com",
  "protonmail.com",
  "aol.com",
]);

export function isLikelyOfficialEmail(email: string): boolean {
  if (isDemoEmail(email)) return true;

  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS.has(domain);
}

// ---------------------------------------------------------------------------
// Government email heuristic for MC / Panchayat officials.
// ---------------------------------------------------------------------------

const GOV_EMAIL_PATTERNS = [/\.gov\.in$/i, /\.nic\.in$/i, /\.gob\.in$/i];

export function isLikelyGovEmail(email: string): boolean {
  if (isDemoEmail(email)) return true;

  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return GOV_EMAIL_PATTERNS.some((pattern) => pattern.test(domain));
}

// ---------------------------------------------------------------------------
// Institutional email heuristic for universities.
// ---------------------------------------------------------------------------

const INSTITUTIONAL_EMAIL_PATTERNS = [/\.ac\.in$/i, /\.edu$/i, /\.edu\.in$/i];

export function isLikelyInstitutionalEmail(email: string): boolean {
  if (isDemoEmail(email)) return true;

  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return INSTITUTIONAL_EMAIL_PATTERNS.some((pattern) => pattern.test(domain));
}

export type RegistrationRole =
  | "citizen"
  | "mc_panchayat"
  | "university"
  | "company";