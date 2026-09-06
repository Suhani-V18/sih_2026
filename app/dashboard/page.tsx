import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const metadata = user?.publicMetadata as {
    role?: "citizen" | "mc_panchayat" | "university" | "company";
    onboardingComplete?: boolean;
  } | undefined;

  // 1. If onboarding is incomplete, send to onboarding
  if (!metadata?.onboardingComplete || !metadata?.role) {
    redirect("/onboarding");
  }

  // 2. Redirect dynamically based on entity role
  const roleDestinations: Record<string, string> = {
    citizen: "/my-reports",
    mc_panchayat: "/mc-panchayat/inbox",
    university: "/university/shortlist",
    company: "/company/marketplace",
  };

  const destination = roleDestinations[metadata.role] ?? "/";
  redirect(destination);
}