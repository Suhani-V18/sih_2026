import { isDemoEmail, isDemoCompanyId } from "./demo-allowlist";

// GSTIN format + checksum
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

// CIN format
const CIN_FORMAT = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;

export function isPlausibleCIN(raw: string): boolean {
  if (isDemoCompanyId(raw)) return true;
  return CIN_FORMAT.test(raw.trim().toUpperCase());
}

// Udyam format
const UDYAM_FORMAT = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;

export function isPlausibleUdyam(raw: string): boolean {
  if (isDemoCompanyId(raw)) return true;
  return UDYAM_FORMAT.test(raw.trim().toUpperCase());
}

// Consumer email rejection
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

// Government email heuristic
const GOV_EMAIL_PATTERNS = [/\.gov\.in$/i, /\.nic\.in$/i, /\.gob\.in$/i];

export function isLikelyGovEmail(email: string): boolean {
  if (isDemoEmail(email)) return true;

  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return GOV_EMAIL_PATTERNS.some((pattern) => pattern.test(domain));
}

// Institutional email heuristic
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