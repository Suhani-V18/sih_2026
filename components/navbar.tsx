 
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { Handshake, PlusCircle, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  // Hide Navbar on the main landing page ("/")
  if (
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ){
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-indigo-600 group-hover:bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20 transition-all">
            <Handshake className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">
            Sahyog<span className="text-indigo-400">.</span>
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          

          {isLoaded && (
            <>
              {isSignedIn ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" /> Dashboard
                  </Link>
                  {/* 👈 Updated: Removed deprecated afterSignOutUrl */}
                  <UserButton />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  );
}