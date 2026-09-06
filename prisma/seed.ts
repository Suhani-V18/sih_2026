import {
    PrismaClient,
    BodyType,
    SubmitterType,
    DescriptionType,
    ProblemStatus,
    ProjectStage,
    MilestoneStatus,
    CompanyIdType,
  } from "@prisma/client";
  
  const prisma = new PrismaClient();
  
  // =========================================================================
  // 🔑 PASTE YOUR CLERK USER IDs HERE (From Clerk Dashboard -> Users)
  // =========================================================================
  const CLERK_USER_IDS = {
    citizen: "user_3IwaT3C96uGg7qOzU5Z7VGcLxIh",      // e.g. for tahreemfatima21766@gmail.com
    mc_panchayat: "user_3Ix2pmgEJ13J1roLsrxICto4AI7",     // for demo.mc@civicbridge.app
    university: "user_3Ix3YIfVOOKBnOD9CCBueV3hAcw",     // for demo.university@civicbridge.app
    company: "user_3Ix3yNcNszI1CQj2I2A83CQUVac",   // for demo.company@civicbridge.app
  };
  
  async function main() {
    console.log("🌱 Starting database seed for Sahyog Platform...");
  
    // =========================================================================
    // 0. CLEANUP PREVIOUS TEST DATA (Prevents unique constraint errors)
    // =========================================================================
    console.log("0. Cleaning up old seed/onboarding records...");
    await prisma.milestone.deleteMany();
    await prisma.projectFunding.deleteMany();
    await prisma.projectComment.deleteMany();
    await prisma.project.deleteMany();
    await prisma.problemUniversityMatch.deleteMany();
    await prisma.universityCompanyMatch.deleteMany();
    await prisma.jurisdictionNotification.deleteMany();
    await prisma.problemMedia.deleteMany();
    await prisma.problem.deleteMany();
    await prisma.universityMember.deleteMany();
    await prisma.universityDepartment.deleteMany();
    await prisma.university.deleteMany();
    await prisma.company.deleteMany();
    await prisma.localBody.deleteMany();
    await prisma.citizen.deleteMany();
  
    // =========================================================================
    // 1. SEED CITIZEN (Personal Email)
    // =========================================================================
    console.log("1. Seeding Citizen...");
  
    const citizen = await prisma.citizen.create({
      data: {
        clerkUserId: CLERK_USER_IDS.citizen,
        name: "Tahreem Fatima",
        email: "tahreemfatima21766@gmail.com",
        phone: "+919876543210",
        trustScore: 85,
      },
    });
  
    // =========================================================================
    // 2. SEED LOCAL BODIES (MC & Panchayats)
    // =========================================================================
    console.log("2. Seeding Local Bodies...");
  
    const mcBody = await prisma.localBody.create({
      data: {
        clerkUserId: CLERK_USER_IDS.mc_panchayat,
        bodyCode: "MC-HOWRAH-101",
        bodyType: BodyType.MUNICIPAL_CORPORATION,
        name: "Howrah Municipal Corporation",
        district: "Howrah",
        ward: "Ward 12",
        officialEmail: "demo.mc@civicbridge.app",
        lgdCode: "100101",
        isRegistered: true,
        registeredAt: new Date(),
        isModerator: true,
      },
    });
  
    const panchayatBody = await prisma.localBody.create({
      data: {
        bodyCode: "GP-SINGUR-202",
        bodyType: BodyType.PANCHAYAT,
        name: "Singur Gram Panchayat",
        district: "Hooghly",
        block: "Singur",
        officialEmail: "singur.panchayat@gov.in",
        lgdCode: "200202",
        isRegistered: false,
      },
    });
  
    // =========================================================================
    // 3. SEED UNIVERSITIES & DEPARTMENTS & MEMBER
    // =========================================================================
    console.log("3. Seeding Universities & Faculty Member...");
  
    const university = await prisma.university.create({
      data: {
        universityCode: "UNI-NITDGP-01",
        name: "National Institute of Technology Durgapur",
        emailDomain: "nitdgp.ac.in",
        district: "Paschim Bardhaman",
        officialEmail: "demo.university@civicbridge.app",
        isRegistered: true,
        registeredAt: new Date(),
        trustScore: 88,
      },
    });
  
    const department = await prisma.universityDepartment.create({
      data: {
        universityId: university.id,
        name: "Department of Civil & Environmental Engineering",
        expertiseArea: "Urban Drainage, Flood Prevention & Smart Structural R&D",
        specialtyCount: 12,
        activeProjects: 3,
        successfulProjects: 8,
      },
    });
  
    await prisma.universityMember.create({
      data: {
        clerkUserId: CLERK_USER_IDS.university,
        universityId: university.id,
        departmentId: department.id,
        name: "Dr. Ananya Sharma",
        designation: "Associate Professor & R&D Lead",
      },
    });
  
    // =========================================================================
    // 4. SEED COMPANIES / CSR SPONSORS
    // =========================================================================
    console.log("4. Seeding Corporate CSR Sponsors...");
  
    const company = await prisma.company.create({
      data: {
        clerkUserId: CLERK_USER_IDS.company,
        companyCode: "CSR-TATA-001",
        name: "Tata Sustainability & CSR Foundation",
        officialEmail: "demo.company@civicbridge.app",
        region: "National",
        domains: ["Infrastructure", "Clean Water", "Renewable Energy"],
        companyIdType: CompanyIdType.GSTIN,
        companyIdValue: "27AAACT2727Q1ZW",
        isRegistered: true,
        registeredAt: new Date(),
        trustScore: 95,
        successfulProjects: 14,
      },
    });
  
    // =========================================================================
    // 5. SEED CIVIC PROBLEMS
    // =========================================================================
    console.log("5. Seeding Civic Problems...");
  
    const problem1 = await prisma.problem.create({
      data: {
        problemCode: "PRB-2024-001",
        submitterType: SubmitterType.CITIZEN,
        citizenId: citizen.id,
        title: "Severe Stormwater Waterlogging & Drainage Blockade in Market Ward 12",
        descriptionType: DescriptionType.TEXT,
        descriptionText:
          "Severe waterlogging occurs after every heavy rainfall due to clogged main culverts. Local businesses affected and breeding ground for mosquitoes.",
        language: "en",
        district: "Howrah",
        ward: "Ward 12",
        lat: 22.5958,
        lng: 88.2636,
        addressText: "GT Road Crossing, Ward 12, Howrah",
        matchedBodyId: mcBody.id,
        jurisdictionMatchStatus: "MATCHED",
        aiCategory: "Stormwater Management & Civil Engineering",
        aiSeverity: 4,
        aiConfidence: 0.945,
        status: ProblemStatus.ASSIGNED,
      },
    });
  
    const problem2 = await prisma.problem.create({
      data: {
        problemCode: "PRB-2024-002",
        submitterType: SubmitterType.LOCAL_BODY,
        submittedByBodyId: mcBody.id,
        title: "Contaminated Ground Drinking Water in High-Density Residential Area",
        descriptionType: DescriptionType.TEXT,
        descriptionText:
          "High levels of arsenic and turbidity detected in public tube wells near Sector 3. Immediate filtration installation needed.",
        language: "en",
        district: "Howrah",
        ward: "Ward 12",
        lat: 22.5892,
        lng: 88.3103,
        matchedBodyId: mcBody.id,
        jurisdictionMatchStatus: "MATCHED",
        aiCategory: "Water Purification & Public Health Engineering",
        aiSeverity: 5,
        aiConfidence: 0.982,
        status: ProblemStatus.VALIDATED,
      },
    });
  
    // =========================================================================
    // 6. SEED PROJECTS & MILESTONES (CSR Marketplace Ready)
    // =========================================================================
    console.log("6. Seeding University Projects & Milestones...");
  
    await prisma.project.create({
      data: {
        problemId: problem1.id,
        universityId: university.id,
        departmentId: department.id,
        stage: ProjectStage.GATE2_PITCH,
        proposalText:
          "Modular Low-Cost Sensor-Based Automated Silt Trap & Culvert De-clogging Mechanism designed by NIT Durgapur R&D.",
        budgetEstimate: 450000,
        pitchDeckUrl: "https://example.com/pitch-deck.pdf",
        pitchVideoUrl: "https://example.com/pitch-video.mp4",
        milestones: {
          create: [
            {
              title: "Milestone 1: Prototype Fabrication & Lab Silt Trap Test",
              amount: 150000,
              orderIndex: 1,
              status: MilestoneStatus.PENDING,
            },
            {
              title: "Milestone 2: Field Installation at Ward 12 Culvert",
              amount: 200000,
              orderIndex: 2,
              status: MilestoneStatus.PENDING,
            },
            {
              title: "Milestone 3: IoT Sensor Telemetry & Citizen Handoff",
              amount: 100000,
              orderIndex: 3,
              status: MilestoneStatus.PENDING,
            },
          ],
        },
      },
    });
  
    console.log("✅ Database seeding complete!");
  }
  
  main()
    .catch((e) => {
      console.error("❌ Seeding failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });





