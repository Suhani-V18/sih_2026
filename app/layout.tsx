import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sahyog Platform | Civic Innovation Portal",
  description: "Connecting Citizens, Municipalities, Universities & Corporate CSR Sponsors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className="dark">
        <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}