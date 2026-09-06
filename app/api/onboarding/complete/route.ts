import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  isPlausibleGSTIN,
  isPlausibleCIN,
  isPlausibleUdyam,
  isLikelyOfficialEmail,
  isLikelyGovEmail,
  isLikelyInstitutionalEmail,
  type RegistrationRole,
} from "@/lib/validators";

const VALID_ROLES: RegistrationRole[] = [
  "citizen",
  "mc_panchayat",
  "university",
  "company",
];

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const role = body.role as RegistrationRole;

  if (role === "mc_panchayat") {
    if (!isLikelyGovEmail(body.govEmail ?? "")) {
      return NextResponse.json(
        { error: "Government email failed validation." },
        { status: 422 }
      );
    }
    if (!body.lgdCode?.trim()) {
      return NextResponse.json({ error: "Jurisdiction code required." }, { status: 422 });
    }
  }

  if (role === "university") {
    if (!isLikelyInstitutionalEmail(body.instEmail ?? "")) {
      return NextResponse.json(
        { error: "Institutional email failed validation." },
        { status: 422 }
      );
    }
    if (!body.universityName?.trim()) {
      return NextResponse.json({ error: "University name required." }, { status: 422 });
    }
  }

  if (role === "company") {
    const { companyEmail, cin, gstin, udyam, companyName } = body;
    if (!companyName?.trim()) {
      return NextResponse.json({ error: "Company name required." }, { status: 422 });
    }
    if (!isLikelyOfficialEmail(companyEmail ?? "")) {
      return NextResponse.json(
        { error: "Please use an official company email, not a personal webmail address." },
        { status: 422 }
      );
    }
    const hasOneId = Boolean(cin || gstin || udyam);
    if (!hasOneId) {
      return NextResponse.json(
        { error: "Provide at least one of GSTIN, CIN, or Udyam Registration Number." },
        { status: 422 }
      );
    }
    if (cin && !isPlausibleCIN(cin)) {
      return NextResponse.json({ error: "CIN format is invalid." }, { status: 422 });
    }
    if (gstin && !isPlausibleGSTIN(gstin)) {
      return NextResponse.json({ error: "GSTIN checksum is invalid." }, { status: 422 });
    }
    if (udyam && !isPlausibleUdyam(udyam)) {
      return NextResponse.json({ error: "Udyam number format is invalid." }, { status: 422 });
    }
  }

  const client = await clerkClient();

  await client.users.updateUser(userId, {
    publicMetadata: {
      role,
      isModerator: false,
      onboardingComplete: true,
      companyIdFormatChecked: role === "company",
    },
  });

  // TODO: persist remaining profile fields to your DB (Jurisdiction table,
  // Company table, etc.)

  return NextResponse.json({ ok: true });
}