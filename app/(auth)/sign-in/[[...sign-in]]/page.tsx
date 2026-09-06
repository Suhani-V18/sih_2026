// app/(auth)/sign-in/[[...sign-in]]/page.tsx
"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-slate-900 border border-slate-800 shadow-2xl",
          },
        }}
      />
    </div>
  );
}