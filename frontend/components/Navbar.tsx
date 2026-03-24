"use client";

import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { CopyIcon } from "lucide-react";

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-indigo-400 transition-colors">
            <CopyIcon className="w-6 h-6 text-indigo-500" />
            <span>WebVCS</span>
          </Link>
          <div className="flex items-center gap-4">
            {!isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-neutral-800 animate-pulse" />
            ) : isSignedIn ? (
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border border-neutral-700" } }} />
            ) : (
              <SignInButton mode="modal">
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
