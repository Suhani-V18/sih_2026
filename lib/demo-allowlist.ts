/**
 * Demo/judge accounts that skip real-world validation during presentations.
 *
 * Controlled entirely by NEXT_PUBLIC_DEMO_MODE. Set it to "true" only in
 * your local/demo environment — never in production. When false or unset,
 * every one of these functions returns false and all validation is strict
 * for everyone, no exceptions.
 */

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// One demo account per role. Add more here if you need multiple per role.
const DEMO_EMAILS: Record<string, string> = {
  mc_panchayat: "demo.mc@civicbridge.app",
  university: "demo.university@civicbridge.app",
  company: "demo.company@civicbridge.app",
};

const DEMO_COMPANY_IDS = new Set(["DEMO0000GSTIN", "DEMO0000000CIN", "UDYAM-DM-00-0000000"]);

export function isDemoEmail(email: string): boolean {
  if (!DEMO_MODE) return false;
  const normalized = email.trim().toLowerCase();
  return Object.values(DEMO_EMAILS).includes(normalized);
}

export function isDemoCompanyId(value: string): boolean {
  if (!DEMO_MODE) return false;
  return DEMO_COMPANY_IDS.has(value.trim().toUpperCase());
}

export function getDemoEmailFor(role: keyof typeof DEMO_EMAILS): string | null {
  if (!DEMO_MODE) return null;
  return DEMO_EMAILS[role] ?? null;
}

export const DEMO_MODE_ENABLED = DEMO_MODE;