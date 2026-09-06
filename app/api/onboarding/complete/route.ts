import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
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

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress ?? null;

  const body = await req.json().catch(() => null);
  if (!body || !VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const role = body.role as RegistrationRole;
  const fullName = body.fullName?.trim() || clerkUser.firstName || "User";

  // =========================================================================
  // ROLE VALIDATIONS & PRISMA SAVE
  // =========================================================================

  try {
    if (role === "citizen") {
      const phone = body.phone?.trim();
      if (!phone || phone.length < 10) {
        return NextResponse.json({ error: "Valid phone number required." }, { status: 422 });
      }

      // Upsert Citizen record
      await prisma.citizen.upsert({
        where: { clerkUserId: userId },
        update: {
          name: fullName,
          phone,
          email: primaryEmail,
        },
        create: {
          clerkUserId: userId,
          name: fullName,
          phone,
          email: primaryEmail,
        },
      });
    }

    if (role === "mc_panchayat") {
      const govEmail = body.govEmail?.trim();
      const lgdCode = body.lgdCode?.trim();
      const district = body.district?.trim() || "Unspecified District";
      const bodyType = (body.bodyType as "PANCHAYAT" | "MUNICIPAL_CORPORATION") || "MUNICIPAL_CORPORATION";

      if (!isLikelyGovEmail(govEmail ?? "")) {
        return NextResponse.json({ error: "Government email failed validation." }, { status: 422 });
      }
      if (!lgdCode) {
        return NextResponse.json({ error: "Jurisdiction (LGD) code required." }, { status: 422 });
      }

      // Upsert LocalBody official record
      await prisma.localBody.upsert({
        where: { clerkUserId: userId },
        update: {
          name: fullName,
          officialEmail: govEmail,
          lgdCode,
          district,
          bodyType,
          isRegistered: true,
          registeredAt: new Date(),
        },
        create: {
          clerkUserId: userId,
          bodyCode: `LB-${lgdCode}-${Date.now().toString().slice(-4)}`,
          bodyType,
          name: fullName,
          district,
          officialEmail: govEmail,
          lgdCode,
          isRegistered: true,
          registeredAt: new Date(),
        },
      });
    }

    if (role === "university") {
      const instEmail = body.instEmail?.trim();
      const universityName = body.universityName?.trim();
      const designation = body.designation?.trim() || "Faculty Member";

      if (!isLikelyInstitutionalEmail(instEmail ?? "")) {
        return NextResponse.json({ error: "Institutional email failed validation." }, { status: 422 });
      }
      if (!universityName) {
        return NextResponse.json({ error: "University name required." }, { status: 422 });
      }

      const domain = instEmail.split("@")[1]?.toLowerCase();
      if (!domain) {
        return NextResponse.json({ error: "Invalid email domain." }, { status: 422 });
      }

      // 1. Find or create University by emailDomain
      const university = await prisma.university.upsert({
        where: { emailDomain: domain },
        update: {
          isRegistered: true,
        },
        create: {
          universityCode: `UNI-${Date.now().toString().slice(-6)}`,
          name: universityName,
          emailDomain: domain,
          district: "State Campus",
          officialEmail: instEmail,
          isRegistered: true,
          registeredAt: new Date(),
        },
      });

      // 2. Find or create Default University Department
      const department = await prisma.universityDepartment.upsert({
        where: {
          universityId_name: {
            universityId: university.id,
            name: "General R&D / Innovation Cell",
          },
        },
        update: {},
        create: {
          universityId: university.id,
          name: "General R&D / Innovation Cell",
          expertiseArea: "Multi-disciplinary Civic R&D",
        },
      });

      // 3. Upsert UniversityMember
      await prisma.universityMember.upsert({
        where: { clerkUserId: userId },
        update: {
          name: fullName,
          designation,
          departmentId: department.id,
          universityId: university.id,
        },
        create: {
          clerkUserId: userId,
          universityId: university.id,
          departmentId: department.id,
          name: fullName,
          designation,
        },
      });
    }

    if (role === "company") {
      const { companyEmail, cin, gstin, udyam, companyName } = body;
      if (!companyName?.trim()) {
        return NextResponse.json({ error: "Company name required." }, { status: 422 });
      }
      if (!isLikelyOfficialEmail(companyEmail ?? "")) {
        return NextResponse.json({ error: "Please use an official company email." }, { status: 422 });
      }

      let companyIdType: "GSTIN" | "CIN" | "UDYAM" = "GSTIN";
      let companyIdValue = "";

      if (gstin && isPlausibleGSTIN(gstin)) {
        companyIdType = "GSTIN";
        companyIdValue = gstin.trim();
      } else if (cin && isPlausibleCIN(cin)) {
        companyIdType = "CIN";
        companyIdValue = cin.trim();
      } else if (udyam && isPlausibleUdyam(udyam)) {
        companyIdType = "UDYAM";
        companyIdValue = udyam.trim();
      } else {
        return NextResponse.json({ error: "Provide at least one valid GSTIN, CIN, or Udyam number." }, { status: 422 });
      }

      // Upsert Company record
      await prisma.company.upsert({
        where: { clerkUserId: userId },
        update: {
          name: companyName.trim(),
          officialEmail: companyEmail.trim(),
          companyIdType,
          companyIdValue,
          isRegistered: true,
          registeredAt: new Date(),
        },
        create: {
          companyCode: `CSR-${Date.now().toString().slice(-6)}`,
          name: companyName.trim(),
          clerkUserId: userId,
          officialEmail: companyEmail.trim(),
          region: "India",
          companyIdType,
          companyIdValue,
          isRegistered: true,
          registeredAt: new Date(),
        },
      });
    }

    // =========================================================================
    // UPDATE CLERK METADATA
    // =========================================================================
    await client.users.updateUser(userId, {
      publicMetadata: {
        role,
        isModerator: false,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Onboarding persistence error:", error);
    return NextResponse.json({ error: "Failed to persist profile to database." }, { status: 500 });
  }
}