"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Handshake } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-16">
      {/* Branding Header */}
      <div className="text-center mb-8 max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="bg-indigo-600 group-hover:bg-indigo-500 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20 transition-all">
            <Handshake className="w-6 h-6" />
          </div>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
          Sahyog Platform
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Welcome to Sahyog
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1.5">
          Sign in to access your civic innovation portal
        </p>
      </div>

      {/* Clerk Component */}
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard" 
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl rounded-2xl",
          },
        }}
      />
    </div>
  );
}